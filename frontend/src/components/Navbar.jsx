import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  MapPin, 
  Zap, 
  Package, 
  LogOut,
  Sparkles,
  ChevronRight
} from "lucide-react";

const searchPlaceholders = [
  "Search 'fresh milk & dairy'...",
  "Search 'sneakers & apparel'...",
  "Search 'snacks & beverages'...",
  "Search 'fruits & vegetables'...",
  "Search 'electronics & gadgets'..."
];

const Navbar = () => {
  const [openModal, setOpenModal] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const {
    setShowSearch,
    setSearch,
    search,
    getCartCount,
    token,
    user,
    logout,
    navigate,
    getCartAmount,
    currency
  } = useContext(ShopContext);

  // Rotate search placeholder like Blinkit/Zepto
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: "⚡ ALL GROCERY", path: "/collection" },
    { name: "MASALA & SPICES", path: "/collection" },
    { name: "ATTA & DAL", path: "/collection" },
    { name: "DAIRY & BREAD", path: "/collection" },
    { name: "SNACKS & DRINKS", path: "/collection" },
  ];

  const getUserInitials = () => {
    if (user?.name) {
      const parts = user.name.trim().split(" ");
      return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 shadow-xs">
      {/* 1. Top Quick-Commerce Location Strip */}
      <div className="bg-[#0C831F] text-white text-xs px-4 py-1.5 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Zap className="w-3.5 h-3.5 fill-amber-300 animate-pulse" />
            <span>Delivering in 8-10 mins</span>
            <span className="text-white/60 font-normal hidden sm:inline">|</span>
            <span className="text-white font-normal hidden sm:inline flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-300" />
              <span>Location: <strong>Home - 122001</strong></span>
            </span>
          </div>

          <div className="text-[11px] text-emerald-100 flex items-center gap-2">
            <span className="bg-amber-400 text-emerald-950 font-black px-1.5 py-0.5 rounded text-[10px] uppercase">
              DEAL
            </span>
            <span className="hidden xs:inline">FREE Express Delivery on Orders Over ₹199</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation & Search Strip */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-[#0C831F] text-amber-300 flex items-center justify-center font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
            G
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
              Grozo<span className="text-[#0C831F]">.</span>
            </span>
            <span className="text-[9px] font-extrabold tracking-widest text-[#0C831F] uppercase mt-0.5">
              8-MIN COMMERCE
            </span>
          </div>
        </Link>

        {/* Blinkit-Style Animated Search Input Bar */}
        <div className="flex-1 max-w-xl relative hidden sm:block">
          <div 
            onClick={() => {
              setShowSearch(true);
              navigate("/collection");
            }}
            className="w-full bg-slate-100 hover:bg-slate-150 border border-slate-200/80 rounded-xl px-3.5 py-2 flex items-center gap-2.5 text-slate-500 cursor-pointer transition-all shadow-inner"
          >
            <Search className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
            <div className="flex-1 overflow-hidden h-5 relative">
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIndex}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute text-xs sm:text-sm font-medium text-slate-500 truncate"
                >
                  {searchPlaceholders[placeholderIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Actions: Auth, Orders, Cart */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          
          {/* User Account / Login */}
          <div className="group relative">
            <button
              onClick={() => (token ? navigate("/profile") : navigate("/login"))}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-xs font-semibold"
            >
              {token && user?.name ? (
                <div className="w-8 h-8 rounded-full bg-[#0C831F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {getUserInitials()}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <User className="w-4 h-4" />
                </div>
              )}
              <span className="hidden md:inline text-slate-800">
                {token ? user?.name?.split(" ")[0] : "Sign In"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {token && (
              <div className="group-hover:block hidden absolute right-0 pt-2 w-52 animate-fade-in z-50">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-2 text-xs text-slate-700">
                  <div 
                    onClick={() => navigate("/profile")}
                    className="px-3 py-2 border-b border-slate-100 mb-1 cursor-pointer hover:bg-slate-50 rounded-lg"
                  >
                    <p className="font-bold text-slate-900">{user?.name}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">Verified Customer</p>
                  </div>

                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 text-left font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => navigate("/orders")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 text-left font-medium"
                  >
                    <Package className="w-3.5 h-3.5 text-slate-500" />
                    <span>My Orders</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 text-left font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Commerce Cart Button */}
          <Link
            to="/cart"
            className="flex items-center gap-2 bg-[#0C831F] hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span className="hidden xs:inline">My Cart</span>
            {getCartCount() > 0 && (
              <span className="bg-amber-400 text-emerald-950 px-1.5 py-0.5 rounded-md font-black text-[11px]">
                {getCartCount()}
              </span>
            )}
          </Link>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setOpenModal(true)}
            className="sm:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. Category Nav Chips Bar */}
      <div className="bg-slate-50 border-t border-slate-200/60 py-1.5 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-4 text-xs font-bold text-slate-700 whitespace-nowrap">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-3 py-1 rounded-full transition-colors ${
                  isActive
                    ? "bg-[#0C831F] text-white shadow-xs"
                    : "hover:bg-slate-200/70 text-slate-700"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {openModal && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setOpenModal(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white p-5 shadow-2xl flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xl font-black text-slate-900">Grozo<span className="text-[#0C831F]">.</span></span>
                <button onClick={() => setOpenModal(false)}><X className="w-5 h-5" /></button>
              </div>

              <div className="flex flex-col py-4 gap-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setOpenModal(false)}
                    className="py-2.5 px-3 rounded-lg text-sm font-semibold hover:bg-slate-100 text-slate-800"
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              {token ? (
                <button onClick={logout} className="w-full py-2.5 bg-red-50 text-red-600 font-bold rounded-xl text-center">
                  Sign Out
                </button>
              ) : (
                <Link to="/login" onClick={() => setOpenModal(false)} className="block w-full py-2.5 bg-[#0C831F] text-white font-bold rounded-xl text-center">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
