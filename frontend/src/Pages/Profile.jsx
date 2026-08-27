import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  ShoppingBag, 
  Award, 
  ShieldCheck, 
  LogOut, 
  Edit3, 
  Check, 
  ArrowRight,
  Clock,
  Sparkles,
  Heart,
  ChevronRight
} from "lucide-react";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, token, logout, navigate, updateUserProfile, getCartCount } = useContext(ShopContext);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal"); // 'personal' | 'address'
  
  const [formData, setFormData] = useState({
    name: user?.name || "Eleanor Vance",
    email: user?.email || "eleanor.vance@example.com",
    phone: user?.phone || "+91 98765 43210",
    street: user?.street || "Flat 402, Signature Towers, MG Road",
    city: user?.city || "Mumbai",
    state: user?.state || "Maharashtra",
    zipcode: user?.zipcode || "400001",
    country: user?.country || "India",
  });

  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        street: user.street || prev.street,
        city: user.city || prev.city,
        state: user.state || prev.state,
        zipcode: user.zipcode || prev.zipcode,
      }));
    }

    try {
      const orders = JSON.parse(localStorage.getItem("placed_orders") || "[]");
      setOrderCount(orders.length);
    } catch {
      setOrderCount(0);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsEditing(false);
  };

  // Initials for Avatar
  const getInitials = (nameStr) => {
    if (!nameStr) return "U";
    const parts = nameStr.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  if (!token) {
    return null;
  }

  return (
    <div className="py-8 sm:py-12 border-t border-zinc-200/80 animate-fade-in max-w-5xl mx-auto">
      
      {/* Top Banner & Header Card */}
      <div className="relative rounded-3xl bg-zinc-950 text-white p-6 sm:p-10 mb-8 overflow-hidden shadow-luxury">
        {/* Background decorative ambient glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-zinc-800/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar & User Details */}
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-900 border-2 border-zinc-700/80 flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold text-white shadow-md shrink-0">
              {getInitials(formData.name)}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="font-editorial text-2xl sm:text-3xl font-medium tracking-tight text-white">
                  {formData.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <p className="text-xs text-zinc-400 font-light flex items-center gap-1.5 mb-2">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                {formData.email}
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-300">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{user?.tier || "VIP Studio Member"}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-xs font-semibold text-red-400 transition-colors shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4 Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
        
        {/* Card 1: Orders */}
        <div 
          onClick={() => navigate("/orders")}
          className="p-5 rounded-3xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-subtle transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5 stroke-[1.75]" />
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-zinc-950 font-serif mb-0.5">
            {orderCount}
          </p>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Total Orders
          </p>
        </div>

        {/* Card 2: Shopping Bag */}
        <div 
          onClick={() => navigate("/cart")}
          className="p-5 rounded-3xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-subtle transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-zinc-950 font-serif mb-0.5">
            {getCartCount()}
          </p>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Items in Bag
          </p>
        </div>

        {/* Card 3: Loyalty Points */}
        <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 mb-3">
            <Award className="w-5 h-5 stroke-[1.75]" />
          </div>
          <p className="text-2xl font-bold text-zinc-950 font-serif mb-0.5">
            2,450
          </p>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Studio Rewards
          </p>
        </div>

        {/* Card 4: Member Tier */}
        <div className="p-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
            <Sparkles className="w-5 h-5 stroke-[1.75]" />
          </div>
          <p className="text-2xl font-bold text-zinc-950 font-serif mb-0.5">
            Tier 1
          </p>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Free Express Delivery
          </p>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 p-1.5 bg-zinc-100 rounded-2xl mb-8 w-fit">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all ${
            activeTab === "personal"
              ? "bg-white text-zinc-950 shadow-xs"
              : "text-zinc-500 hover:text-zinc-950"
          }`}
        >
          Personal Details
        </button>
        <button
          onClick={() => setActiveTab("address")}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all ${
            activeTab === "address"
              ? "bg-white text-zinc-950 shadow-xs"
              : "text-zinc-500 hover:text-zinc-950"
          }`}
        >
          Default Address
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-zinc-200/80 shadow-subtle">
        
        {activeTab === "personal" && (
          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
            <div className="border-b border-zinc-100 pb-4 mb-6">
              <h3 className="font-editorial text-xl text-zinc-950 font-medium mb-1">
                Account Information
              </h3>
              <p className="text-xs text-zinc-500 font-light">
                Manage your primary personal and contact details.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    disabled={!isEditing}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-900 transition-colors ${
                      isEditing
                        ? "bg-zinc-50 border border-zinc-300 focus:outline-none focus:border-zinc-950"
                        : "bg-zinc-100/70 border border-transparent cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    disabled={!isEditing}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-900 transition-colors ${
                      isEditing
                        ? "bg-zinc-50 border border-zinc-300 focus:outline-none focus:border-zinc-950"
                        : "bg-zinc-100/70 border border-transparent cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    disabled={!isEditing}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-900 transition-colors ${
                      isEditing
                        ? "bg-zinc-50 border border-zinc-300 focus:outline-none focus:border-zinc-950"
                        : "bg-zinc-100/70 border border-transparent cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                  Membership Status
                </label>
                <div className="relative flex items-center">
                  <Sparkles className="w-4 h-4 text-amber-500 absolute left-3.5" />
                  <input
                    disabled
                    type="text"
                    value="VIP Elite Tier (Active)"
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-700 bg-zinc-100/70 border border-transparent cursor-not-allowed font-medium"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-zinc-950 text-white rounded-xl text-xs font-semibold tracking-wider uppercase hover:bg-zinc-800 transition-all shadow-sm"
                >
                  Save Profile Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold tracking-wider hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        )}

        {activeTab === "address" && (
          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
            <div className="border-b border-zinc-100 pb-4 mb-6">
              <h3 className="font-editorial text-xl text-zinc-950 font-medium mb-1">
                Default Delivery Address
              </h3>
              <p className="text-xs text-zinc-500 font-light">
                This address will automatically pre-fill during Express Checkout.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 transition-colors"
                placeholder="House / Flat No., Landmark, Street"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                  State / Province
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                  Postal / Zip Code
                </label>
                <input
                  type="text"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5 block">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-zinc-950 text-white rounded-xl text-xs font-semibold tracking-wider uppercase hover:bg-zinc-800 transition-all shadow-sm"
              >
                Save Delivery Address
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
};

export default Profile;
