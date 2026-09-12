import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { Bell, Shield, Globe, Palette, Save, Lock, Zap } from "lucide-react";

const AdminSettings = () => {
  const { user } = useContext(ShopContext);

  const [settings, setSettings] = useState({
    siteName:          "Grozo",
    siteTagline:       "Fastest Delivery. Best Prices.",
    deliveryFee:       40,
    freeDeliveryAbove: 500,
    maxLoginAttempts:  5,
    orderNotify:       true,
    userNotify:        true,
    lowStockAlert:     true,
    maintenanceMode:   false,
    currency:          "INR",
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // In production, POST to /api/admin/settings
    localStorage.setItem("grozo_admin_settings", JSON.stringify(settings));
    toast.success("Settings saved successfully!");
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
          <Icon className="w-4 h-4 text-cyan-400" />
        </div>
        <h3 className="text-sm font-black text-white">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, desc, children }) => (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-all ${value ? "bg-cyan-600" : "bg-slate-700"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-black text-white">Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure Grozo platform behaviour and preferences</p>
      </div>

      {/* General */}
      <Section icon={Globe} title="General Settings">
        <Field label="Site Name" desc="Displayed in browser tabs and emails">
          <input
            type="text"
            value={settings.siteName}
            onChange={e => handleChange("siteName", e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-44 outline-none focus:border-cyan-500"
          />
        </Field>
        <Field label="Site Tagline" desc="Shown in the homepage hero">
          <input
            type="text"
            value={settings.siteTagline}
            onChange={e => handleChange("siteTagline", e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-44 outline-none focus:border-cyan-500"
          />
        </Field>
        <Field label="Currency" desc="Display currency across the store">
          <select
            value={settings.currency}
            onChange={e => handleChange("currency", e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </Field>
        <Field label="Maintenance Mode" desc="Show maintenance page to all visitors">
          <Toggle value={settings.maintenanceMode} onChange={v => handleChange("maintenanceMode", v)} />
        </Field>
      </Section>

      {/* Delivery */}
      <Section icon={Zap} title="Delivery Settings">
        <Field label="Standard Delivery Fee (₹)" desc="Charged per order below threshold">
          <input
            type="number"
            value={settings.deliveryFee}
            onChange={e => handleChange("deliveryFee", Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-28 outline-none focus:border-cyan-500"
          />
        </Field>
        <Field label="Free Delivery Above (₹)" desc="Orders above this amount get free delivery">
          <input
            type="number"
            value={settings.freeDeliveryAbove}
            onChange={e => handleChange("freeDeliveryAbove", Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-28 outline-none focus:border-cyan-500"
          />
        </Field>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notification Settings">
        <Field label="New Order Alerts" desc="Notify admin on every new order">
          <Toggle value={settings.orderNotify} onChange={v => handleChange("orderNotify", v)} />
        </Field>
        <Field label="New User Registrations" desc="Alert when a new user signs up">
          <Toggle value={settings.userNotify} onChange={v => handleChange("userNotify", v)} />
        </Field>
        <Field label="Low Stock Alerts" desc="Warn when product stock is below threshold">
          <Toggle value={settings.lowStockAlert} onChange={v => handleChange("lowStockAlert", v)} />
        </Field>
      </Section>

      {/* Security */}
      <Section icon={Lock} title="Security Settings">
        <Field label="Max Login Attempts" desc="Lock account after this many failures">
          <input
            type="number"
            min={1}
            max={20}
            value={settings.maxLoginAttempts}
            onChange={e => handleChange("maxLoginAttempts", Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-20 outline-none focus:border-cyan-500"
          />
        </Field>
        <Field label="Two-Factor Auth" desc="Require OTP for admin logins (coming soon)">
          <button className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-800 border border-slate-700 rounded-xl cursor-not-allowed">
            Coming Soon
          </button>
        </Field>
      </Section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-900/30"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
