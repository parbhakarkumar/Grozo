import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { ArrowRight, Sparkles, ShieldCheck, Award } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative my-4 sm:my-8 rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-100 via-stone-50 to-zinc-200/60 border border-zinc-200/80 shadow-subtle">
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between min-h-[540px] sm:min-h-[600px]">
        
        {/* Left Editorial Text Content */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-start z-10">
          
          {/* Subtle Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200/80 text-[11px] font-semibold tracking-widest text-zinc-800 uppercase mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Autumn / Winter 2026 Collection</span>
          </div>

          {/* Main Editorial Headline */}
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-zinc-950 font-normal leading-[1.12] tracking-tight mb-6">
            Timeless Elegance, <br />
            <span className="italic font-light text-zinc-700">Effortless Style.</span>
          </h1>

          {/* Description */}
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-md mb-8 font-light">
            Curated contemporary essentials meticulously crafted with sustainable organic cotton and premium tailoring for the modern wardrobe.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <Link
              to="/collection"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-zinc-950 text-white rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-all shadow-md hover:shadow-xl active:scale-[0.98]"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center justify-center px-6 py-4 rounded-full border border-zinc-300 text-zinc-800 text-xs font-semibold tracking-widest uppercase hover:border-zinc-950 hover:bg-white transition-all active:scale-[0.98]"
            >
              Our Philosophy
            </Link>
          </div>

          {/* Floating Trust Metrics */}
          <div className="mt-12 pt-8 border-t border-zinc-200/80 flex items-center gap-8 w-full">
            <div>
              <p className="text-2xl font-bold text-zinc-950 font-serif">50k+</p>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Orders Delivered</p>
            </div>
            <div className="w-[1px] h-8 bg-zinc-200"></div>
            <div>
              <p className="text-2xl font-bold text-zinc-950 font-serif">4.9/5</p>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Customer Rating</p>
            </div>
            <div className="w-[1px] h-8 bg-zinc-200"></div>
            <div>
              <p className="text-2xl font-bold text-zinc-950 font-serif">100%</p>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Pure Cotton</p>
            </div>
          </div>
        </div>

        {/* Right Hero Image Showcase */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center p-6 sm:p-10 lg:p-0">
          <div className="relative w-full max-w-md lg:max-w-none h-[380px] sm:h-[480px] lg:h-[580px] overflow-hidden rounded-2xl lg:rounded-none">
            <img
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
              src={assets.hero_img}
              alt="Cartivo Autumn / Winter Collection"
            />

            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

            {/* Floating Quality Badge */}
            <div className="absolute bottom-6 right-6 glass-card px-4 py-3 rounded-2xl shadow-luxury flex items-center gap-3 animate-slide-up hidden sm:flex">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-950">Masterpiece Edition</p>
                <p className="text-[10px] text-zinc-500 font-medium">Handcrafted with precision</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;

