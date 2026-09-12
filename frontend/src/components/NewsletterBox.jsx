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
    toast.success("Welcome to Grozo Club! Your 20% code is GROZO20", {
      position: "bottom-center",
      autoClose: 4000,
    });
    setEmail("");
  };


  return (
    <section className="my-16 sm:my-24 relative overflow-hidden rounded-3xl bg-[#091E10] text-white p-8 sm:p-14 lg:p-16 border border-cyan-900/60 shadow-2xl">
      {/* Background Decorative Rings */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-[10px] font-bold tracking-widest text-cyan-300 uppercase mb-4">
          <Mail className="w-3 h-3 text-amber-400" />
          <span>⚡ Grozo Insider Deals</span>
        </div>

        {/* Headline */}
        <h3 className="text-3xl sm:text-4xl text-white font-black mb-3 leading-tight tracking-tight">
          Join Grozo Club & Get <span className="text-amber-400 font-extrabold">20% Off</span>
        </h3>

        {/* Subtitle */}
        <p className="text-cyan-100/80 text-xs sm:text-sm font-normal max-w-lg mb-8 leading-relaxed">
          Get secret promo codes, fresh produce alerts, weekend flash deals, and express delivery perks sent straight to your inbox.
        </p>

        {/* Form */}
        {subscribed ? (
          <div className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-zinc-900 border border-cyan-500/30 text-cyan-400 text-xs font-medium animate-fade-in">
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

