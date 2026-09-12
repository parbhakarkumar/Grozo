import React from "react";
import { Link } from "react-router-dom";
import { 
  Zap, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Truck, 
  Sparkles,
  ShoppingBag,
  Award,
  ChevronRight,
  HeartHandshake
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-20 bg-slate-900 text-slate-300 font-sans relative overflow-hidden">
      {/* 1. Value Perks & Guarantee Banner */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Superfast 8-Min Delivery</h4>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                Dispatched instantly from local dark stores near your neighborhood.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">100% Quality & Freshness</h4>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                Handpicked farm-fresh produce, dairy, and daily essentials guaranteed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Instant Refunds & Support</h4>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                No-questions-asked refunds with 24/7 concierge customer help.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Free Express Shipping</h4>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                Enjoy ₹0 delivery fee on all orders over ₹199 across all locations.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand & Mission (2 Cols wide) */}
          <div className="lg:col-span-2 flex flex-col items-start pr-0 lg:pr-6">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-amber-300 flex items-center justify-center font-black text-2xl shadow-lg group-hover:scale-105 transition-transform">
                G
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white leading-none">
                  Grozo<span className="text-cyan-600">.</span>
                </span>
                <span className="text-[10px] font-extrabold tracking-widest text-cyan-400 uppercase mt-0.5">
                  8-MIN COMMERCE
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-sm">
              Grozo is India’s premier quick-commerce experience, delivering groceries, fresh fruits, vegetables, dairy, household needs, and electronics right to your door within 8-10 minutes.
            </p>

            {/* Operating Hours pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/70 text-[11px] text-slate-300 font-medium mb-6">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Deliveries Active: <strong>6:00 AM – 12:00 AM</strong></span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-cyan-600 hover:border-cyan-600 transition-all"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-cyan-600 hover:border-cyan-600 transition-all"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-cyan-600 hover:border-cyan-600 transition-all"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 16 5h2V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-bold tracking-wider uppercase text-white mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Popular Categories
            </p>
            <Link to="/collection" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-cyan-400" />
              <span>⚡ All Grocery Deals</span>
            </Link>
            <Link to="/collection" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-cyan-400" />
              <span>Atta, Rice & Dals</span>
            </Link>
            <Link to="/collection" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-cyan-400" />
              <span>Dairy, Milk & Eggs</span>
            </Link>
            <Link to="/collection" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-cyan-400" />
              <span>Masalas, Spices & Oils</span>
            </Link>
            <Link to="/collection" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-cyan-400" />
              <span>Snacks, Drinks & Munchies</span>
            </Link>
            <Link to="/collection" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-cyan-400" />
              <span>Fresh Fruits & Veggies</span>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-bold tracking-wider uppercase text-white mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Company & Help
            </p>
            <Link to="/about" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all">
              About Grozo
            </Link>
            <Link to="/contact" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all">
              24x7 Customer Support
            </Link>
            <Link to="/orders" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all">
              Track My Order
            </Link>
            <Link to="/about" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all">
              Dark Store Hubs
            </Link>
            <Link to="/contact" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all">
              Rider & Partner Careers
            </Link>
            <Link to="/about" className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all">
              Sustainability Mission
            </Link>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold tracking-wider uppercase text-white mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Contact Concierge
            </p>

            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>11/18 MG Marg, Civil Lines, Prayagraj, UP 211001</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>+91 97950 XXXXX (24x7 Helpline)</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>support@grozo.com</span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-cyan-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>SSL 256-Bit Encrypted Payments</span>
            </div>
          </div>

        </div>

        {/* 3. Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Grozo Quick Commerce Inc. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Security & Trust</span>
            <span className="hover:text-white cursor-pointer transition-colors">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


