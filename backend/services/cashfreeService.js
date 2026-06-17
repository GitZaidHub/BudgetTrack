const { Cashfree, CFEnvironment } = require('cashfree-pg');

const cashfree = new Cashfree(
  process.env.CASHFREE_ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

/**
 * Creates a Cashfree order and returns the payment_session_id
 * the frontend needs to open the checkout widget.
 * @param {{ orderId: string, amount: number, customerId: string, customerEmail: string, customerPhone: string }} params
 */
const createOrder = async ({ orderId, amount, customerId, customerEmail, customerPhone }) => {
  const request = {
    order_id: orderId,
    order_amount: amount,
    order_currency: 'INR',
    customer_details: {
      customer_id: String(customerId),
      customer_email: customerEmail,
      // Cashfree sandbox requires a phone number; use a placeholder
      // format if you don't collect one at signup.
      customer_phone: customerPhone || '9999999999',
    },
  };

  const response = await cashfree.PGCreateOrder(request);
  return response.data; // contains payment_session_id, order_id, etc.
};

/**
 * Fetches the latest payment status for an order directly from Cashfree.
 * This is the ONLY source of truth for whether a payment succeeded —
 * the frontend's reported outcome is never trusted on its own.
 *
 * Per the latest Cashfree SDK, this takes only orderId (no date param).
 * @param {string} orderId
 * @returns {Promise<Array>} array of payment attempt objects
 */
const fetchOrderPayments = async (orderId) => {
  const response = await cashfree.PGOrderFetchPayments(orderId);
  return response.data;
};

module.exports = { createOrder, fetchOrderPayments };