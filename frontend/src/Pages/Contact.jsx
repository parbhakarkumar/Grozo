import React, { useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";
import { MapPin, Phone, Mail, Clock, Send, Sparkles, Building2 } from "lucide-react";
import { toast } from "react-toastify";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast.success("Thank you! Our concierge will respond within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="py-8 sm:py-12 border-t border-zinc-200/80 animate-fade-in">
      
      {/* Page Header */}
      <div className="text-center mb-12">
        <Title text1="CLIENT" text2="CONCIERGE" />
        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto font-light tracking-wide -mt-3">
          Have inquiries regarding custom tailoring, wholesale capsules, or private appointments? We are at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-20">
        
        {/* Left: Flagship Store Image & Info Cards (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shadow-subtle group">
            <img
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              src={assets.contact_img}
              alt="Cartivo Flagship Atelier"
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-zinc-950/90 backdrop-blur-xs text-white text-[10px] font-bold tracking-widest uppercase rounded-full">
              Flagship Atelier
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/80 shadow-subtle space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-zinc-900" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
                  Atelier Address
                </h4>
                <p className="text-xs text-zinc-500 font-light leading-relaxed">
                  11/18 MG Marg, Civil Lines, Prayagraj, UP - 211001, India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-zinc-900" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
                  Direct Line
                </h4>
                <p className="text-xs text-zinc-500 font-light leading-relaxed">
                  +91 (0532) 987-XXXX • Mon - Sat, 10:00 AM - 8:00 PM IST
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-zinc-900" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
                  Concierge Inquiries
                </h4>
                <p className="text-xs text-zinc-500 font-light leading-relaxed">
                  concierge@cartivo.studio • careers@cartivo.studio
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Interactive Message Form (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-subtle">
          <h3 className="font-editorial text-xl text-zinc-950 font-normal mb-2">
            Send Us A Message
          </h3>
          <p className="text-xs text-zinc-500 font-light mb-6">
            Fill out the form below and our styling team will be in touch shortly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                Your Name *
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Liam Smith"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                Email Address *
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. liam@example.com"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                Subject
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Order Tracking / Sizing Query"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                Message *
              </label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How may we assist you today?"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold tracking-widest uppercase py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-[0.99]"
            >
              <span>Transmit Message</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

      <NewsletterBox />
    </div>
  );
};

export default Contact;

