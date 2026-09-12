import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";
import { motion } from "framer-motion";
import { Zap, Plus, Minus, Star } from "lucide-react";

const ProductItem = ({ _id, image, name, price, bestseller, category, sizes }) => {
  const { currency, cartItems, addToCart, updateQuantity } = useContext(ShopContext);
  const { playChime, t } = useSettings();

  // Default size selection if sizes exist or fallback
  const defaultSize = sizes && sizes.length > 0 ? sizes[0] : "Standard";

  // Calculate current item quantity in cart for defaultSize
  const currentQty = cartItems?.[_id]?.[defaultSize] || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(_id, defaultSize);
    playChime("add");
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(_id, defaultSize, currentQty + 1);
    playChime("add");
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(_id, defaultSize, currentQty - 1);
  };

  // Mock strikethrough original price for quick-commerce discount aesthetic
  const originalPrice = Math.round(price * 1.22);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-slate-800/90 rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-700/80 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative group"
    >
      <Link
        onClick={() => scrollTo(0, 0)}
        to={`/product/${_id}`}
        className="block flex-1"
      >
        {/* Product Image & Badges */}
        <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-700/40 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center">
          <img
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            src={image && image.length > 0 ? image[0] : "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"}
            alt={name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80";
            }}
          />

          {/* Blinkit 8-Min Delivery Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-cyan-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs tracking-wider">
            <Zap className="w-2.5 h-2.5 fill-amber-300 text-amber-300 animate-pulse" />
            <span>8 MINS</span>
          </div>

          {/* Discount Tag */}
          {discountPercent > 0 && (
            <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-md uppercase">
              {discountPercent}% OFF
            </div>
          )}

          {/* Bestseller Badge */}
          {bestseller && (
            <div className="absolute bottom-2 left-2 bg-slate-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-xs">
              ★ Best
            </div>
          )}
        </div>

        {/* Product Name & Subtext */}
        <div className="flex flex-col mb-2 px-0.5">
          {category && (
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase line-clamp-1">
              {category} • {defaultSize}
            </span>
          )}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            {name}
          </h3>
        </div>
      </Link>

      {/* Price & Quick ADD / Stepper Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 gap-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {currency}{price}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through">
              {currency}{originalPrice}
            </span>
          </div>
          <div className="flex items-center gap-0.5 text-[10px] text-amber-500 font-bold">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span>4.8</span>
          </div>
        </div>

        {/* Dynamic Blinkit ADD / Stepper Button */}
        {currentQty === 0 ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleAddToCart}
            className="px-4 py-1.5 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-600 dark:hover:bg-cyan-600 text-cyan-600 dark:text-cyan-400 hover:text-white dark:hover:text-white border-1.5 border-cyan-600 dark:border-cyan-600 rounded-lg font-black text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            {t("add", "ADD")}
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center bg-cyan-600 text-white rounded-lg px-1.5 py-1 gap-2 shadow-xs"
          >
            <button
              onClick={handleDecrement}
              className="p-0.5 hover:bg-cyan-700 rounded transition-colors"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <span className="font-black text-xs min-w-[14px] text-center">
              {currentQty}
            </span>
            <button
              onClick={handleIncrement}
              className="p-0.5 hover:bg-cyan-700 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductItem;
