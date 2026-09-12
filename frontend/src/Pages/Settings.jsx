import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";
import { toast } from "react-toastify";
import {
  Bell, Lock, Shield, Palette, Globe, Trash2, ChevronRight,
  Moon, Sun, Smartphone, Mail, Package, Eye, EyeOff, LogOut,
  AlertTriangle, Check, User, MapPin, HelpCircle, FileText,
  CreditCard, Star, Zap, Wallet, Activity, Clock, Download,
  RefreshCw, ChevronDown, ChevronUp, Volume2, VolumeX,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════

const Toggle = ({ enabled, onToggle, size = "sm" }) => (
  <button
    onClick={onToggle}
    role="switch"
    aria-checked={enabled}
    className={`relative inline-flex flex-shrink-0 items-center rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
      size === "lg" ? "h-7 w-12 border-transparent" : "h-5 w-9 border-transparent"
    } ${enabled ? "bg-cyan-500" : "bg-slate-200 dark:bg-slate-700"}`}
  >
    <span
      className={`inline-block transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
        size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5"
      }`}
      style={{
        transform: enabled
          ? size === "lg" ? "translateX(20px)" : "translateX(16px)"
          : "translateX(2px)"
      }}
    />
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="pb-4 mb-1 border-b border-slate-100 dark:border-slate-700">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0 border border-cyan-100 dark:border-cyan-800">
        <Icon size={16} className="text-cyan-600 dark:text-cyan-400" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const SettingRow = ({ label, description, children, border = true }) => (
  <div className={`flex items-center justify-between gap-4 py-3.5 ${border ? "border-b border-slate-100 dark:border-slate-700/60" : ""}`}>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const NavBtn = ({ icon: Icon, label, badge, active, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
      danger
        ? "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
        : active
        ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-semibold border-l-[3px] border-cyan-500"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium"
    }`}
  >
    <Icon size={15} className={danger ? "text-red-400" : active ? "text-cyan-500" : "text-slate-400 dark:text-slate-500"} />
    <span className="flex-1 text-left">{label}</span>
    {badge && <span className="text-[10px] bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded font-bold">{badge}</span>}
  </button>
);

const ReceiptCard = ({ title, children, accent }) => (
  <div className={`relative rounded-xl overflow-hidden border ${accent ? "border-cyan-200 dark:border-cyan-800" : "border-slate-200 dark:border-slate-700"} bg-white dark:bg-slate-800 shadow-sm`}>
    {accent && <div className="h-1 bg-gradient-to-r from-cyan-400 to-cyan-600" />}
    <div className="p-5">
      {title && <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">{title}</p>}
      {children}
    </div>
    {/* Receipt dashes at bottom */}
    <div className="px-4 pb-1">
      <div className="border-t border-dashed border-slate-200 dark:border-slate-600" />
    </div>
    <div className="h-3 px-4 flex items-center">
      <div className="flex gap-1.5 w-full">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700" />
        ))}
      </div>
    </div>
  </div>
);

const LabeledInput = ({ label, required, children }) => (
  <div>
    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
      {label} {required && <span className="text-red-400 normal-case tracking-normal">*</span>}
    </label>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
const Settings = () => {
  const { user, token, logout } = useContext(ShopContext);
  const navigate = useNavigate();
  const {
    themeMode,
    isDark,
    applyTheme,
    fontSize,
    handleFontSize,
    language,
    setLanguage,
    t,
    notifPrefs,
    saveNotif,
    playChime,
    privacyPrefs,
    savePrivacy,
    walletPrefs,
    saveWallet,
    twoFactor,
    setTwoFactor,
    toggle2FA,
    loginAlerts,
    setLoginAlerts,
  } = useSettings();

  const [activeSection, setActiveSection] = useState("notifications");
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Password Form Local State ───────────────────────
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passForm, setPassForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passStrength, setPassStrength] = useState(0);

  // Redirect if not logged in
  useEffect(() => { if (!token) navigate("/login"); }, [token]);

  // Password strength calculator
  const calcStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    setPassStrength(s);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passForm.current) return toast.error("Please enter your current password.");
    if (passForm.newPass.length < 8) return toast.error("New password must be at least 8 characters.");
    if (passForm.newPass !== passForm.confirm) return toast.error("Passwords do not match.");
    if (passStrength < 2) return toast.error("Please choose a stronger password.");
    toast.success("Password updated successfully!");
    setPassForm({ current: "", newPass: "", confirm: "" });
    setPassStrength(0);
  };

  const navItems = [
    { id: "notifications", icon: Bell,       label: "Notifications", badge: null },
    { id: "privacy",       icon: Shield,     label: "Privacy",       badge: null },
    { id: "appearance",    icon: Palette,    label: "Appearance",    badge: null },
    { id: "security",      icon: Lock,       label: "Security",      badge: "!" },
    { id: "payments",      icon: CreditCard, label: "Payments",      badge: null },
    { id: "account",       icon: User,       label: "Account",       badge: null },
  ];

  const activeLabel = navItems.find(n => n.id === activeSection)?.label;
  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition";

  const strengthColors = ["", "bg-red-400", "bg-orange-400", "bg-amber-400", "bg-cyan-500"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline">Home</Link>
            <ChevronRight size={12} />
            <Link to="/profile" className="hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline">Account</Link>
            <ChevronRight size={12} />
            <span className="text-slate-800 dark:text-slate-200 font-medium">Settings</span>
          </div>
          {/* Dark mode quick toggle in header */}
          <button
            onClick={() => applyTheme(isDark ? "light" : "dark")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-cyan-400 transition-all"
          >
            {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-500" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Page Title Row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">Account Settings</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your preferences and account details</p>
          </div>
          {/* Mobile nav toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            {activeLabel}
            {mobileOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <Card className="sm:hidden mb-4 p-2">
            {navItems.map(item => (
              <NavBtn key={item.id} icon={item.icon} label={item.label} badge={item.badge}
                active={activeSection === item.id}
                onClick={() => { setActiveSection(item.id); setMobileOpen(false); }} />
            ))}
            <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700">
              <NavBtn icon={LogOut} label="Sign Out" danger onClick={() => { logout(); navigate("/login"); }} />
            </div>
          </Card>
        )}

        <div className="flex gap-5 items-start">

          {/* ── Desktop Sidebar ─────────────────────── */}
          <aside className="hidden sm:flex flex-col w-56 flex-shrink-0 gap-3">

            {/* User Card */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name || "User"}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user?.email || ""}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                <Check size={11} className="text-cyan-500" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Verified Customer</span>
              </div>
            </Card>

            {/* Nav */}
            <Card className="p-2">
              <p className="px-3 pt-1.5 pb-2 text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Preferences</p>
              {navItems.map(item => (
                <NavBtn key={item.id} icon={item.icon} label={item.label} badge={item.badge}
                  active={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)} />
              ))}
              <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                <NavBtn icon={LogOut} label="Sign Out" danger onClick={() => { logout(); navigate("/login"); }} />
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-3">
              <p className="px-1 pb-2 text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Quick Links</p>
              {[
                { to: "/profile", icon: User,    label: "My Profile" },
                { to: "/orders",  icon: Package, label: "Order History" },
              ].map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors">
                  <Icon size={12} /> {label}
                </Link>
              ))}
            </Card>
          </aside>

          {/* ── Main Panel ──────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-4">

            {/* ══════════════════ NOTIFICATIONS ══════════════════ */}
            {activeSection === "notifications" && (
              <div className="space-y-4">
                <ReceiptCard title="Notification Types" accent>
                  <SettingRow label="Order Updates" description="Order placed, packed, dispatched, and delivered alerts">
                    <Toggle enabled={notifPrefs.orderUpdates} onToggle={() => saveNotif({ ...notifPrefs, orderUpdates: !notifPrefs.orderUpdates })} />
                  </SettingRow>
                  <SettingRow label="Delivery Alerts" description="Live tracking updates when rider is nearby">
                    <Toggle enabled={notifPrefs.deliveryAlerts} onToggle={() => saveNotif({ ...notifPrefs, deliveryAlerts: !notifPrefs.deliveryAlerts })} />
                  </SettingRow>
                  <SettingRow label="Promotions & Deals" description="Flash sales, promo codes, and exclusive offers">
                    <Toggle enabled={notifPrefs.promotions} onToggle={() => saveNotif({ ...notifPrefs, promotions: !notifPrefs.promotions })} />
                  </SettingRow>
                  <SettingRow label="New Arrivals" description="Fresh products and restocked items in your area" border={false}>
                    <Toggle enabled={notifPrefs.newArrivals} onToggle={() => saveNotif({ ...notifPrefs, newArrivals: !notifPrefs.newArrivals })} />
                  </SettingRow>
                </ReceiptCard>

                <ReceiptCard title="Delivery Channels">
                  <SettingRow label="Email Notifications" description="Updates sent to your registered email">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400 dark:text-slate-500" />
                      <Toggle enabled={notifPrefs.emailNotifs} onToggle={() => saveNotif({ ...notifPrefs, emailNotifs: !notifPrefs.emailNotifs })} />
                    </div>
                  </SettingRow>
                  <SettingRow label="SMS Notifications" description="Text message alerts for important updates">
                    <Toggle enabled={notifPrefs.smsNotifs} onToggle={() => saveNotif({ ...notifPrefs, smsNotifs: !notifPrefs.smsNotifs })} />
                  </SettingRow>
                  <SettingRow label="Push Notifications" description="Browser and app push alerts">
                    <Toggle enabled={notifPrefs.pushNotifs} onToggle={() => saveNotif({ ...notifPrefs, pushNotifs: !notifPrefs.pushNotifs })} />
                  </SettingRow>
                  <SettingRow label="Sound Alerts" description="Play a chime when notifications arrive" border={false}>
                    <div className="flex items-center gap-2">
                      {notifPrefs.soundAlerts ? <Volume2 size={13} className="text-cyan-500" /> : <VolumeX size={13} className="text-slate-400" />}
                      <Toggle enabled={notifPrefs.soundAlerts} onToggle={() => {
                        const next = !notifPrefs.soundAlerts;
                        saveNotif({ ...notifPrefs, soundAlerts: next });
                        if (next) playChime("add");
                      }} />
                    </div>
                  </SettingRow>
                </ReceiptCard>
              </div>
            )}

            {/* ══════════════════ PRIVACY ══════════════════ */}
            {activeSection === "privacy" && (
              <div className="space-y-4">
                <ReceiptCard title="Data & Visibility" accent>
                  <SettingRow label="Order History Visibility" description="Your order history is visible within your account">
                    <Toggle enabled={privacyPrefs.showOrderHistory} onToggle={() => savePrivacy({ ...privacyPrefs, showOrderHistory: !privacyPrefs.showOrderHistory })} />
                  </SettingRow>
                  <SettingRow label="Analytics & Tracking" description="Share anonymous usage data to help us improve">
                    <Toggle enabled={privacyPrefs.analyticsTracking} onToggle={() => savePrivacy({ ...privacyPrefs, analyticsTracking: !privacyPrefs.analyticsTracking })} />
                  </SettingRow>
                  <SettingRow label="Personalised Recommendations" description="Show products based on your purchase history">
                    <Toggle enabled={privacyPrefs.personalisedAds} onToggle={() => savePrivacy({ ...privacyPrefs, personalisedAds: !privacyPrefs.personalisedAds })} />
                  </SettingRow>
                  <SettingRow label="Partner Data Sharing" description="Allow verified partners to offer tailored services" border={false}>
                    <Toggle enabled={privacyPrefs.shareDataPartners} onToggle={() => savePrivacy({ ...privacyPrefs, shareDataPartners: !privacyPrefs.shareDataPartners })} />
                  </SettingRow>
                </ReceiptCard>

                <ReceiptCard title="Data Management">
                  {[
                    { icon: Download,  label: "Download My Data",       sub: "Export all your account data as a file",      action: () => toast.info("Data export requested. You'll receive an email within 24 hours.") },
                    { icon: Trash2,    label: "Clear Search History",   sub: "Remove recent searches from your account",    action: () => toast.success("Search history cleared.") },
                    { icon: RefreshCw, label: "Reset All Preferences",  sub: "Restore all settings to their defaults",      action: () => { localStorage.clear(); toast.success("All preferences reset!"); } },
                  ].map(({ icon: Icon, label, sub, action }, i, arr) => (
                    <button key={label} onClick={action}
                      className={`w-full flex items-center justify-between py-3.5 group ${i < arr.length - 1 ? "border-b border-slate-100 dark:border-slate-700/60" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <Icon size={14} className="text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-cyan-500 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </ReceiptCard>
              </div>
            )}

            {/* ══════════════════ APPEARANCE ══════════════════ */}
            {activeSection === "appearance" && (
              <div className="space-y-4">
                {/* Theme Selector */}
                <ReceiptCard title="Display Theme" accent>
                  <div className="grid grid-cols-3 gap-3 mt-1">
                    {[
                      { val: "light",  Icon: Sun,        label: "Light",  preview: "bg-white border-slate-300", textColor: "from-slate-100 to-slate-200" },
                      { val: "dark",   Icon: Moon,       label: "Dark",   preview: "bg-slate-900 border-slate-700", textColor: "from-slate-700 to-slate-900" },
                      { val: "system", Icon: Smartphone, label: "System", preview: "bg-gradient-to-br from-white to-slate-800 border-slate-400", textColor: "from-slate-200 to-slate-700" },
                    ].map(({ val, Icon, label, preview, textColor }) => (
                      <button key={val}
                        onClick={() => applyTheme(val)}
                        className={`relative flex flex-col items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                          themeMode === val
                            ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 shadow-sm shadow-cyan-100 dark:shadow-cyan-900/30"
                            : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800"
                        }`}
                      >
                        <div className={`w-full h-12 sm:h-14 rounded-lg border ${preview} bg-gradient-to-br ${textColor} flex items-end p-1.5`}>
                          <div className="w-full h-1.5 rounded-full bg-white/40" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Icon size={11} className={themeMode === val ? "text-cyan-500" : "text-slate-400 dark:text-slate-500"} />
                          <span className={`text-xs font-bold ${themeMode === val ? "text-cyan-600 dark:text-cyan-400" : "text-slate-600 dark:text-slate-300"}`}>{label}</span>
                        </div>
                        {themeMode === val && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                            <Check size={10} className="text-white" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                    Current: <strong className="text-cyan-600 dark:text-cyan-400">{themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} mode {isDark ? "🌙" : "☀️"}</strong>
                  </p>
                </ReceiptCard>

                {/* Font Size */}
                <ReceiptCard title="Font Size">
                  <div className="flex gap-2 mt-1">
                    {[
                      { val: "small",  label: "A",   size: "text-xs" },
                      { val: "medium", label: "A",   size: "text-base" },
                      { val: "large",  label: "A",   size: "text-xl" },
                    ].map(({ val, label, size }) => (
                      <button key={val} onClick={() => handleFontSize(val)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                          fontSize === val
                            ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                            : "border-slate-200 dark:border-slate-600 hover:border-slate-300 bg-white dark:bg-slate-800"
                        }`}>
                        <span className={`font-black ${size} ${fontSize === val ? "text-cyan-600 dark:text-cyan-400" : "text-slate-600 dark:text-slate-300"}`}>{label}</span>
                        <span className={`text-[10px] font-semibold capitalize ${fontSize === val ? "text-cyan-500" : "text-slate-400"}`}>{val}</span>
                      </button>
                    ))}
                  </div>
                </ReceiptCard>

                {/* Language */}
                <ReceiptCard title="Language & Region">
                  <LabeledInput label="Display Language">
                    <select value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className={inputCls}>
                      <option value="en">🇺🇸 English (United States)</option>
                      <option value="hi">🇮🇳 हिंदी (Hindi)</option>
                      <option value="mr">🇮🇳 मराठी (Marathi)</option>
                      <option value="gu">🇮🇳 ગુજરાતી (Gujarati)</option>
                    </select>
                  </LabeledInput>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Changes apply to menus, notifications, and support messages.</p>
                </ReceiptCard>
              </div>
            )}

            {/* ══════════════════ SECURITY ══════════════════ */}
            {activeSection === "security" && (
              <div className="space-y-4">

                {/* Change Password */}
                <ReceiptCard title="Change Password" accent>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                    {[
                      { label: "Current Password",    key: "current", show: showCurrentPass, setShow: setShowCurrentPass, onChange: null },
                      { label: "New Password",         key: "newPass", show: showNewPass,     setShow: setShowNewPass,     onChange: (v) => calcStrength(v) },
                      { label: "Confirm New Password", key: "confirm", show: showConfirmPass, setShow: setShowConfirmPass, onChange: null },
                    ].map(({ label, key, show, setShow, onChange }) => (
                      <LabeledInput key={key} label={label} required>
                        <div className="relative">
                          <input type={show ? "text" : "password"} value={passForm[key]}
                            onChange={e => {
                              setPassForm(p => ({ ...p, [key]: e.target.value }));
                              if (onChange) onChange(e.target.value);
                            }}
                            className={inputCls + " pr-10"} placeholder="••••••••"
                          />
                          <button type="button" onClick={() => setShow(!show)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            {show ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        {key === "newPass" && passForm.newPass && (
                          <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                              {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= passStrength ? strengthColors[passStrength] : "bg-slate-200 dark:bg-slate-600"}`} />
                              ))}
                            </div>
                            <p className={`text-[11px] font-semibold ${passStrength >= 3 ? "text-cyan-600" : passStrength >= 2 ? "text-amber-500" : "text-red-500"}`}>
                              {strengthLabels[passStrength] || "Too short"}
                            </p>
                          </div>
                        )}
                      </LabeledInput>
                    ))}
                    <button type="submit"
                      className="px-5 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors">
                      Update Password
                    </button>
                  </form>
                </ReceiptCard>

                {/* 2FA */}
                <ReceiptCard title="Two-Step Verification">
                  <SettingRow label="Two-Step Verification (2FA)" description="Require a one-time code when signing in from a new device" border={false}>
                    <Toggle enabled={twoFactor} onToggle={toggle2FA} size="lg" />
                  </SettingRow>
                  {twoFactor && (
                    <div className="mt-3 flex items-start gap-2.5 p-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 rounded-lg">
                      <Check size={14} className="text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300">2FA is Active</p>
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">Your account is protected with two-step verification.</p>
                      </div>
                    </div>
                  )}
                  <SettingRow label="Login Alerts" description="Get notified when a new device signs into your account">
                    <Toggle enabled={loginAlerts} onToggle={() => {
                      const next = !loginAlerts;
                      setLoginAlerts(next);
                      localStorage.setItem("login_alerts", String(next));
                      toast.info(next ? "Login alerts enabled." : "Login alerts disabled.", { autoClose: 1200 });
                    }} />
                  </SettingRow>
                </ReceiptCard>

                {/* Active Sessions */}
                <ReceiptCard title="Active Sessions">
                  {[
                    { device: "Chrome · Windows 11", location: "Prayagraj, UP", time: "Active now", current: true },
                    { device: "Safari · iPhone 15",  location: "Prayagraj, UP", time: "3 hours ago", current: false },
                  ].map((s, i, arr) => (
                    <div key={i} className={`flex items-center justify-between py-3.5 ${i < arr.length - 1 ? "border-b border-slate-100 dark:border-slate-700/60" : ""}`}>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          {s.device}
                          {s.current && <span className="text-[10px] bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">This Device</span>}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.location} · {s.time}</p>
                      </div>
                      {!s.current && (
                        <button onClick={() => toast.success("Device signed out.")}
                          className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold hover:underline transition-colors">
                          Sign Out
                        </button>
                      )}
                    </div>
                  ))}
                </ReceiptCard>
              </div>
            )}

            {/* ══════════════════ PAYMENTS ══════════════════ */}
            {activeSection === "payments" && (
              <div className="space-y-4">

                {/* Wallet Card */}
                <div className="relative rounded-xl overflow-hidden border border-cyan-200 dark:border-cyan-800 shadow-sm">
                  <div className="p-5 bg-gradient-to-br from-cyan-500 to-cyan-700 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200 mb-1">Grozo Wallet</p>
                    <p className="text-4xl font-black tracking-tight">₹ 0.00</p>
                    <p className="text-xs text-cyan-300 mt-1">No balance yet</p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => toast.info("Add money coming soon!")}
                        className="px-4 py-1.5 bg-white text-cyan-700 text-xs font-bold rounded-lg hover:bg-cyan-50 transition-colors">
                        Add Money
                      </button>
                      <button onClick={() => toast.info("Transactions coming soon!")}
                        className="px-4 py-1.5 bg-cyan-400/30 text-white text-xs font-bold rounded-lg hover:bg-cyan-400/40 transition-colors">
                        History
                      </button>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 px-5 py-3 flex items-center gap-2 border-t border-cyan-100 dark:border-cyan-800">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">0 Grozo Points · Bronze Tier</p>
                  </div>
                </div>

                {/* Saved Methods */}
                <ReceiptCard title="Saved Payment Methods" accent>
                  {[
                    { label: "9876543210@upi", tag: "UPI · Default", icon: Zap },
                    { label: "**** **** **** 4242", tag: "Visa Debit", icon: CreditCard },
                  ].map(({ label, tag, icon: Icon }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <Icon size={15} className="text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{tag}</p>
                        </div>
                      </div>
                      <button onClick={() => toast.success("Removed.")} className="text-xs text-red-500 font-semibold hover:underline">Remove</button>
                    </div>
                  ))}
                  <button onClick={() => toast.info("Add payment method coming soon!")}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                    + Add Payment Method
                  </button>
                </ReceiptCard>

                {/* Payment Prefs */}
                <ReceiptCard title="Payment Preferences">
                  <SettingRow label="Auto-pay for repeat orders" description="Automatically charge your saved method for recurring orders">
                    <Toggle enabled={walletPrefs.autoPay} onToggle={() => saveWallet({ ...walletPrefs, autoPay: !walletPrefs.autoPay })} />
                  </SettingRow>
                  <SettingRow label="Save cards for fast checkout" description="Securely tokenize card details for one-tap payment">
                    <Toggle enabled={walletPrefs.saveCards} onToggle={() => saveWallet({ ...walletPrefs, saveCards: !walletPrefs.saveCards })} />
                  </SettingRow>
                  <SettingRow label="Set UPI as default" description="UPI will be pre-selected at the checkout screen" border={false}>
                    <Toggle enabled={walletPrefs.upiDefault} onToggle={() => saveWallet({ ...walletPrefs, upiDefault: !walletPrefs.upiDefault })} />
                  </SettingRow>
                </ReceiptCard>

                {/* Rewards */}
                <ReceiptCard title="Grozo Rewards">
                  <div className="grid grid-cols-3 gap-3 mt-1">
                    {[
                      { label: "Points",  value: "0",      unit: "pts",  color: "text-cyan-600 dark:text-cyan-400" },
                      { label: "Cashback",value: "₹0",     unit: "",     color: "text-slate-800 dark:text-slate-100" },
                      { label: "Tier",    value: "Bronze", unit: "",     color: "text-amber-600 dark:text-amber-400" },
                    ].map(({ label, value, unit, color }) => (
                      <div key={label} className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</p>
                        <p className={`text-lg font-black ${color}`}>{value}<span className="text-xs font-medium ml-0.5">{unit}</span></p>
                      </div>
                    ))}
                  </div>
                </ReceiptCard>
              </div>
            )}

            {/* ══════════════════ ACCOUNT ══════════════════ */}
            {activeSection === "account" && (
              <div className="space-y-4">
                <ReceiptCard title="Account Management" accent>
                  {[
                    { icon: User,    label: "Edit Profile",     sub: "Update name, phone and profile photo",  to: "/profile" },
                    { icon: MapPin,  label: "Saved Addresses",  sub: "Add, edit or remove delivery addresses", to: "/profile" },
                    { icon: Package, label: "Order History",    sub: "View all past and current orders",        to: "/orders" },
                    { icon: Clock,   label: "Account Activity", sub: "Recent login history and actions",        action: () => toast.info("Activity log coming soon!") },
                  ].map(({ icon: Icon, label, sub, to, action }, i, arr) => {
                    const cls = `flex items-center justify-between py-3.5 group ${i < arr.length - 1 ? "border-b border-slate-100 dark:border-slate-700/60" : ""}`;
                    const inner = (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <Icon size={15} className="text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-cyan-500 transition-colors flex-shrink-0" />
                      </>
                    );
                    return to
                      ? <Link key={label} to={to} className={cls}>{inner}</Link>
                      : <button key={label} onClick={action} className={"w-full text-left " + cls}>{inner}</button>;
                  })}
                </ReceiptCard>

                <ReceiptCard title="Help & Support">
                  {[
                    { icon: HelpCircle, label: "Help Centre",              sub: "Browse FAQs, guides and tutorials" },
                    { icon: Mail,       label: "Contact Customer Service",  sub: "support@grozo.com · Avg. reply 2 hrs" },
                    { icon: FileText,   label: "Terms & Privacy Policy",    sub: "Legal information and your rights" },
                  ].map(({ icon: Icon, label, sub }, i, arr) => (
                    <button key={label} onClick={() => toast.info(`Opening ${label}...`)}
                      className={`w-full flex items-center justify-between py-3.5 group ${i < arr.length - 1 ? "border-b border-slate-100 dark:border-slate-700/60" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <Icon size={15} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-cyan-500 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </ReceiptCard>

                {/* Danger Zone */}
                <div className="rounded-xl overflow-hidden border-2 border-red-100 dark:border-red-900/50 bg-white dark:bg-slate-800 shadow-sm">
                  <div className="h-1 bg-gradient-to-r from-red-400 to-red-600" />
                  <div className="p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-800">
                        <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Critical Actions</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">These actions are permanent and irreversible</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Sign Out of All Devices</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">End all active sessions on every device immediately</p>
                        </div>
                        <button onClick={() => { logout(); navigate("/login"); }}
                          className="flex-shrink-0 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-all">
                          Sign Out All
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50">
                        <div>
                          <p className="text-sm font-semibold text-red-800 dark:text-red-300">Delete Account</p>
                          <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Permanently remove your account and all associated data</p>
                        </div>
                        <button
                          onClick={() => { if (window.confirm("This is permanent. Delete your Grozo account?")) toast.error("Deletion request submitted. Check your email to confirm.", { autoClose: 6000 }); }}
                          className="flex-shrink-0 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
