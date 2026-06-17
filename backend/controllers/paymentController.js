const { v4: uuidv4 } = require('uuid');
const { Order, User, sequelize } = require('../models');
const { createOrder, fetchOrderPayments } = require('../services/cashfreeService');

/**
 * POST /api/payment/create-order
 * Creates a Cashfree order with status PENDING and returns the
 * payment_session_id the frontend needs to open checkout.
 */
const createOrderHandler = async (req, res, next) => {
  const userId = req.user.id;
  const amount = parseFloat(process.env.PREMIUM_AMOUNT || '199.00');

  // Generate our own order id — prefixed for easy identification in
  // the Cashfree dashboard, and uuid ensures no collisions.
  const orderId = `order_${uuidv4()}`;

  const transaction = await sequelize.transaction();

  try {
    // Record the order as PENDING BEFORE calling Cashfree, so that
    // even if the Cashfree call fails immediately after, we have a
    // row to inspect/retry rather than a payment with no DB record.
    await Order.create({ orderId, amount, status: 'PENDING', userId }, { transaction });

    const cashfreeOrder = await createOrder({
      orderId,
      amount,
      customerId: userId,
      customerEmail: req.user.email,
    });

    await transaction.commit();

    return res.status(201).json({
      orderId,
      paymentSessionId: cashfreeOrder.payment_session_id,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * POST /api/payment/verify
 * Called by the frontend after the Cashfree checkout closes —
 * but the actual success/failure determination comes ONLY from
 * calling Cashfree's API directly, never from what the frontend claims.
 */
const verifyPaymentHandler = async (req, res, next) => {
  const { orderId } = req.body;
  const userId = req.user.id;

  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findOne({ where: { orderId, userId }, transaction });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: { message: 'Order not found' } });
    }

    // If we've already processed this order (e.g., user double-clicked,
    // or webhook + manual verify both fired), don't re-process.
    if (order.status !== 'PENDING') {
      await transaction.commit();
      return res.status(200).json({
        success: order.status === 'SUCCESSFUL',
        status: order.status,
        alreadyProcessed: true,
      });
    }

    const payments = await fetchOrderPayments(orderId);

    // An order can have multiple payment attempts (e.g., one failed,
    // user retried). We only care if ANY attempt succeeded.
    const successfulPayment = payments.find((p) => p.payment_status === 'SUCCESS');
    const newStatus = successfulPayment ? 'SUCCESSFUL' : 'FAILED';

    order.status = newStatus;
    await order.save({ transaction });

    if (newStatus === 'SUCCESSFUL') {
      await User.update({ isPremium: true }, { where: { id: userId }, transaction });
    }

    await transaction.commit();

    return res.status(200).json({
      success: newStatus === 'SUCCESSFUL',
      status: newStatus,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = { createOrderHandler, verifyPaymentHandler };