import React, { useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import {
  MapPin, Phone, Mail, Clock, ChevronRight, Send,
  MessageSquare, HelpCircle, Package, Truck, CheckCircle2,
  AlertCircle, ChevronDown
} from "lucide-react";
import { toast } from "react-toastify";

const topics = [
  { value: "", label: "Select a topic" },
  { value: "order", label: "Order & Delivery" },
  { value: "return", label: "Returns & Refunds" },
  { value: "product", label: "Product Quality" },
  { value: "account", label: "Account & Payments" },
  { value: "other", label: "Other" },
];

const faqs = [
  { q: "How fast is delivery?", a: "We deliver within 8–10 minutes to your doorstep in our serviceable areas. Express delivery is available 24/7." },
  { q: "How do I track my order?", a: "Open My Orders from your account. Each order has a live tracker with real-time updates from our delivery partner." },
  { q: "What is your return policy?", a: "We offer hassle-free returns within 24 hours of delivery for fresh & grocery items and 7 days for packaged goods." },
  { q: "Do you offer bulk/business orders?", a: "Yes! Contact our B2B team at business@grozo.com or WhatsApp us. We serve offices, restaurants, and retailers." },
];

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm ${className}`}>{children}</div>
);

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error("Please fill all required fields.");
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
    toast.success("Message sent! We'll respond within 24 hours.");
    setForm({ name: "", email: "", topic: "", message: "" });
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700/60 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-800 dark:text-slate-200 font-medium">Help & Customer Service</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Help & Customer Service</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">Our team is here 24/7. Average response time: under 2 hours.</p>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Package,      label: "Track Order",       sub: "Live order status",       href: "/orders" },
            { icon: Truck,        label: "Delivery Info",     sub: "Times & coverage",        href: "/orders" },
            { icon: HelpCircle,   label: "Returns",           sub: "Easy 24h returns",        href: "/orders" },
            { icon: MessageSquare,label: "Live Chat",         sub: "Chat with us now",        href: "#contact-form" },
          ].map(({ icon: Icon, label, sub, href }) => (
            <a key={label} href={href}
              className="flex flex-col items-start gap-2 p-4 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-cyan-400 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center border border-cyan-100 dark:border-cyan-800/60">
                <Icon size={15} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 transition-colors">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Main Content — 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Info + FAQ */}
          <div className="space-y-4">
            {/* Store Image */}
            <Card>
              <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl">
                <img src={assets.contact_img} alt="Grozo Hub" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-bold rounded uppercase tracking-wide">
                  Grozo Central Hub
                </div>
              </div>
              <div className="p-4 divide-y divide-slate-100 dark:divide-slate-700/60">
                {[
                  { icon: MapPin, label: "Address",   value: "14, Dark Store Lane, Sector 7, Prayagraj – 211001, UP" },
                  { icon: Phone,  label: "Phone",     value: "+91 9876 543 210" },
                  { icon: Mail,   label: "Email",     value: "support@grozo.com" },
                  { icon: Clock,  label: "Hours",     value: "24/7 · 365 days" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 py-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={13} className="text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-widest">{label}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 font-medium mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* FAQ */}
            <Card>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-800/60 flex items-center justify-center">
                    <HelpCircle size={13} className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Frequently Asked Questions</h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {faqs.map((f, i) => (
                    <div key={i}>
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between py-3 text-left gap-2"
                      >
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{f.q}</p>
                        <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                      </button>
                      {openFaq === i && (
                        <div className="pb-3">
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{f.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-2" id="contact-form">
            <Card className="h-full">
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center border border-cyan-100 dark:border-cyan-800/60">
                    <Send size={14} className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Send us a Message</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">We'll get back to you within 24 hours</p>
                  </div>
                </div>

                {sent ? (
                  <div className="py-12 flex flex-col items-center gap-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-800/60 flex items-center justify-center">
                      <CheckCircle2 size={28} className="text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white">Message Received!</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Our support team will reply within 24 hours.</p>
                    </div>
                    <button
                      onClick={() => setSent(false)}
                      className="px-5 py-2 text-sm font-semibold bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                          className={inputCls} placeholder="Your name" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                          className={inputCls} placeholder="your@email.com" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Topic</label>
                      <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className={inputCls}>
                        {topics.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Message <span className="text-red-500">*</span></label>
                      <textarea
                        rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                        className={inputCls + " resize-none"} placeholder="Describe your issue or question in detail..."
                      />
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl">
                      <AlertCircle size={14} className="text-slate-400 flex-shrink-0" />
                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        For urgent issues (wrong item, spoilt product), call <strong>+91 9876 543 210</strong> directly.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button type="submit" disabled={sending}
                        className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
                      >
                        {sending ? (
                          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                        ) : (
                          <><Send size={14} /> Send Message</>
                        )}
                      </button>
                      <p className="text-xs text-slate-400">No spam. We'll reply once only.</p>
                    </div>
                  </form>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Clock,    label: "24/7 Support",       sub: "Always available, any time" },
            { icon: Truck,    label: "8-Min Delivery",     sub: "Fastest in your city" },
            { icon: Package,  label: "Easy Returns",       sub: "No questions asked" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <Icon size={18} className="text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
