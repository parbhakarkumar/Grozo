import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { 
  Search, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  ChevronRight, 
  Package, 
  LogOut,
  Sparkles,
  ArrowRight,
  UserCheck
} from "lucide-react";

const Navbar = () => {
  const [openModal, setOpenModal] = useState(false);
  const {
    setShowSearch,
    setToken,
    setCartItems,
    getCartCount,
    token,
    user,
    logout,
    navigate,
  } = useContext(ShopContext);

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "COLLECTIONS", path: "/collection" },
    { name: "ABOUT", path: "/about" },
    { name: "CONTACT", path: "/contact" },
  ];

  // Helper for user initials
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
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Promotional Bar */}
      <div className="bg-zinc-950 text-white text-[11px] font-medium tracking-widest uppercase py-2 px-4 text-center flex items-center justify-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Complimentary Express Shipping on Orders Above ₹500</span>
        <span className="hidden sm:inline text-zinc-500">•</span>
        <span className="hidden sm:inline text-zinc-400 font-normal">Use Code: <span className="text-white font-semibold">CARTIVO20</span> for 20% Off</span>
      </div>

      {/* Main Glassmorphic Navigation */}
      <nav className="glass-nav border-b border-zinc-200/70 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] py-3.5 transition-all">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-serif text-lg font-bold tracking-tight shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
              <span className="font-editorial text-xl font-bold">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-[0.22em] text-zinc-950 font-sans leading-none">
                CARTIVO
              </span>
              <span className="text-[9px] tracking-[0.3em] text-zinc-400 uppercase font-medium mt-0.5">
                Haute Couture
              </span>
            </div>
          </Link>


          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex items-center gap-8 text-[13px] tracking-[0.15em] font-medium text-zinc-600">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `relative py-1 transition-colors duration-200 hover:text-zinc-950 flex flex-col items-center ${
                    isActive ? "text-zinc-950 font-semibold" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="absolute bottom-[-4px] left-0 w-full h-[1.5px] bg-zinc-950 rounded-full animate-fade-in" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </ul>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Search Trigger */}
            <button
              onClick={() => {
                setShowSearch(true);
                navigate("/collection");
              }}
              className="p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-all"
              aria-label="Search products"
              title="Search"
            >
              <Search className="w-[18px] h-[18px] stroke-[1.75]" />
            </button>

            {/* User Profile / Auth Dropdown */}
            <div className="group relative">
              <button
                onClick={() => (token ? navigate("/profile") : navigate("/login"))}
                className="p-1.5 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-all flex items-center gap-2"
                aria-label="User account"
                title={token ? "My Account" : "Sign In"}
              >
                {token && user?.name ? (
                  <div className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px] font-bold tracking-tight shadow-xs">
                    {getUserInitials()}
                  </div>
                ) : (
                  <User className="w-[18px] h-[18px] stroke-[1.75]" />
                )}
              </button>

              {token && (
                <div className="group-hover:block hidden absolute right-0 pt-2 w-52 animate-fade-in z-50">
                  <div className="bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-2xl shadow-xl p-2 text-xs text-zinc-700">
                    <div 
                      onClick={() => navigate("/profile")}
                      className="px-3 py-2 border-b border-zinc-100 mb-1 cursor-pointer hover:bg-zinc-50 rounded-lg transition-colors"
                    >
                      <p className="font-semibold text-zinc-950 line-clamp-1">{user?.name || "Client Account"}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">{user?.tier || "VIP Studio Member"}</p>
                    </div>

                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 transition-colors text-left"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => navigate("/orders")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 transition-colors text-left"
                    >
                      <Package className="w-3.5 h-3.5 text-zinc-500" />
                      <span>My Orders</span>
                    </button>

                    <div className="my-1 border-t border-zinc-100" />

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Trigger */}
            <Link
              to="/cart"
              className="relative p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-all flex items-center"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-[18px] h-[18px] stroke-[1.75]" />
              {getCartCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-zinc-950 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-fade-in">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setOpenModal(true)}
              className="md:hidden p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-all"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Over Menu */}
      {openModal && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          {/* Backdrop overlay */}
          <div
            onClick={() => setOpenModal(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <div className="fixed top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl flex flex-col justify-between p-6 z-10 animate-slide-up">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-zinc-950 text-white flex items-center justify-center font-serif text-sm font-bold">
                    C
                  </div>
                  <span className="font-bold tracking-widest text-sm text-zinc-950">CARTIVO</span>
                </div>
                <button
                  onClick={() => setOpenModal(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <div className="flex flex-col py-6 gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    onClick={() => setOpenModal(false)}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between py-3 px-4 rounded-xl text-sm font-medium tracking-wider transition-all ${
                        isActive
                          ? "bg-zinc-950 text-white font-semibold shadow-sm"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                      }`
                    }
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-6 border-t border-zinc-100 text-xs text-zinc-500 space-y-3">
              {token ? (
                <>
                  <button
                    onClick={() => {
                      setOpenModal(false);
                      navigate("/profile");
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-zinc-950 text-white font-medium flex items-center justify-center gap-2 shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setOpenModal(false);
                      navigate("/orders");
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 text-zinc-800 font-medium flex items-center justify-center gap-2 hover:bg-zinc-50"
                  >
                    <Package className="w-4 h-4" />
                    <span>My Orders</span>
                  </button>

                  <button
                    onClick={() => {
                      setOpenModal(false);
                      logout();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-red-200 text-red-600 font-medium flex items-center justify-center gap-2 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpenModal(false)}
                  className="w-full py-3 px-4 rounded-xl bg-zinc-950 text-white font-medium text-center block shadow-sm"
                >
                  Sign In / Create Account
                </Link>
              )}
              <p className="text-center text-[10px] text-zinc-400 mt-4 tracking-widest uppercase">
                © {new Date().getFullYear()} Cartivo Studio
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;


