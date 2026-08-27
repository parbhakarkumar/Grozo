import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Zap, ShieldCheck } from "lucide-react";

const FloatingCartBar = () => {
  const { getCartCount, getCartAmount, currency, delivery_fee } = useContext(ShopContext);
  const totalCount = getCartCount();
  const subtotal = getCartAmount();
  
  // Complimentary delivery threshold e.g. ₹500
  const freeDeliveryThreshold = 500;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const amountNeeded = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <AnimatePresence>
      {totalCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="fixed bottom-4 left-0 right-0 z-50 px-4 sm:px-6 max-w-lg mx-auto pointer-events-auto"
        >
          <div className="bg-[#0C831F] text-white rounded-2xl shadow-2xl p-3 sm:p-3.5 border border-emerald-500/30 flex items-center justify-between gap-3 backdrop-blur-md">
            
            {/* Left: Cart Info & Free Delivery Indicator */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-bold text-white shrink-0">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-emerald-950 font-black text-[11px] rounded-full flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight">
                    {currency}{subtotal}
                  </span>
                  <span className="text-xs text-emerald-200 line-through">
                    {currency}{subtotal + delivery_fee}
                  </span>
                </div>
                
                <p className="text-[11px] text-emerald-100 font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
                  {isFreeDelivery ? (
                    <span className="font-bold text-amber-300">FREE 8-Min Delivery Unlocked!</span>
                  ) : (
                    <span>Add {currency}{amountNeeded} more for FREE delivery</span>
                  )}
                </p>
              </div>
            </div>

            {/* Right: Checkout CTA Button */}
            <Link
              to="/cart"
              className="group flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-95 shrink-0"
            >
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCartBar;
