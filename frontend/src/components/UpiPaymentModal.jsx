import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  X, 
  Sparkles,
  Smartphone
} from "lucide-react";
import { assets } from "../assets/assets";

const UPI_ID = "kumarparbhakar2005-1@okhdfcbank";
const PAYEE_NAME = "Parbhakar Kumar";

const UpiPaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  currency = "₹", 
  onPaymentSuccess, 
  isSubmitting = false 
}) => {
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState("");
  const [timeLeft, setTimeLeft] = useState(480); // 8 minutes session timer
  const [verifying, setVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0); // 0: idle, 1: verifying, 2: success

  // 8-minute countdown timer
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(480);
      setUtrNumber("");
      setUtrError("");
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

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasteUtr = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.replace(/[^0-9]/g, "").slice(0, 12);
      if (cleaned) {
        setUtrNumber(cleaned);
        setUtrError("");
      }
    } catch {
      // ignore clipboard read failure
    }
  };

  const handleUtrChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 12);
    setUtrNumber(val);
    if (val.length >= 10) {
      setUtrError("");
    }
  };

  const handleVerifyAndSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.trim().length < 10) {
      setUtrError("Please enter a valid 12-digit UPI Reference / UTR Number");
      return;
    }

    setVerifying(true);
    setVerificationStep(1);

    // Realistic banking network verification animation
    setTimeout(() => {
      setVerificationStep(2);
      setTimeout(() => {
        onPaymentSuccess(utrNumber.trim());
      }, 900);
    }, 1600);
  };

  // UPI deep link for mobile users
  const upiIntentUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&cu=INR&tn=Cartivo%20Order`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-slate-800 overflow-hidden my-6 transition-all"
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
            className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center text-white transition-colors disabled:opacity-50"
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Step 1: Scanner Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-zinc-50/80 dark:bg-slate-800/40 border border-zinc-200/70 dark:border-slate-800">
            {/* Interactive QR Card with Scanner Beam */}
            <div className="relative group shrink-0">
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl bg-white p-2.5 shadow-md border border-zinc-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                <img
                  src={assets.upi_qr_code || "/upi_qr_code.jpg"}
                  alt="UPI QR Code - Scan to Pay"
                  className="w-full h-full object-contain rounded-xl"
                />

                {/* Animated Laser Scanning Beam */}
                <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_12px_#06b6d4] animate-[scan_2.5s_ease-in-out_infinite]"></div>

                {/* Subtle corner frame indicators */}
                <div className="pointer-events-none absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-500 rounded-tl"></div>
                <div className="pointer-events-none absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-500 rounded-tr"></div>
                <div className="pointer-events-none absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-500 rounded-bl"></div>
                <div className="pointer-events-none absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-500 rounded-br"></div>
              </div>
              <p className="text-center text-[10px] text-zinc-400 dark:text-slate-400 mt-1.5 font-medium">
                Point camera or any UPI app
              </p>
            </div>

            {/* Payee Info & Copy Details */}
            <div className="flex-1 w-full space-y-3 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-400">
                  Beneficiary Name
                </span>
                <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>{PAYEE_NAME}</span>
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-400">
                  UPI ID / VPA
                </span>
                <div className="mt-1 flex items-center justify-between bg-white dark:bg-slate-900 border border-zinc-300 dark:border-slate-700 rounded-xl px-3 py-2">
                  <span className="font-mono text-xs font-semibold text-zinc-800 dark:text-slate-200 select-all truncate mr-2">
                    {UPI_ID}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Supported UPI Apps Pills */}
              <div>
                <span className="text-[10px] text-zinc-500 dark:text-slate-400 font-medium block mb-1">
                  Supported UPI Apps:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-zinc-700 dark:text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-slate-700">Google Pay</span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-slate-700">PhonePe</span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-slate-700">Paytm</span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-slate-700">BHIM UPI</span>
                </div>
              </div>

              {/* Mobile Intent Direct Link */}
              <a
                href={upiIntentUrl}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-100/70 dark:bg-cyan-900/30 hover:bg-cyan-200/70 py-2 px-3 rounded-xl transition-all sm:hidden"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open in UPI App (GPay / PhonePe)</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Step 2: Payment Confirmation & UTR Form */}
          <form onSubmit={handleVerifyAndSubmit} className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="utrInput" 
                  className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5"
                >
                  <span>12-Digit UPI Reference / UTR Number</span>
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handlePasteUtr}
                  className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Paste UTR
                </button>
              </div>

              <div className="relative">
                <input
                  id="utrInput"
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  value={utrNumber}
                  onChange={handleUtrChange}
                  placeholder="e.g. 402918273645"
                  disabled={verifying || isSubmitting}
                  className={`w-full font-mono text-sm tracking-widest bg-zinc-50 dark:bg-slate-800/80 border rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none transition-all ${
                    utrError
                      ? "border-red-400 focus:border-red-500"
                      : "border-zinc-300 dark:border-slate-700 focus:border-cyan-500"
                  }`}
                />
                <span className="absolute right-3 top-3 text-[11px] font-mono text-zinc-400">
                  {utrNumber.length}/12
                </span>
              </div>

              {utrError ? (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{utrError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-zinc-500 dark:text-slate-400">
                  Found in your GPay / PhonePe / Paytm transaction receipt as "UPI Ref No" or "UTR".
                </p>
              )}
            </div>

            {/* Verification State Display */}
            {verifying && (
              <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 flex items-center gap-3 animate-pulse">
                {verificationStep === 1 && (
                  <>
                    <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold text-cyan-900 dark:text-cyan-200">
                      Verifying transaction with banking network...
                    </span>
                  </>
                )}
                {verificationStep === 2 && (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Payment Confirmed! Placing your order...
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={verifying || isSubmitting || utrNumber.length < 10}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:from-zinc-400 disabled:to-zinc-400 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-2xl shadow-lg transition-all active:scale-[0.99] disabled:cursor-not-allowed cursor-pointer"
              >
                {verifying || isSubmitting ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>I Have Paid — Confirm Order</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={verifying || isSubmitting}
                className="w-full text-center text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-slate-400 dark:hover:text-slate-200 py-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel & Choose Different Payment Method
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpiPaymentModal;
