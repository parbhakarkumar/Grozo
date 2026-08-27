import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowUpRight, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck,
  Globe
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-28 border-t border-zinc-200/80 pt-16 pb-12 bg-white/60">
      {/* 4-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-zinc-200/80">
        
        {/* Brand & Manifesto (2 cols wide on desktop) */}
        <div className="lg:col-span-2 flex flex-col items-start pr-0 lg:pr-8">
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-[0.22em] text-zinc-950">
                CARTIVO
              </span>
              <span className="text-[9px] tracking-[0.3em] text-zinc-400 uppercase font-medium">
                Haute Couture
              </span>
            </div>
          </Link>
          <p className="text-xs text-zinc-500 font-light leading-relaxed mb-6 max-w-sm">
            Dedicated to creating timeless wardrobe foundations crafted with deliberate simplicity, ethical materials, and enduring modern silhouettes.
          </p>


          {/* Social Icons with Clean SVGs */}
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:border-zinc-950 transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:border-zinc-950 transition-colors"
              aria-label="Twitter / X"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:border-zinc-950 transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 16 5h2V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/>
              </svg>
            </a>
          </div>
        </div>


        {/* Column 2: Navigation */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold tracking-widest uppercase text-zinc-950 mb-1">
            Collections
          </p>
          <Link to="/collection" className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors">
            All Products
          </Link>
          <Link to="/collection" className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors">
            Women's Line
          </Link>
          <Link to="/collection" className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors">
            Men's Essentials
          </Link>
          <Link to="/collection" className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors">
            Kids Collection
          </Link>
          <Link to="/collection" className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors">
            Winterwear & Jackets
          </Link>
        </div>

        {/* Column 3: Company */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold tracking-widest uppercase text-zinc-950 mb-1">
            Company
          </p>
          <Link to="/about" className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors">
            Our Story & Values
          </Link>
          <Link to="/contact" className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors">
            Contact Concierge
          </Link>
          <Link to="/orders" className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors">
            Track Your Order
          </Link>
          <Link to="/about" className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors">
            Sustainability
          </Link>
          <Link to="/contact" className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors">
            Careers & Press
          </Link>
        </div>

        {/* Column 4: Concierge & Contact */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold tracking-widest uppercase text-zinc-950 mb-1">
            Contact
          </p>
          <div className="flex items-start gap-2 text-xs text-zinc-500">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
            <span>11/18 MG Marg, Civil Lines, Prayagraj</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>+91 97950 XXXXX</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>concierge@cartivo.studio</span>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SSL Encrypted Checkout</span>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400 font-light">
        <p>© {new Date().getFullYear()} Cartivo Studio. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span className="hover:text-zinc-600 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-zinc-600 cursor-pointer">Terms of Service</span>
          <span className="hover:text-zinc-600 cursor-pointer">Cookie Settings</span>
        </div>
      </div>
    </footer>
  );
};


export default Footer;

