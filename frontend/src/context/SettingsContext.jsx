import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export const SettingsContext = createContext();

// ═══════════════════════════════════════════════════════════
// MULTILINGUAL DICTIONARY
// ═══════════════════════════════════════════════════════════
export const translations = {
  en: {
    delivering_in: "Delivering in 8-10 mins",
    free_delivery_banner: "FREE Express Delivery on Orders Over ₹199",
    search_placeholder: "Search 'fresh milk, snacks, vegetables'...",
    sign_in: "Sign In",
    my_profile: "My Profile",
    my_orders: "My Orders",
    settings: "Settings",
    sign_out: "Sign Out",
    my_cart: "My Cart",
    all_grocery: "ALL GROCERY",
    trending_items: "Trending SuperFast Items",
    top_bestsellers: "Top Selling Best Sellers",
    add: "ADD",
    add_to_cart: "Add To Cart",
    instant_buy: "Instant Buy",
    view_cart: "View Cart",
    bill_details: "Bill Details",
    item_total: "Item Total",
    delivery_fee: "Delivery Fee",
    place_order: "Place Order",
    filters: "Filters",
    reset_all: "Reset All",
    categories: "Categories",
    sub_categories: "Sub-Categories",
    items: "Items",
    shopping_cart: "Shopping Cart",
    continue_shopping: "Continue Shopping",
    order_history: "Order History",
    live_tracking: "Live Order Tracking",
    dark_mode: "Dark Mode",
    light_mode: "Light Mode",
    system_theme: "System Theme",
    sound_alerts: "Sound Alerts",
    verified_customer: "Verified Customer",
    cash_on_delivery: "Cash on Delivery",
    online_payment: "Online Payment / UPI",
  },
  hi: {
    delivering_in: "8-10 मिनट में डिलीवरी",
    free_delivery_banner: "₹199 से अधिक के ऑर्डर पर मुफ्त एक्सप्रेस डिलीवरी",
    search_placeholder: "'ताजा दूध, सब्जियां, स्नैक्स' खोजें...",
    sign_in: "साइन इन",
    my_profile: "मेरी प्रोफाइल",
    my_orders: "मेरे ऑर्डर्स",
    settings: "सेटिंग्स",
    sign_out: "साइन आउट",
    my_cart: "मेरा कार्ट",
    all_grocery: "सभी किराना",
    trending_items: "सुपरफास्ट ट्रेंडिंग उत्पाद",
    top_bestsellers: "सर्वश्रेष्ठ बिकने वाले उत्पाद",
    add: "जोड़ें",
    add_to_cart: "कार्ट में जोड़ें",
    instant_buy: "तुरंत खरीदें",
    view_cart: "कार्ट देखें",
    bill_details: "बिल का विवरण",
    item_total: "सामान का कुल मूल्य",
    delivery_fee: "डिलीवरी शुल्क",
    place_order: "ऑर्डर दें",
    filters: "फ़िल्टर",
    reset_all: "रीसेट करें",
    categories: "श्रेणियां",
    sub_categories: "उप-श्रेणियां",
    items: "आइटम",
    shopping_cart: "शॉपिंग कार्ट",
    continue_shopping: "खरीदारी जारी रखें",
    order_history: "ऑर्डर इतिहास",
    live_tracking: "लाइव ऑर्डर ट्रैकिंग",
    dark_mode: "डार्क मोड",
    light_mode: "लाइट मोड",
    system_theme: "सिस्टम थीम",
    sound_alerts: "ध्वनि अलर्ट",
    verified_customer: "सत्यापित ग्राहक",
    cash_on_delivery: "कैश ऑन डिलीवरी",
    online_payment: "ऑनलाइन भुगतान / यूपीआई",
  },
  mr: {
    delivering_in: "8-10 मिनिटांत डिलिव्हरी",
    free_delivery_banner: "₹199 पेक्षा जास्त ऑर्डरवर मोफत एक्सप्रेस डिलिव्हरी",
    search_placeholder: "'ताजे दूध, भाज्या, स्नॅक्स' शोधा...",
    sign_in: "साइन इन",
    my_profile: "माझे प्रोफाइल",
    my_orders: "माझ्या ऑर्डर्स",
    settings: "सेटिंग्ज",
    sign_out: "साइन आउट",
    my_cart: "माझी कार्ट",
    all_grocery: "सर्व किराणा",
    trending_items: "ट्रेंडिंग उत्पादने",
    top_bestsellers: "सर्वाधिक विकली जाणारी उत्पादने",
    add: "जोडा",
    add_to_cart: "कार्टमध्ये जोडा",
    instant_buy: "त्वरित खरेदी करा",
    view_cart: "कार्ट पहा",
    bill_details: "बिल तपशील",
    item_total: "एकूण रक्कम",
    delivery_fee: "डिलिव्हरी शुल्क",
    place_order: "ऑर्डर द्या",
    filters: "फिल्टर्स",
    reset_all: "सर्व रीसेट करा",
    categories: "कॅटेगरीज",
    sub_categories: "उप-कॅटेगरीज",
    items: "वस्तू",
    shopping_cart: "खरेदी कार्ट",
    continue_shopping: "खरेदी सुरू ठेवा",
    order_history: "ऑर्डर इतिहास",
    live_tracking: "थेट ऑर्डर ट्रॅकिंग",
    dark_mode: "डार्क मोड",
    light_mode: "लाइट मोड",
    system_theme: "सिस्टम थीम",
    sound_alerts: "आवाज सूचना",
    verified_customer: "प्रमाणित ग्राहक",
    cash_on_delivery: "कॅश ऑन डिलिव्हरी",
    online_payment: "ऑनलाइन पेमेंट / यूपीआय",
  },
  gu: {
    delivering_in: "8-10 મિનિટમાં ડિલિવરી",
    free_delivery_banner: "₹199 થી વધુના ઓર્ડર પર મફત એક્સપ્રેસ ડિલિવરી",
    search_placeholder: "'તાજું દૂધ, શાકભાજી, નાસ્તો' શોધો...",
    sign_in: "સાઇન ઇન",
    my_profile: "મારી પ્રોફાઇલ",
    my_orders: "મારા ઓર્ડર્સ",
    settings: "સેટિંગ્સ",
    sign_out: "સાઇન આઉટ",
    my_cart: "મારું કાર્ટ",
    all_grocery: "બધી કરિયાણા",
    trending_items: "ટ્રેન્ડિંગ સુપરફાસ્ટ પ્રોડક્ટ્સ",
    top_bestsellers: "સૌથી વધુ વેચાતી પ્રોડક્ટ્સ",
    add: "ઉમેરો",
    add_to_cart: "કાર્ટમાં ઉમેરો",
    instant_buy: "તરત જ ખરીદો",
    view_cart: "કાર્ટ જુઓ",
    bill_details: "બિલ વિગતો",
    item_total: "કુલ કિંમત",
    delivery_fee: "ડિલિવરી ચાર્જ",
    place_order: "ઓર્ડર કરો",
    filters: "ફિલ્ટર્સ",
    reset_all: "રીસેટ કરો",
    categories: "કેટેગરીઝ",
    sub_categories: "સબ-કેટેગરીઝ",
    items: "વસ્તુઓ",
    shopping_cart: "શોપિંગ કાર્ટ",
    continue_shopping: "ખરીદી ચાલુ રાખો",
    order_history: "ઓર્ડર ઇતિહાસ",
    live_tracking: "લાઇવ ઓર્ડર ટ્રેકિંગ",
    dark_mode: "ડાર્ક મોડ",
    light_mode: "લાઇટ મોડ",
    system_theme: "સિસ્ટમ થીમ",
    sound_alerts: "સાઉન્ડ એલર્ટ",
    verified_customer: "ચકાસાયેલ ગ્રાહક",
    cash_on_delivery: "કેશ ઓન ડિલિવરી",
    online_payment: "ઓનલાઇન પેમેન્ટ / યુપીઆઈ",
  },
};

