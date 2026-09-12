import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, Plus, Pencil, Trash2, Package, RefreshCw, Image as ImageIcon } from "lucide-react";

const currency = "₹";

const AdminProducts = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(backendUrl + "/api/product/list");
      if (res.data.success) {
        setProducts(res.data.products || []);
        setFiltered(res.data.products || []);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    let result = [...products];
    if (catFilter !== "All") result = result.filter(p => p.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, catFilter, products]);

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(productId);
    try {
      const res = await axios.post(
        backendUrl + "/api/product/remove",
        { id: productId },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Product deleted");
        setProducts(prev => prev.filter(p => p._id !== productId));
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  const totalValue = products.reduce((s, p) => s + (p.price || 0), 0);
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <div className="space-y-5 max-w-[1400px]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white">Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {filtered.length} of {products.length} products · Catalog value: {currency}{totalValue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => navigate("/admin/products/add")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Products</p>
          <p className="text-2xl font-black text-white mt-1">{products.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Categories</p>
          <p className="text-2xl font-black text-white mt-1">{categories.length - 1}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Out of Stock</p>
          <p className={`text-2xl font-black mt-1 ${outOfStock > 0 ? "text-red-400" : "text-cyan-400"}`}>
            {outOfStock}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none flex-1"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                catFilter === c
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-800 rounded" />
                <div className="h-3 bg-slate-800 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-16 text-center">
          <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div
              key={product._id}
              className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden group hover:border-slate-700 transition-all"
            >
              {/* Product Image */}
              <div className="relative h-44 bg-slate-800 overflow-hidden">
                {product.image?.[0] ? (
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-slate-700" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {product.bestseller && (
                    <span className="bg-amber-500/90 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded-lg">
                      BESTSELLER
                    </span>
                  )}
                  {product.category && (
                    <span className="bg-slate-900/90 text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded-lg border border-slate-700">
                      {product.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-white truncate">{product.name}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {product.subCategory} · {product.sizes?.join(", ") || "No sizes"}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-black text-cyan-400">
                    {currency}{product.price?.toLocaleString("en-IN")}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                      title="Edit product"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deleting === product._id}
                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
