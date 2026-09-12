import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Heart, ShoppingBag, Trash2, ArrowRight, Store } from "lucide-react";
import axios from "axios";

const Wishlist = () => {
  const { products, user, setUser, token, backendUrl, addToCart, currency } = useContext(ShopContext);

  const wishlistIds = user?.wishlist || [];
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p._id));
  const navigate = useNavigate();

  const removeFromWishlist = async (productId) => {
    const updatedWishlist = wishlistIds.filter((id) => id !== productId);
    const updatedUser = { ...user, wishlist: updatedWishlist };
    setUser(updatedUser);
    localStorage.setItem("user_profile", JSON.stringify(updatedUser));
    toast.success("Removed from wishlist");

    if (token) {
      try {
        await axios.put(
          backendUrl + "/api/user/profile",
          { wishlist: updatedWishlist },
          { headers: { token } }
        );
      } catch {
        // Optimistic update already applied
      }
    }
  };

  const handleAddToCart = (product) => {
    if (product.sizes?.length > 0) {
      addToCart(product._id, product.sizes[0]);
    } else {
      addToCart(product._id, "Default");
    }
  };

  const clearWishlist = async () => {
    if (!window.confirm("Clear your entire wishlist?")) return;
    const updatedUser = { ...user, wishlist: [] };
    setUser(updatedUser);
    localStorage.setItem("user_profile", JSON.stringify(updatedUser));
    toast.success("Wishlist cleared");

    if (token) {
      try {
        await axios.put(
          backendUrl + "/api/user/profile",
          { wishlist: [] },
          { headers: { token } }
        );
      } catch {}
    }
  };

  return (
    <div className="min-h-[60vh] py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">My Wishlist</h1>
            <p className="text-xs text-slate-500">
              {wishlistProducts.length} saved {wishlistProducts.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
        {wishlistProducts.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Empty State */}
      {wishlistProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 rounded-3xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-5">
            <Heart className="w-12 h-12 text-rose-300 dark:text-rose-500/40" />
          </div>
          <h2 className="text-xl font-black text-slate-700 dark:text-slate-300 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Save products you love to your wishlist and find them here later.
          </p>
          <button
            onClick={() => navigate("/collection")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-cyan-600 hover:opacity-90 text-white text-sm font-bold rounded-2xl transition-all"
          >
            <Store className="w-4 h-4" />
            <span>Browse Products</span>
          </button>
        </div>
      ) : (
        <>
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300"
              >
                {/* Image */}
                <div
                  className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <img
                    src={product.image?.[0] || ""}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=No+Image"; }}
                  />
                  {product.bestseller && (
                    <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-lg">
                      BESTSELLER
                    </span>
                  )}
                  {/* Remove from wishlist */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(product._id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3
                    className="text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {product.category}
                    {product.subCategory ? ` · ${product.subCategory}` : ""}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {currency}{product.price?.toLocaleString("en-IN")}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-cyan-600 hover:opacity-80 text-white text-[11px] font-bold rounded-xl transition-all"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate("/collection")}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-2xl hover:bg-slate-900 dark:hover:bg-slate-800 hover:text-white transition-all"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;
