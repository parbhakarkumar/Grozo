import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import CartTotal from "../components/CartTotal";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Zap, ShieldCheck } from "lucide-react";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  return (
    <div className="py-4 sm:py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-[#0C831F] font-black text-xs uppercase tracking-widest">
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span>8-Min Express Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Your Cart ({cartData.reduce((acc, curr) => acc + curr.quantity, 0)} Items)
          </h1>
        </div>

        <Link
          to="/collection"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0C831F] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Add More Items</span>
        </Link>
      </div>

      {cartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Cart Items List (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* Delivery Guarantee Banner */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-950 font-bold">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
                <span>SuperFast 8-Min Delivery to Home</span>
              </div>
              <span className="bg-[#0C831F] text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">
                FREE
              </span>
            </div>

            <AnimatePresence>
              {cartData.map((item) => {
                const productData = products.find((product) => product._id === item._id);
                if (!productData) return null;

                return (
                  <motion.div
                    key={`${item._id}-${item.size}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    layout
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/40 transition-all gap-4 shadow-xs"
                  >
                    {/* Item Image + Details */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <img
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain p-1 rounded-xl bg-slate-50 shrink-0"
                        src={productData.image[0]}
                        alt={productData.name}
                      />

                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {productData.category} • {item.size}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                          {productData.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-black text-slate-900">
                            {currency}{productData.price}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            {currency}{Math.round(productData.price * 1.22)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove */}
                    <div className="flex items-center gap-4">
                      
                      {/* Blinkit Stepper */}
                      <div className="flex items-center bg-[#0C831F] text-white rounded-lg px-2 py-1 gap-2 shadow-xs">
                        <button
                          onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}
                          className="hover:bg-emerald-700 p-0.5 rounded"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <span className="font-black text-xs min-w-[14px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                          className="hover:bg-emerald-700 p-0.5 rounded"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>

                      {/* Trash */}
                      <button
                        onClick={() => updateQuantity(item._id, item.size, 0)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Right: Cart Total Summary (5 Cols) */}
          <div className="lg:col-span-5 sticky top-32 space-y-4">
            <CartTotal />

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/place-order")}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0C831F] hover:bg-emerald-700 text-white text-sm font-black tracking-wide uppercase py-3.5 px-6 rounded-2xl transition-all shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </motion.button>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 font-medium flex items-center justify-center gap-2 text-center">
              <ShieldCheck className="w-4 h-4 text-[#0C831F]" />
              <span>Safe & Encrypted Checkout • Instant Refunds</span>
            </div>
          </div>

        </div>
      ) : (
        /* Empty Cart State */
        <div className="text-center py-16 px-4 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 my-4 shadow-xs">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-[#0C831F] mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">
            Your Cart is Empty
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-6 font-medium">
            Explore our 8-min quick commerce store and add your favorite items!
          </p>
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0C831F] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-xs"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
