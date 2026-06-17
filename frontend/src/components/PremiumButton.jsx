import { useState } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import { createPaymentOrder, verifyPayment } from '../api/paymentApi';

const PremiumButton = ({ onUpgradeSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message }

  const handleBuyPremium = async () => {
    setProcessing(true);
    setAlert(null);

    try {
      const { data: orderData } = await createPaymentOrder();
      const { orderId, paymentSessionId } = orderData;

      const cashfree = await load({
        mode: import.meta.env.VITE_CASHFREE_ENV || 'sandbox',
      });

      // Opens the Cashfree checkout as a modal. The promise resolves
      // when the checkout flow closes — by success, failure, OR the
      // user dismissing it. We must NOT treat resolution as success;
      // we always re-verify with our backend next.
      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_modal',
      });

      const { data: verifyData } = await verifyPayment(orderId);

      if (verifyData.success) {
        setAlert({ type: 'success', message: 'Transaction successful!' });
        onUpgradeSuccess();
      } else {
        setAlert({ type: 'error', message: 'TRANSACTION FAILED' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'TRANSACTION FAILED' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleBuyPremium}
        disabled={processing}
        className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm
          font-semibold text-white shadow-sm hover:bg-amber-400 transition-colors
          disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing…' : '✨ Buy premium membership'}
      </button>

      {alert && (
        <p
          role="alert"
          className={`mt-2 text-sm px-3 py-2 rounded-md border ${
            alert.type === 'success'
              ? 'text-green-700 bg-green-50 border-green-200'
              : 'text-red-700 bg-red-50 border-red-200'
          }`}
        >
          {alert.message}
        </p>
      )}
    </div>
  );
};

export default PremiumButton;