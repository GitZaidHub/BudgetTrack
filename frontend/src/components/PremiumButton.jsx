import { useState } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import { createPaymentOrder, verifyPayment } from '../api/paymentApi';
import { useToast } from '../context/ToastContext';
import { Sparkles, Loader2 } from 'lucide-react';

const PremiumButton = ({ onUpgradeSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  const handleBuyPremium = async () => {
    setProcessing(true);

    try {
      const { data: orderData } = await createPaymentOrder();
      const { orderId, paymentSessionId } = orderData;

      const cashfree = await load({
        mode: import.meta.env.VITE_CASHFREE_ENV || 'sandbox',
      });

      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_modal',
      });

      const { data: verifyData } = await verifyPayment(orderId);

      if (verifyData.success) {
        showToast('Membership upgraded successfully!', 'success');
        onUpgradeSuccess();
      } else {
        showToast('Verification failed. Payment not confirmed.', 'error');
      }
    } catch (err) {
      showToast('Transaction was cancelled or failed.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button
      onClick={handleBuyPremium}
      disabled={processing}
      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs
        font-bold text-white shadow-lg shadow-amber-500/10 hover:from-amber-400 hover:to-amber-550 transition-all
        disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97] select-none"
    >
      {processing ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 fill-white" />
      )}
      <span>{processing ? 'Processing...' : 'Upgrade to Premium'}</span>
    </button>
  );
};

export default PremiumButton;