import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Zap, Clock, Tag, ArrowRight, Copy, Check,
  Percent, ChevronLeft, ChevronRight, Sparkles, Shield
} from "lucide-react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

// ─── SLIDE DATA ───────────────────────────────────────────────────────────────
const slides = [
  {
    id: "lightning",
    badge: { text: "⚡ 8-MIN LIGHTNING DELIVERY", bg: "bg-amber-400/20 text-amber-300 border border-amber-400/30" },
    eyebrow: "Fastest In Your City",
    title: ["Everything", "Delivered."],
    titleAccent: "In 8 Minutes.",
    desc: "Farm-fresh vegetables, dairy, snacks, pantry staples & daily essentials — delivered to your door at record speed.",
    cta: { text: "Shop Groceries", href: "/collection" },
    promo: null,
    gradient: {
      from: "from-[#03080F]",
      via: "via-[#031823]",
      to: "to-[#050D1C]",
      orb1: "bg-cyan-500/20",
      orb2: "bg-sky-400/15",
      orb3: "bg-blue-600/10",
    },
    card: {
      icon: "⚡",
      iconBg: "bg-amber-400 text-slate-950",
      label: "LIGHTNING PASS",
      heading: "₹0 Delivery",
      sub: "Free express dispatch on orders over ₹199",
      accent: "text-amber-300",
      glow: "shadow-amber-500/20",
    },
  },
  {
    id: "saver",
    badge: { text: "🏷️ EXCLUSIVE PROMO DEAL", bg: "bg-cyan-400/20 text-cyan-300 border border-cyan-400/30" },
    eyebrow: "Save More, Spend Less",
    title: ["Super Saver", "Deals."],
    titleAccent: "Flat 20% OFF.",
    desc: "Apply code GROZO20 at checkout and get instant discount across our entire grocery catalog.",
    cta: { text: "Apply & Shop", href: "/collection" },
    promo: "GROZO20",
    gradient: {
      from: "from-[#080312]",
      via: "via-[#0D052B]",
      to: "to-[#060312]",
      orb1: "bg-violet-600/20",
      orb2: "bg-fuchsia-500/15",
      orb3: "bg-purple-700/10",
    },
    card: {
      icon: "🎉",
      iconBg: "bg-violet-500 text-white",
      label: "INSTANT VOUCHER",
      heading: "GROZO20",
      sub: "Valid on all grocery & dairy categories",
      accent: "text-violet-300",
      glow: "shadow-violet-500/20",
    },
  },
  {
    id: "organic",
    badge: { text: "🌿 100% FARM-FRESH HARVEST", bg: "bg-cyan-400/20 text-cyan-200 border border-cyan-400/30" },
    eyebrow: "Certified Organic",
    title: ["Fresh Fruits", "& Veggies."],
    titleAccent: "Pure & Natural.",
    desc: "Sourced directly from certified regional farmers every morning. 100% chemical-free, temperature-controlled freshness.",
    cta: { text: "Explore Produce", href: "/collection" },
    promo: "FRESH50",
    gradient: {
      from: "from-[#020C08]",
      via: "via-[#04160E]",
      to: "to-[#050F1A]",
      orb1: "bg-cyan-500/20",
      orb2: "bg-teal-400/15",
      orb3: "bg-green-700/10",
    },
    card: {
      icon: "🍎",
      iconBg: "bg-cyan-500 text-white",
      label: "FARM ASSURANCE",
      heading: "Direct Sourced",
      sub: "Harvested at 5:00 AM daily for peak nutrition",
      accent: "text-cyan-300",
      glow: "shadow-cyan-500/20",
    },
  },
];

