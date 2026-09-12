import React, { useState, useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Zap,
  User,
  Home,
  Shield,
  Tag,
  Truck,
} from "lucide-react";

const NAV_ITEMS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    to: "/admin/tracking",
    label: "Live Tracking",
    icon: Truck,
  },
  {
    to: "/admin/products",
    label: "Products",
    icon: Package,
  },
  {
    to: "/admin/categories",
    label: "Categories",
    icon: Tag,
  },
  {
    to: "/admin/users",
    label: "Customers",
    icon: Users,
  },
  {
    to: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
  {
    to: "/admin/profile",
    label: "Admin Profile",
    icon: User,
  },
];

const AdminLayout = () => {
  const { user, logout } = useContext(ShopContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState([
    { id: 1, msg: "New order #ORD-847 received", time: "2m ago", unread: true },
    { id: 2, msg: "User Priya Sharma registered", time: "8m ago", unread: true },
    { id: 3, msg: "Order #ORD-841 delivered", time: "1h ago", unread: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase() || "AD";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/60">
        <div className="w-9 h-9 rounded-xl bg-cyan-600 text-amber-300 flex items-center justify-center font-black text-lg shrink-0 shadow-lg">
          <Zap className="w-5 h-5 fill-amber-300" />
        </div>
        {sidebarOpen && (
          <div>
            <span className="text-white font-black text-base tracking-tight">Grozo</span>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest -mt-0.5">Admin Console</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? "bg-cyan-600 text-white shadow-lg shadow-emerald-900/40"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom — Store Link + Logout */}
      <div className="px-3 py-4 border-t border-slate-800/60 space-y-1">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <Home className="w-5 h-5 shrink-0" />
          {sidebarOpen && <span>View Store</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* ── DESKTOP SIDEBAR ───────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-900 border-r border-slate-800/60 transition-all duration-300 shrink-0 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
        style={{ height: "100vh", position: "sticky", top: 0 }}
      >
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ────────────────── */}
      {mobileSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800/60 flex flex-col">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── MAIN CONTENT AREA ─────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── TOP NAVBAR ─────────────────────────── */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-slate-900/95 border-b border-slate-800/60 backdrop-blur-md">

          {/* Left: Hamburger + Toggle Sidebar */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop sidebar collapse */}
            <button
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Page search */}
            <div className="hidden sm:flex items-center gap-2 w-60 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Search orders, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
              />
            </div>
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-3">

            {/* Notifications */}
            <div className="relative">
              <button
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setProfileDropdown(false);
                }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-900" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50">
                  <p className="text-xs font-black text-slate-300 uppercase px-3 py-2">
                    Notifications ({unreadCount} new)
                  </p>
                  <div className="space-y-1">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 p-3 rounded-xl ${n.unread ? "bg-cyan-950/40" : ""}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-cyan-400" : "bg-slate-600"}`} />
                        <div>
                          <p className="text-xs text-slate-200">{n.msg}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 transition-all"
                onClick={() => {
                  setProfileDropdown(!profileDropdown);
                  setShowNotifications(false);
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-600 text-amber-300 font-black text-sm flex items-center justify-center">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-white leading-none">{user?.name || "Admin"}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Shield className="w-2.5 h-2.5 text-purple-400" />
                    <p className="text-[10px] font-bold text-purple-400 uppercase">Administrator</p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {profileDropdown && (
                <div className="absolute right-0 top-14 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800 mb-2">
                    <p className="text-xs font-bold text-white">{user?.name || "Administrator"}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate("/admin/profile"); setProfileDropdown(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Admin Profile</span>
                  </button>
                  <button
                    onClick={() => { navigate("/"); setProfileDropdown(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>View Store</span>
                  </button>
                  <div className="border-t border-slate-800 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ───────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
          <Outlet />
        </main>
      </div>

      {/* Close dropdowns on outside click */}
      {(showNotifications || profileDropdown) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setShowNotifications(false);
            setProfileDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminLayout;
