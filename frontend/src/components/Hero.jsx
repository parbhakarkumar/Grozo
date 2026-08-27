import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Clock, ShieldCheck, Tag, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";

const quickCategories = [
  { name: "Masala & Spices", icon: "🌶", bg: "bg-red-50 text-red-600", tag: "Essential" },
  { name: "Atta, Rice & Dal", icon: "🌾", bg: "bg-amber-50 text-amber-600", tag: "Daily" },
  { name: "Dairy & Bread", icon: "🥛", bg: "bg-blue-50 text-blue-600", tag: "Fresh" },
  { name: "Snacks & Drinks", icon: "🥤", bg: "bg-purple-50 text-purple-600", tag: "Quick" },
  { name: "Cleaning & Care", icon: "🧼", bg: "bg-emerald-50 text-emerald-600", tag: "Hygiene" },
];

const Hero = () => {
  return (
    <section className="my-3 space-y-4">
      {/* 1. Main Blinkit/Zepto Style Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0C831F] via-emerald-800 to-slate-900 text-white p-6 sm:p-10 shadow-lg border border-emerald-600/30"
      >
        {/* Background Decorative Circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-emerald-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-emerald-950" />
              <span>Grozo SuperFast — 8 to 10 Mins Delivery</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Everything Delivered <br className="hidden sm:inline" />
              <span className="text-amber-300">In 8 Minutes.</span>
            </h1>

            <p className="text-emerald-100 text-sm sm:text-base font-medium max-w-md">
              Order fresh groceries, trendy fashion, electronics, and daily essentials delivered to your doorstep in minutes.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                to="/collection"
                className="group inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-200 px-3 py-2 bg-white/10 rounded-xl backdrop-blur-xs">
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Average Speed: <strong>7m 42s</strong></span>
              </div>
            </div>
          </div>

          {/* Banner Graphic Card */}
          <div className="w-full md:w-auto flex justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 text-white text-center space-y-3 shadow-2xl max-w-xs">
              <div className="w-16 h-16 bg-amber-400 text-emerald-950 rounded-2xl mx-auto flex items-center justify-center font-black text-3xl shadow-lg">
                ⚡
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-amber-300">Lightning Pass</p>
                <p className="text-xl font-black">₹0 Delivery Fee</p>
                <p className="text-[11px] text-emerald-100 font-medium">On your first 3 orders today</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Quick Category Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {quickCategories.map((cat, idx) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <Link
              to="/collection"
              className="bg-white hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-500/50 p-3 rounded-2xl flex items-center gap-3 shadow-xs hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 font-bold ${cat.bg}`}>
                {cat.icon}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                  {cat.name}
                </span>
                <span className="text-[10px] text-emerald-700 font-extrabold uppercase">
                  {cat.tag} • 8 mins
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
