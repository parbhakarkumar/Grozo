import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Lock, 
  X, 
  Sparkles,
  QrCode,
  Smartphone
} from "lucide-react";
import { assets } from "../assets/assets";

const UpiPaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  currency = "₹", 
  onPaymentSuccess, 
  isSubmitting = false 
}) => {
  const [timeLeft, setTimeLeft] = useState(480); // 8 minutes session timer
  const [verifying, setVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0); // 0: idle, 1: verifying, 2: success

  // 8-minute countdown timer
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(480);
      setVerifying(false);
      setVerificationStep(0);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerifyAndSubmit = async (e) => {
    e.preventDefault();
    if (verifying || isSubmitting) return;

    setVerifying(true);
    setVerificationStep(1);

    try {
      // Call parent payment verification callback which executes backend verification
      if (onPaymentSuccess) {
        await onPaymentSuccess();
      }
      setVerificationStep(2);
    } catch (err) {
      setVerifying(false);
      setVerificationStep(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-slate-800 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">UPI QR Payment Gateway</h3>
              <p className="text-[11px] text-cyan-100 flex items-center gap-1 font-light">
                <Lock className="w-3 h-3" /> 256-Bit SSL Encrypted • NPCI Verified
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={verifying || isSubmitting}
            className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center text-white transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close payment modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Timer & Amount Banner */}
        <div className="bg-zinc-50 dark:bg-slate-800/80 px-6 py-3.5 border-b border-zinc-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-500 dark:text-slate-400 uppercase tracking-wider font-semibold block">
              Payable Amount
            </span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 font-sans tracking-tight">
              {currency}{amount}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 px-3 py-1.5 rounded-xl">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <div className="text-right">
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium block leading-none">
                QR expires in
              </span>
              <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-200">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body: Strictly ONLY the QR Code */}
        <div className="p-6 sm:p-7 space-y-6 text-center">
          
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <div className="relative w-56 h-56 sm:w-60 sm:h-60 rounded-3xl bg-white p-3 shadow-lg border-2 border-zinc-200/90 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                <img
                  src="/qr_code_only.png"
                  alt="Scan QR Code to Pay"
                  className="w-full h-full object-contain rounded-2xl"
                  onError={(e) => {
                    // Fallback to upi_qr_code if needed
                    e.target.onerror = null;
                    e.target.src = assets?.upi_qr_code || "/upi_qr_code.jpg";
                  }}
                />

                {/* Animated Laser Scanning Beam */}
                <div className="pointer-events-none absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_14px_#06b6d4] animate-[scan_2.5s_ease-in-out_infinite]"></div>

                {/* Corner Frame Accents */}
                <div className="pointer-events-none absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500 rounded-tl"></div>
                <div className="pointer-events-none absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500 rounded-tr"></div>
                <div className="pointer-events-none absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500 rounded-bl"></div>
                <div className="pointer-events-none absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500 rounded-br"></div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-slate-200">
              <QrCode className="w-4 h-4 text-cyan-600" />
              <span>Scan QR Code with any UPI App</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-slate-400 mt-0.5">
              Open GPay, PhonePe, Paytm, BHIM, or any banking app to scan & pay
            </p>
          </div>

          {/* Supported UPI Apps Badges */}
          <div className="pt-1">
            <div className="flex items-center justify-center flex-wrap gap-1.5 text-[10px] font-semibold text-zinc-600 dark:text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-slate-800 border border-zinc-200/80 dark:border-slate-700">Google Pay</span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-slate-800 border border-zinc-200/80 dark:border-slate-700">PhonePe</span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-slate-800 border border-zinc-200/80 dark:border-slate-700">Paytm</span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-slate-800 border border-zinc-200/80 dark:border-slate-700">BHIM UPI</span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-slate-800 border border-zinc-200/80 dark:border-slate-700">Cred</span>
            </div>
          </div>

          {/* Verification Status Display */}
          {verifying && (
            <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center gap-3 animate-pulse">
              {verificationStep === 1 && (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold text-cyan-900 dark:text-cyan-200">
                    Verifying payment with gateway & confirming order...
                  </span>
                </>
              )}
              {verificationStep === 2 && (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Payment Verified! Order Confirmed.
                  </span>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <form onSubmit={handleVerifyAndSubmit} className="space-y-2.5 pt-2">
            <button
              type="submit"
              disabled={verifying || isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:from-zinc-400 disabled:to-zinc-400 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-2xl shadow-lg transition-all active:scale-[0.99] disabled:cursor-not-allowed cursor-pointer"
            >
              {verifying || isSubmitting ? (
                <span>Verifying Payment...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>I Have Paid — Verify & Confirm Order</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={verifying || isSubmitting}
              className="w-full text-center text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-slate-400 dark:hover:text-slate-200 py-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel Payment (Order Will Not Be Placed)
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default UpiPaymentModal;
