import React, { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

const NewsletterBox = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast.success("Welcome to Cartivo VIP! Your 20% code is CARTIVO20", {
      position: "bottom-center",
      autoClose: 4000,
    });
    setEmail("");
  };


  return (
    <section className="my-16 sm:my-24 relative overflow-hidden rounded-3xl bg-zinc-950 text-white p-8 sm:p-14 lg:p-16 border border-zinc-800 shadow-2xl">
      {/* Background Decorative Rings */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-zinc-800/30 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-zinc-800/20 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-[10px] font-semibold tracking-widest text-zinc-300 uppercase mb-4">
          <Mail className="w-3 h-3 text-emerald-400" />
          <span>Exclusive Insider Access</span>
        </div>

        {/* Headline */}
        <h3 className="font-editorial text-3xl sm:text-4xl text-white font-normal mb-3 leading-tight">
          Join The Private Circle & Enjoy <span className="italic">20% Off</span>
        </h3>

        {/* Subtitle */}
        <p className="text-zinc-400 text-xs sm:text-sm font-light max-w-lg mb-8 leading-relaxed">
          Be the first to preview seasonal drops, private archive sales, and bespoke capsule collections directly in your inbox.
        </p>

        {/* Form */}
        {subscribed ? (
          <div className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-zinc-900 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>You're in! Check your inbox for your 20% welcome promo code.</span>
          </div>
        ) : (
          <form
            onSubmit={handleNewsletter}
            className="w-full max-w-md flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl sm:rounded-full bg-zinc-900 border border-zinc-700/80 focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-700/50 transition-all"
          >
            <div className="w-full flex items-center pl-4 gap-2">
              <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
              <input
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none text-xs sm:text-sm text-white placeholder:text-zinc-500 py-2.5"
                type="email"
                placeholder="Enter your email address"
              />
            </div>
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold tracking-wider uppercase px-7 py-3 rounded-xl sm:rounded-full transition-all shrink-0 active:scale-95"
              type="submit"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <p className="text-[11px] text-zinc-500 mt-4 font-light">
          No spam, ever. Unsubscribe at any time with a single click.
        </p>
      </div>
    </section>
  );
};

export default NewsletterBox;

