import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import {
  ChevronRight, Award, Leaf, HeartHandshake, Zap, Users,
  Store, Clock, Star, ArrowRight
} from "lucide-react";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm ${className}`}>{children}</div>
);

const About = () => {
  const stats = [
    { value: "50K+",  label: "Happy Customers" },
    { value: "8 min", label: "Avg. Delivery Time" },
    { value: "5,000+",label: "Products Listed" },
    { value: "4.8★",  label: "App Store Rating" },
  ];

  const values = [
    { icon: Zap,          title: "Speed First",        desc: "We built our dark store network to ensure you get essentials within 8 minutes, no excuses." },
    { icon: Award,        title: "Quality Assured",    desc: "Every product is sourced from verified suppliers and checked before dispatch." },
    { icon: Leaf,         title: "Eco Conscious",      desc: "Minimal plastic, electric delivery vehicles, and a commitment to reducing our carbon footprint." },
    { icon: HeartHandshake, title: "Customer Obsessed", desc: "24/7 support, easy returns, and a team that genuinely cares about your experience." },
  ];

  const team = [
    { name: "Aarav Sharma",   role: "Founder & CEO",       initial: "A" },
    { name: "Priya Mehta",    role: "Head of Operations",   initial: "P" },
    { name: "Rohit Gupta",    role: "CTO",                  initial: "R" },
    { name: "Ananya Singh",   role: "Head of Customer Joy", initial: "A" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-800 dark:text-slate-200 font-medium">About Grozo</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold uppercase tracking-widest rounded mb-3">
              <Store size={11} /> Our Story
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
              Groceries in 8 Minutes —<br />That's the Grozo Promise
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Founded in 2023, Grozo was born from a simple frustration: why does it take an hour to get milk? We built a network of micro dark stores across cities to solve exactly that. Today, we serve over 50,000 customers daily.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              From fresh produce and dairy to snacks and household essentials — we stock over 5,000 products, carefully curated and quality-checked. Every delivery is packed with care, and every customer interaction is handled with genuine attention.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/collection"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Shop Now <ArrowRight size={14} />
              </Link>
              <Link to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <Card className="overflow-hidden">
            <div className="aspect-[4/3]">
              <img src={assets.about_img} alt="Grozo Dark Store" className="w-full h-full object-cover" />
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ value, label }) => (
            <Card key={label} className="p-5 text-center">
              <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{label}</p>
            </Card>
          ))}
        </div>

        {/* Values */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Our Values</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">What drives us every single day</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="p-5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-800/60 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <Card className="p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-5">Our Journey</h2>
          <div className="space-y-4">
            {[
              { year: "2023", event: "Founded in Prayagraj with 1 dark store and 3 delivery partners" },
              { year: "Early 2024", event: "Expanded to 5 cities · Launched the Grozo app · 10,000 customers" },
              { year: "Mid 2024", event: "Introduced 8-minute express delivery guarantee" },
              { year: "2025", event: "50,000+ daily orders · Electric delivery fleet · Series A funding" },
              { year: "2026", event: "Pan-India expansion in progress · 100+ dark stores planned" },
            ].map(({ year, event }, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center gap-1 w-20 flex-shrink-0">
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">{year}</span>
                  {i < 4 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Team */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Meet the Team</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">The people behind the 8-minute magic</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {team.map(({ name, role, initial }) => (
              <Card key={name} className="p-4 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3 text-white text-xl font-bold">
                  {initial}
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{role}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <Card className="p-6 sm:p-8 bg-slate-800 dark:bg-slate-850 border-slate-800 dark:border-slate-700 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-amber-400 text-xs font-bold">4.8 / 5 · 12,000+ Reviews</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Ready for 8-minute delivery?</h2>
          <p className="text-sm text-slate-400 mb-5">Join 50,000+ customers who trust Grozo for their daily essentials.</p>
          <Link to="/collection"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Start Shopping <ArrowRight size={14} />
          </Link>
        </Card>

      </div>
    </div>
  );
};

export default About;