const quickCategories = [
  { name: "Masala & Spices", icon: "🌶️", bg: "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/60", tag: "Essential" },
  { name: "Atta, Rice & Dal", icon: "🌾", bg: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/60", tag: "Daily" },
  { name: "Dairy & Bread", icon: "🥛", bg: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/60", tag: "Fresh" },
  { name: "Snacks & Drinks", icon: "🥤", bg: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/60", tag: "Quick" },
  { name: "Cleaning & Care", icon: "🧼", bg: "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/60", tag: "Hygiene" },
];

// ─── SLIDE DURATION ───────────────────────────────────────────────────────────
const SLIDE_DURATION = 5000;

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.45, ease: [0.55, 0, 1, 0.45] },
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const cardVariants = {
  hidden: { opacity: 0, x: 30, scale: 0.93 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { delay: 0.3, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─── HERO COMPONENT ──────────────────────────────────────────────────────────
const Hero = () => {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState("");
  const progressRef = useRef(null);
  const startRef = useRef(Date.now());
  const { applyPromoCode } = useContext(ShopContext);

  const slide = slides[idx];

  // ── Auto-progress bar + slide advance ────────────────────────────────────
  useEffect(() => {
    if (isPaused) return;
    startRef.current = Date.now() - (progress / 100) * SLIDE_DURATION;

    const raf = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        progressRef.current = requestAnimationFrame(raf);
      } else {
        advance(1);
      }
    };

    progressRef.current = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(progressRef.current);
  }, [idx, isPaused]);

  const advance = (direction) => {
    cancelAnimationFrame(progressRef.current);
    setProgress(0);
    setDir(direction);
    setIdx((prev) => (prev + direction + slides.length) % slides.length);
    startRef.current = Date.now();
  };

  const goTo = (i) => {
    cancelAnimationFrame(progressRef.current);
    setProgress(0);
    setDir(i > idx ? 1 : -1);
    setIdx(i);
    startRef.current = Date.now();
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    applyPromoCode?.(code);
    toast.success(`✅ Code "${code}" copied & applied!`, { position: "bottom-center" });
    setTimeout(() => setCopied(""), 2500);
  };

  return (
    <section className="my-3 space-y-3">

      {/* ═══ MAIN CAROUSEL ══════════════════════════════════════════════════ */}
      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 h-[3px] bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-sky-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Slide Stage */}
        <div className="relative overflow-hidden" style={{ minHeight: "clamp(280px, 42vw, 420px)" }}>
          <AnimatePresence initial={false} custom={dir} mode="sync">
            <motion.div
              key={slide.id}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={`absolute inset-0 bg-gradient-to-br ${slide.gradient.from} ${slide.gradient.via} ${slide.gradient.to} text-white flex items-center`}
            >
              {/* Ambient orbs */}
              <div className={`absolute top-0 right-0 w-96 h-96 ${slide.gradient.orb1} rounded-full blur-[120px] pointer-events-none -translate-y-1/4 translate-x-1/4`} />
              <div className={`absolute bottom-0 left-0 w-72 h-72 ${slide.gradient.orb2} rounded-full blur-[90px] pointer-events-none translate-y-1/4 -translate-x-1/4`} />
              <div className={`absolute top-1/2 left-1/2 w-64 h-64 ${slide.gradient.orb3} rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2`} />

              {/* Grid noise texture overlay */}
              <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }}
              />

              {/* Content */}
              <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-8 px-6 sm:px-10 lg:px-14 py-10 sm:py-12">

                {/* LEFT: Copy */}
                <div className="flex-1 space-y-5 text-center md:text-left max-w-xl">

                  {/* Badge */}
                  <motion.div custom={0} variants={contentVariants} initial="hidden" animate="visible">
                    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest backdrop-blur-sm ${slide.badge.bg}`}>
                      <Zap className="w-3 h-3 fill-current" />
                      {slide.badge.text}
                    </span>
                  </motion.div>

                  {/* Eyebrow label */}
                  <motion.p custom={1} variants={contentVariants} initial="hidden" animate="visible"
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                    {slide.eyebrow}
                  </motion.p>

                  {/* Heading */}
                  <motion.div custom={2} variants={contentVariants} initial="hidden" animate="visible">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08]">
                      {slide.title.map((line, i) => (
                        <span key={i} className={i === slide.title.length - 1 ? "block" : "block"}>
                          {i === 0 ? line : line}
                        </span>
                      ))}
                      <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-cyan-200 bg-clip-text text-transparent block mt-1">
                        {slide.titleAccent}
                      </span>
                    </h1>
                  </motion.div>

                  {/* Description */}
                  <motion.p custom={3} variants={contentVariants} initial="hidden" animate="visible"
                    className="text-sm text-white/60 max-w-md leading-relaxed font-light">
                    {slide.desc}
                  </motion.p>

                  {/* CTAs */}
                  <motion.div custom={4} variants={contentVariants} initial="hidden" animate="visible"
                    className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">

                    <Link
                      to={slide.cta.href}
                      className="group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-widest shadow-lg shadow-cyan-500/25 active:scale-95 transition-all duration-200"
                    >
                      <span>{slide.cta.text}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {slide.promo ? (
                      <button
                        onClick={() => handleCopy(slide.promo)}
                        className="group inline-flex items-center gap-2 bg-white/8 hover:bg-white/14 border border-white/15 hover:border-white/25 text-white font-bold px-4 py-3 rounded-xl text-xs backdrop-blur-md transition-all active:scale-95"
                      >
                        {copied === slide.promo
                          ? <Check className="w-3.5 h-3.5 text-cyan-400" />
                          : <Copy className="w-3.5 h-3.5 text-cyan-300" />}
                        <span className="font-mono tracking-wider">{slide.promo}</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 backdrop-blur-md px-4 py-3 rounded-xl text-xs text-white/70 font-medium">
                        <Clock className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                        <span>Avg delivery: <strong className="text-white font-black">8 mins</strong></span>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* RIGHT: Feature Card */}
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="w-full md:w-auto shrink-0 flex justify-center"
                >
                  <div className={`relative bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center space-y-4 shadow-2xl ${slide.card.glow} max-w-[220px] w-full`}>
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />

                    <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xl ${slide.card.iconBg}`}>
                      {slide.card.icon}
                    </div>

                    <div className="space-y-1.5">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${slide.card.accent}`}>
                        {slide.card.label}
                      </span>
                      <p className="text-lg font-black text-white leading-tight">{slide.card.heading}</p>
                      <p className="text-[11px] text-white/50 font-light leading-relaxed">{slide.card.sub}</p>
                    </div>

                    {/* Bottom verified badge */}
                    <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-white/8">
                      <Shield className="w-3 h-3 text-cyan-400" />
                      <span className="text-[10px] text-white/40 font-medium">Grozo Verified</span>
                    </div>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Arrow Controls ───────────────────────────────────────────────── */}
        {[
          { onClick: () => advance(-1), icon: ChevronLeft, side: "left-3", label: "Previous" },
          { onClick: () => advance(1),  icon: ChevronRight, side: "right-3", label: "Next" },
        ].map(({ onClick, icon: Icon, side, label }) => (
          <button
            key={label}
            onClick={onClick}
            aria-label={label}
            className={`absolute ${side} top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 border border-white/15 text-white flex items-center justify-center transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 focus:opacity-100 backdrop-blur-sm shadow-md`}
          >
            <Icon className="w-4.5 h-4.5" />
          </button>
        ))}

        {/* ── Dot Indicators ──────────────────────────────────────────────── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-400 ${
                i === idx
                  ? "w-7 h-2 bg-gradient-to-r from-cyan-400 to-sky-300 shadow-sm shadow-cyan-400/50"
                  : "w-2 h-2 bg-white/30 hover:bg-white/55"
              }`}
            />
          ))}
        </div>

        {/* ── Slide counter ────────────────────────────────────────────────── */}
        <div className="absolute bottom-4 right-4 z-20 text-[10px] font-bold text-white/30 tabular-nums">
          {String(idx + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>
      </div>

      {/* ═══ PROMO CODES BAR ════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-gradient-to-r from-slate-900/80 via-slate-900 to-slate-900/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-white/8 dark:border-slate-800 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-white/60">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-white/40">Active Promos</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["GROZO20", "FRESH50", "ZEPTO50", "FREE8"].map((code) => (
            <button
              key={code}
              onClick={() => handleCopy(code)}
              className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/6 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/50 text-white/60 hover:text-cyan-300 text-[11px] font-black font-mono tracking-widest transition-all duration-200 active:scale-95"
            >
              <Percent className="w-2.5 h-2.5" />
              <span>{code}</span>
              {copied === code && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded whitespace-nowrap"
                >
                  ✓ Copied!
                </motion.span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ═══ QUICK CATEGORY CHIPS ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {quickCategories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.055, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Link
              to="/collection"
              className="group flex items-center gap-3 bg-white dark:bg-slate-800/80 hover:bg-cyan-50 dark:hover:bg-slate-700/70 border border-slate-200/70 dark:border-slate-700/60 hover:border-cyan-400/60 dark:hover:border-cyan-500/50 p-3 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${cat.bg}`}>
                {cat.icon}
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {cat.name}
                </p>
                <p className="text-[10px] text-cyan-600 dark:text-cyan-500 font-extrabold uppercase tracking-wide mt-0.5">
                  {cat.tag} • 8 mins
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

    </section>
  );
};

export default Hero;
