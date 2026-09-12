import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Upload,
  X,
  ArrowLeft,
  Save,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

const SIZES = ["250g", "500g", "1kg", "2kg", "5L", "1L", "500mL", "S", "M", "L", "XL", "XXL"];

const AdminAddProduct = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    bestseller: false,
    sizes: [],
  });
  const [images, setImages] = useState([null, null, null, null]);
  const [previews, setPreviews] = useState(["", "", "", ""]);

  useEffect(() => {
    // Load categories for the dropdown
    axios
      .get(backendUrl + "/api/admin/categories")
      .then((res) => {
        if (res.data.success) setCategories(res.data.categories || []);
      })
      .catch(() => {});
  }, []);

  const handleImageChange = (index, file) => {
    if (!file) return;
    const newImages = [...images];
    const newPreviews = [...previews];
    newImages[index] = file;
    newPreviews[index] = URL.createObjectURL(file);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    newImages[index] = null;
    newPreviews[index] = "";
    setImages(newImages);
    setPreviews(newPreviews);
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
    if (form.sizes.length === 0) { toast.error("Select at least one size/variant"); return; }
    if (!images.some(Boolean)) { toast.error("Upload at least one product image"); return; }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", Number(form.price));
      formData.append("category", form.category);
      formData.append("subCategory", form.subCategory);
      formData.append("bestseller", form.bestseller ? "true" : "false");
      formData.append("sizes", JSON.stringify(form.sizes));

      images.forEach((img, i) => {
        if (img) formData.append(`image${i + 1}`, img);
      });

      const res = await axios.post(backendUrl + "/api/product/add", formData, {
        headers: { token, "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("Product added successfully!");
        navigate("/admin/products");
      } else {
        toast.error(res.data.message || "Failed to add product");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-xl font-black text-white">Add New Product</h1>
          <p className="text-xs text-slate-500 mt-0.5">Fill in the details to create a new product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Images */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-sm font-black text-white mb-4">Product Images</h2>
          <div className="grid grid-cols-4 gap-3">
            {images.map((_, index) => (
              <div key={index} className="relative">
                {previews[index] ? (
                  <div className="relative">
                    <img
                      src={previews[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-28 object-cover rounded-xl border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-cyan-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        MAIN
                      </span>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-700 hover:border-cyan-600 rounded-xl cursor-pointer transition-colors group">
                    <ImageIcon className="w-6 h-6 text-slate-600 group-hover:text-cyan-500 transition-colors" />
                    <span className="text-[10px] text-slate-600 group-hover:text-cyan-500 mt-1 font-bold">
                      {index === 0 ? "Main" : `Image ${index + 1}`}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(index, e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-3">First image will be the main product image. Max 4 images.</p>
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
              placeholder="e.g. Organic Basmati Rice"
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
              placeholder="Write a detailed product description..."
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
                placeholder="0"
                min={0}
                step={0.01}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-600 transition-colors"
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
                    <option value="Bakery">Bakery</option>
                    <option value="Grains">Grains</option>
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
              placeholder="e.g. Premium Organic, Topwear..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-600 transition-colors"
            />
          </div>
        </div>

        {/* Sizes / Variants */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-sm font-black text-white mb-4">Sizes / Variants *</h2>
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
          {form.sizes.length > 0 && (
            <p className="text-[10px] text-slate-500 mt-3">
              Selected: {form.sizes.join(", ")}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-sm font-black text-white mb-4">Additional Options</h2>
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
              <p className="text-sm font-bold text-white">Mark as Bestseller</p>
              <p className="text-[11px] text-slate-500">Show bestseller badge on product card</p>
            </div>
          </label>
        </div>

        {/* Submit */}
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
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Add Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddProduct;