// ═══════════════════════════════════════════════════════════
// WEB AUDIO CHIME GENERATOR (Zero external asset dependence)
// ═══════════════════════════════════════════════════════════
const playWebAudioTone = (frequency = 587.33, type = "sine", duration = 0.15) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Audio contexts might be blocked until user gesture, ignore safely
  }
};

export const SettingsProvider = ({ children }) => {
  // ── THEME STATE ──────────────────────────────────────────
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "system") {
      return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const applyTheme = useCallback((mode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    let darkActive = false;

    if (mode === "dark") {
      root.classList.add("dark");
      darkActive = true;
    } else if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
      darkActive = prefersDark;
    } else {
      root.classList.remove("dark");
      darkActive = false;
    }

    setIsDark(darkActive);
    setThemeMode(mode);
    localStorage.setItem("theme", mode);
  }, []);

  // Listen to system preference changes if in 'system' mode
  useEffect(() => {
    applyTheme(themeMode);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const current = localStorage.getItem("theme");
      if (current === "system") {
        document.documentElement.classList.toggle("dark", e.matches);
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyTheme, themeMode]);

  // ── FONT SIZE STATE ───────────────────────────────────────
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("fontSize") || "medium";
  });

  const handleFontSize = useCallback((size) => {
    setFontSize(size);
    localStorage.setItem("fontSize", size);
    if (typeof document !== "undefined") {
      const sizes = { small: "14px", medium: "16px", large: "18px" };
      document.documentElement.style.fontSize = sizes[size] || "16px";
    }
  }, []);

  useEffect(() => {
    handleFontSize(fontSize);
  }, [fontSize, handleFontSize]);

  // ── LANGUAGE & TRANSLATION STATE ──────────────────────────
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    const names = { en: "English", hi: "हिंदी", mr: "मराठी", gu: "ગુજરાતી" };
    toast.info(`Language set to ${names[lang] || lang}`, { autoClose: 1000 });
  };

  const t = useCallback((key, defaultText = "") => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || defaultText || key;
  }, [language]);

  // ── NOTIFICATION PREFERENCES ──────────────────────────────
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("notif_prefs")) || {
        orderUpdates: true,
        deliveryAlerts: true,
        promotions: false,
        newArrivals: true,
        emailNotifs: true,
        smsNotifs: false,
        pushNotifs: true,
        soundAlerts: true,
      };
    } catch {
      return {
        orderUpdates: true,
        deliveryAlerts: true,
        promotions: false,
        newArrivals: true,
        emailNotifs: true,
        smsNotifs: false,
        pushNotifs: true,
        soundAlerts: true,
      };
    }
  });

  const saveNotif = (updated) => {
    setNotifPrefs(updated);
    localStorage.setItem("notif_prefs", JSON.stringify(updated));
    toast.success("Notification settings saved.", { autoClose: 1000, position: "bottom-right" });
  };

  // ── SOUND CHIME HELPER ────────────────────────────────────
  const playChime = useCallback((type = "add") => {
    if (!notifPrefs.soundAlerts) return;
    if (type === "add") {
      playWebAudioTone(659.25, "sine", 0.12); // E5 note
      setTimeout(() => playWebAudioTone(880, "sine", 0.18), 80); // A5 note
    } else if (type === "success") {
      playWebAudioTone(523.25, "triangle", 0.1); // C5
      setTimeout(() => playWebAudioTone(659.25, "triangle", 0.1), 100); // E5
      setTimeout(() => playWebAudioTone(1046.5, "sine", 0.25), 200); // C6
    } else {
      playWebAudioTone(440, "sine", 0.15);
    }
  }, [notifPrefs.soundAlerts]);

  // ── PRIVACY PREFERENCES ───────────────────────────────────
  const [privacyPrefs, setPrivacyPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("privacy_prefs")) || {
        showOrderHistory: true,
        analyticsTracking: false,
        personalisedAds: false,
        shareDataPartners: false,
      };
    } catch {
      return {
        showOrderHistory: true,
        analyticsTracking: false,
        personalisedAds: false,
        shareDataPartners: false,
      };
    }
  });

  const savePrivacy = (updated) => {
    setPrivacyPrefs(updated);
    localStorage.setItem("privacy_prefs", JSON.stringify(updated));
    toast.success("Privacy preferences updated.", { autoClose: 1000, position: "bottom-right" });
  };

  // ── WALLET / PAYMENT PREFERENCES ─────────────────────────
  const [walletPrefs, setWalletPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wallet_prefs")) || {
        autoPay: false,
        saveCards: true,
        upiDefault: true,
      };
    } catch {
      return {
        autoPay: false,
        saveCards: true,
        upiDefault: true,
      };
    }
  });

  const saveWallet = (updated) => {
    setWalletPrefs(updated);
    localStorage.setItem("wallet_prefs", JSON.stringify(updated));
    toast.success("Payment preferences saved.", { autoClose: 1000, position: "bottom-right" });
  };

  // ── SECURITY SETTINGS ─────────────────────────────────────
  const [twoFactor, setTwoFactor] = useState(() => localStorage.getItem("2fa") === "true");
  const [loginAlerts, setLoginAlerts] = useState(() => localStorage.getItem("login_alerts") !== "false");

  const toggle2FA = () => {
    const next = !twoFactor;
    setTwoFactor(next);
    localStorage.setItem("2fa", String(next));
    toast.info(next ? "Two-step verification enabled." : "Two-step verification disabled.", { autoClose: 1500 });
  };

  return (
    <SettingsContext.Provider
      value={{
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
