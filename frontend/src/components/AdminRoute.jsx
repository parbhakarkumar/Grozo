import React, { useContext } from "react";
import { Navigate, Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";

/**
 * AdminRoute — Requires role === "admin".
 * - Not logged in → redirect to /login
 * - Logged in as "user" → show Access Denied page
 * - Logged in as "admin" → render children
 */
const AdminRoute = ({ children }) => {
  const { token, user, isAdmin } = useContext(ShopContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <ShieldOff className="w-9 h-9 text-red-400" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-white mb-2">Access Denied</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              You don't have administrator privileges to access this page.
              <br />
              Logged in as: <strong className="text-white">{user?.email || "Guest"}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/20 text-xs text-red-300">
            <span className="font-bold uppercase tracking-wider">Role:</span>{" "}
            <span className="capitalize">{user?.role || "user"}</span> • Admin access required
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-600 text-white text-sm font-bold transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Go to Store</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
