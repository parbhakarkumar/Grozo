import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Check,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const EMPTY_FORM = { name: "", description: "", image: "", isActive: true, sortOrder: 0 };

const AdminCategories = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(backendUrl + "/api/admin/categories?includeInactive=true", {
        headers: { token },
      });
      if (res.data.success) {
        setCategories(res.data.categories || []);
        setFiltered(res.data.categories || []);
      }
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, [token]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(categories); return; }
    const q = search.toLowerCase();
    setFiltered(categories.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    ));
  }, [search, categories]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name || "",
      description: cat.description || "",
      image: cat.image || "",
      isActive: cat.isActive !== false,
      sortOrder: cat.sortOrder || 0,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await axios.put(
          `${backendUrl}/api/admin/categories/${editingId}`,
          form,
          { headers: { token } }
        );
        if (res.data.success) {
          toast.success("Category updated!");
          setCategories(prev =>
            prev.map(c => c._id === editingId ? res.data.category : c)
          );
          closeModal();
        } else {
          toast.error(res.data.message || "Update failed");
        }
      } else {
        const res = await axios.post(
          `${backendUrl}/api/admin/categories`,
          form,
          { headers: { token } }
        );
        if (res.data.success) {
          toast.success("Category created!");
          setCategories(prev => [...prev, res.data.category]);
          closeModal();
        } else {
          toast.error(res.data.message || "Create failed");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (catId, catName) => {
    if (!window.confirm(`Delete category "${catName}"? This cannot be undone.`)) return;
    setDeleting(catId);
    try {
      const res = await axios.delete(
        `${backendUrl}/api/admin/categories/${catId}`,
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Category deleted");
        setCategories(prev => prev.filter(c => c._id !== catId));
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (cat) => {
    try {
      const res = await axios.put(
        `${backendUrl}/api/admin/categories/${cat._id}`,
        { ...cat, isActive: !cat.isActive },
        { headers: { token } }
      );
      if (res.data.success) {
        setCategories(prev =>
          prev.map(c => c._id === cat._id ? { ...c, isActive: !c.isActive } : c)
        );
        toast.success(`Category ${!cat.isActive ? "activated" : "deactivated"}`);
      }
    } catch {
      toast.error("Failed to update category");
    }
  };

  return (
    <div className="space-y-5 max-w-[1400px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white">Category Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {filtered.length} of {categories.length} categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-black text-white mt-1">{categories.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-black text-cyan-400 mt-1">
            {categories.filter(c => c.isActive !== false).length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Inactive</p>
          <p className="text-2xl font-black text-red-400 mt-1">
            {categories.filter(c => c.isActive === false).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 max-w-sm">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-slate-500 outline-none flex-1"
        />
      </div>

      {/* Categories Table */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                {["Category", "Slug", "Description", "Products", "Status", "Sort", "Actions"].map(h => (
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
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3 bg-slate-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Tag className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                      {search ? "No categories match your search" : "No categories yet. Create one!"}
                    </p>
                  </td>
                </tr>
              ) : filtered.map(cat => (
                <tr key={cat._id} className={`hover:bg-slate-800/30 transition-colors ${cat.isActive === false ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-9 h-9 rounded-xl object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-600/30 flex items-center justify-center">
                          <Tag className="w-4 h-4 text-cyan-400" />
                        </div>
                      )}
                      <p className="text-xs font-bold text-white">{cat.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] text-slate-500">{cat.slug}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-xs text-slate-400 truncate">{cat.description || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-center text-slate-300 font-bold">
                    {cat.productCount ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(cat)}
                      className="flex items-center gap-1.5 transition-all"
                    >
                      {cat.isActive !== false ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-cyan-400" />
                          <span className="text-[10px] font-bold text-cyan-400">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-slate-600" />
                          <span className="text-[10px] font-bold text-slate-500">Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 text-center">{cat.sortOrder ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                        title="Edit category"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        disabled={deleting === cat._id}
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-black text-white">
                  {editingId ? "Edit Category" : "Add New Category"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingId ? "Update category details" : "Create a new product category"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Fruits & Vegetables"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this category..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-600 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Image URL
                </label>
                <input
                  type="url"
                  value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                    min={0}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <button
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all border ${
                      form.isActive
                        ? "bg-cyan-600/20 border-cyan-600/40 text-cyan-400"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {form.image && (
              <div className="mt-4">
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-700"
                  onError={e => { e.target.style.display = "none"; }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{saving ? "Saving..." : editingId ? "Save Changes" : "Create Category"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
