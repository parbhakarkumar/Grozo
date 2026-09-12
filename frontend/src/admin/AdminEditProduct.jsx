import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Image as ImageIcon,
  X,
} from "lucide-react";

const SIZES = ["250g", "500g", "1kg", "2kg", "5L", "1L", "500mL", "S", "M", "L", "XL", "XXL"];

const AdminEditProduct = () => {
  const { productId } = useParams();
  const { backendUrl, token } = useContext(ShopContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([null, null, null, null]);
  const [newPreviews, setNewPreviews] = useState(["", "", "", ""]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    bestseller: false,
    sizes: [],
  });

  useEffect(() => {
    // Load categories
    axios
      .get(backendUrl + "/api/admin/categories")
      .then((res) => {
        if (res.data.success) setCategories(res.data.categories || []);
      })
      .catch(() => {});

    // Load product by ID
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.post(backendUrl + "/api/product/single", { productId });
        if (res.data.success && res.data.product) {
          const p = res.data.product;
          setForm({
            name: p.name || "",
            description: p.description || "",
            price: p.price || "",
            category: p.category || "",
            subCategory: p.subCategory || "",
            bestseller: p.bestseller || false,
            sizes: p.sizes || [],
          });
          setExistingImages(p.image || []);
        } else {
          toast.error("Product not found");
          navigate("/admin/products");
        }
      } catch {
        toast.error("Failed to load product");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  const handleNewImage = (index, file) => {
    if (!file) return;
    const imgs = [...newImages];
    const prevs = [...newPreviews];
    imgs[index] = file;
    prevs[index] = URL.createObjectURL(file);
    setNewImages(imgs);
    setNewPreviews(prevs);
  };

  const removeNewImage = (index) => {
    const imgs = [...newImages];
    const prevs = [...newPreviews];
    imgs[index] = null;
    prevs[index] = "";
    setNewImages(imgs);
    setNewPreviews(prevs);
  };

  const toggleSize = (size) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error("Valid price is required"); return; }
    if (!form.category) { toast.error("Please select a category"); return; }

    setSaving(true);
    try {
      // Build FormData — include new images if uploaded
      const formData = new FormData();
      formData.append("id", productId);
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", Number(form.price));
      formData.append("category", form.category);
      formData.append("subCategory", form.subCategory);
      formData.append("bestseller", form.bestseller ? "true" : "false");
      formData.append("sizes", JSON.stringify(form.sizes));

      newImages.forEach((img, i) => {
        if (img) formData.append(`image${i + 1}`, img);
      });

      // Try PUT /api/product/update first, fallback to remove+add
      try {
        const res = await axios.put(backendUrl + "/api/product/update", formData, {
          headers: { token, "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) {
          toast.success("Product updated!");
          navigate("/admin/products");
          return;
        }
      } catch {
        // PUT not available — try POST remove then re-add approach isn't ideal
        // Try a generic update using post with _method override
      }

      // Fallback: just update non-image fields via JSON if multipart fails
      const jsonRes = await axios.post(
        backendUrl + "/api/product/update",
        { id: productId, ...form },
        { headers: { token } }
      );
      if (jsonRes.data.success) {
        toast.success("Product updated!");
        navigate("/admin/products");
      } else {
        toast.error(jsonRes.data.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded-xl" />
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 h-64" />
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 h-48" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/products")}
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-white">Edit Product</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">ID: {productId?.slice(-12)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
            <h2 className="text-sm font-black text-white mb-4">Current Images</h2>
            <div className="flex gap-3 flex-wrap">
              {existingImages.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={img}
                    alt={`Product ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-700"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-cyan-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                      MAIN
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Images */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-sm font-black text-white mb-1">Replace Images</h2>
          <p className="text-xs text-slate-500 mb-4">Optional — upload to replace existing images</p>
          <div className="grid grid-cols-4 gap-3">
            {newImages.map((_, index) => (
              <div key={index} className="relative">
                {newPreviews[index] ? (
                  <div className="relative">
                    <img
                      src={newPreviews[index]}
                      alt={`New ${index + 1}`}
                      className="w-full h-28 object-cover rounded-xl border border-cyan-600/50"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-700 hover:border-cyan-600 rounded-xl cursor-pointer transition-colors group">
                    <ImageIcon className="w-6 h-6 text-slate-600 group-hover:text-cyan-500 transition-colors" />
                    <span className="text-[9px] text-slate-600 group-hover:text-cyan-500 mt-1 font-bold">
                      {index + 1}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleNewImage(index, e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-black text-white">Product Details</h2>

          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-600 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-600 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Price (₹) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                min={0}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-600 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-600 transition-colors cursor-pointer"
                required
              >
                <option value="">Select category</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
              Sub-Category
            </label>
            <input
              type="text"
              value={form.subCategory}
              onChange={(e) => setForm((f) => ({ ...f, subCategory: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-600 transition-colors"
            />
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-sm font-black text-white mb-4">Sizes / Variants</h2>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  form.sizes.includes(size)
                    ? "bg-cyan-600 border-cyan-600 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Bestseller */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm((f) => ({ ...f, bestseller: !f.bestseller }))}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                form.bestseller ? "bg-cyan-600" : "bg-slate-700"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.bestseller ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Bestseller</p>
              <p className="text-[11px] text-slate-500">Show bestseller badge on product card</p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-bold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditProduct;
