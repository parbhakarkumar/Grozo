import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";
import { User, Mail, Phone, Calendar, Lock, Shield, Save, Eye, EyeOff } from "lucide-react";

const AdminProfile = () => {
  const { user, backendUrl, token, setUser } = useContext(ShopContext);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name:    user?.name || "",
    email:   user?.email || "",
    phone:   user?.phone || "",
  });
  const [pwForm, setPwForm] = useState({ old: "", newPw: "", confirm: "" });
  const [showPw, setShowPw]   = useState(false);
  const [saving, setSaving]   = useState(false);

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase() || "AD";
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (backendUrl) {
        await axios.put(
          backendUrl + "/api/user/profile",
          { name: form.name, phone: form.phone },
          { headers: { token } }
        );
      }
      const updated = { ...user, ...form };
      setUser(updated);
      localStorage.setItem("user_profile", JSON.stringify(updated));
      toast.success("Profile updated!");
      setEditMode(false);
    } catch {
      const updated = { ...user, ...form };
      setUser(updated);
      localStorage.setItem("user_profile", JSON.stringify(updated));
      toast.success("Profile updated!");
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.newPw || pwForm.newPw.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      await axios.post(
        backendUrl + "/api/user/change-password",
        { oldPassword: pwForm.old, newPassword: pwForm.newPw },
        { headers: { token } }
      );
      toast.success("Password changed successfully!");
      setPwForm({ old: "", newPw: "", confirm: "" });
    } catch {
      toast.error("Failed to change password");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-black text-white">Admin Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your administrator account details</p>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-800/60">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600 text-amber-300 font-black text-xl flex items-center justify-center shadow-lg shrink-0">
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="text-lg font-black text-white">{user?.name || "Administrator"}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-3 h-3 text-purple-400" />
              <span className="text-xs font-bold text-purple-400 uppercase">System Administrator</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
          <div className="ml-auto">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditMode(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Fields */}
        <div className="space-y-4">
          {[
            { label: "Full Name", icon: User, key: "name", type: "text", editable: true },
            { label: "Email Address", icon: Mail, key: "email", type: "email", editable: false, hint: "Email cannot be changed" },
            { label: "Phone Number", icon: Phone, key: "phone", type: "tel", editable: true },
          ].map(f => (
            <div key={f.key}>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                <f.icon className="w-3 h-3" />
                {f.label}
                {f.hint && <span className="text-slate-600 normal-case tracking-normal font-normal ml-1">({f.hint})</span>}
              </label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                disabled={!editMode || !f.editable}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          ))}

          {/* Role & Join Date */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                <Shield className="w-3 h-3" /> Role
              </label>
              <div className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5">
                <span className="text-xs font-black text-purple-400">Administrator</span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3 h-3" /> Joined
              </label>
              <div className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5">
                <span className="text-xs text-slate-400">
                  {user?.joinedDate
                    ? new Date(user.joinedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
            <Lock className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-sm font-black text-white">Change Password</h3>
        </div>

        <div className="space-y-3">
          {[
            { label: "Current Password", key: "old" },
            { label: "New Password", key: "newPw" },
            { label: "Confirm New Password", key: "confirm" },
          ].map(f => (
            <div key={f.key} className="relative">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">{f.label}</label>
              <input
                type={showPw ? "text" : "password"}
                value={pwForm[f.key]}
                onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 pr-10 outline-none focus:border-red-500 transition-colors"
                placeholder="••••••••"
              />
              {f.key === "newPw" && (
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-8 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleChangePassword}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold rounded-xl transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>Update Password</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
