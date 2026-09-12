import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { Search, RefreshCw, Shield, UserX, UserCheck, Users, Mail, Phone, Calendar } from "lucide-react";

const AdminUsers = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(backendUrl + "/api/admin/users", {
        headers: { token },
      });
      if (res.data.success) {
        setUsers(res.data.users || []);
        setFiltered(res.data.users || []);
      }
    } catch (err) {
      toast.error("Failed to fetch registered users from database");
      setUsers([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  useEffect(() => {
    let result = [...users];
    if (roleFilter !== "All") result = result.filter(u => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, roleFilter, users]);

  const promoteToAdmin = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const action = newRole === "admin" ? "promote to admin" : "demote to user";
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;
    try {
      const res = await axios.post(
        backendUrl + "/api/admin/promote",
        { userId, role: newRole },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(`User ${action === "promote to admin" ? "promoted" : "demoted"} successfully`);
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        toast.error(res.data.message || "Action failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const toggleActive = async (userId, isActive) => {
    try {
      const res = await axios.post(
        backendUrl + "/api/admin/deactivate",
        { userId },
        { headers: { token } }
      );
      if (res.data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
        toast.success(`User account status updated`);
      } else {
        toast.error(res.data.message || "Action failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle user status");
    }
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase() || "U";
  };

  const AVATAR_COLORS = [
    "#0891B2", "#6366f1", "#f59e0b", "#ec4899", "#0ea5e9", "#10b981"
  ];
  const getColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  const totalUsers  = users.filter(u => u.role === "user").length;
  const totalAdmins = users.filter(u => u.role === "admin").length;
  const activeUsers = users.filter(u => u.isActive !== false).length;

  return (
    <div className="space-y-5 max-w-[1400px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white">Customer Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {filtered.length} of {users.length} users shown
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Customers</p>
          <p className="text-2xl font-black text-white mt-1">{totalUsers}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Admins</p>
          <p className="text-2xl font-black text-purple-400 mt-1">{totalAdmins}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-black text-cyan-400 mt-1">{activeUsers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          {["All", "user", "admin"].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                roleFilter === r
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {["User","Email","Phone","Role","Status","Orders","Joined","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3 bg-slate-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user._id} className={`hover:bg-slate-800/30 transition-colors ${user.isActive === false ? "opacity-50" : ""}`}>

                  {/* Avatar + Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0"
                        style={{ background: getColor(user.name || "") }}
                      >
                        {getInitials(user.name)}
                      </div>
                      <p className="text-xs font-bold text-white whitespace-nowrap">{user.name}</p>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-xs text-slate-400">{user.email}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{user.phone || "—"}</td>

                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                        : "bg-slate-700 text-slate-300"
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      user.isActive !== false
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "bg-red-500/15 text-red-300"
                    }`}>
                      {user.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs text-slate-400 text-center">
                    {user.orders ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-[10px] text-slate-500 whitespace-nowrap">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })
                      : "—"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => promoteToAdmin(user._id, user.role)}
                        title={user.role === "admin" ? "Demote to user" : "Promote to admin"}
                        className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center text-purple-400 transition-all"
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleActive(user._id, user.isActive !== false)}
                        title={user.isActive !== false ? "Deactivate user" : "Activate user"}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          user.isActive !== false
                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                            : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400"
                        }`}
                      >
                        {user.isActive !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
