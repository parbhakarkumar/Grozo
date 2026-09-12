import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";
import CartTotal from "../components/CartTotal";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft,
  Zap, ShieldCheck, Tag, ChevronRight, Info
} from "lucide-react";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm ${className}`}>{children}</div>
);

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, getProductPriceForSize } = useContext(ShopContext);
  const { t } = useSettings();
  const [cartData, setCartData] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({ _id: items, size: item, quantity: cartItems[items][item] });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  const totalItems = cartData.reduce((acc, curr) => acc + curr.quantity, 0);

  const handlePromo = () => {
    if (promoCode.trim().toUpperCase() === "GROZO10") {
      setPromoApplied(true);
      import("react-toastify").then(({ toast }) => toast.success("Promo code applied! ₹10 off your order."));
    } else {
      import("react-toastify").then(({ toast }) => toast.error("Invalid promo code."));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-800 dark:text-slate-200 font-medium">{t("shopping_cart", "Shopping Cart")}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("shopping_cart", "Shopping Cart")}
              {totalItems > 0 && <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">({totalItems} {totalItems === 1 ? "item" : "items"})</span>}
            </h1>
          </div>
          <Link to="/collection" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
            <ArrowLeft size={13} /> {t("continue_shopping", "Continue Shopping")}
          </Link>
        </div>

        {cartData.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-5 items-start">

            {/* Left: Cart Items */}
            <div className="flex-1 min-w-0 space-y-3">

              {/* Delivery Banner */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-800/60 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 font-semibold">
                  <Zap size={13} className="text-amber-500 fill-amber-400" />
                  <span>8-Min Express Delivery to your door</span>
                </div>
                <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/60 px-2 py-0.5 rounded uppercase">FREE</span>
              </div>

              {/* Items */}
              <Card>
                <AnimatePresence>
                  {cartData.map((item, idx) => {
                    const productData = products.find((p) => p._id === item._id);
                    if (!productData) return null;
                    const isLast = idx === cartData.length - 1;
                    const unitPrice = getProductPriceForSize
                      ? getProductPriceForSize(productData, item.size)
                      : productData.price;
                    const lineTotal = unitPrice * item.quantity;

                    return (
                      <motion.div
                        key={`${item._id}-${item.size}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        layout
                        className={`flex items-center gap-4 p-4 ${!isLast ? "border-b border-slate-100 dark:border-slate-700/60" : ""}`}
                      >
                        {/* Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 flex-shrink-0 overflow-hidden">
                          <img
                            src={productData.image[0]}
                            alt={productData.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80";
                            }}
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold uppercase tracking-wider">
                            {productData.category} · {item.size}
                          </p>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-1">{productData.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{currency}{unitPrice}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">/ {item.size}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 line-through">{currency}{Math.round(unitPrice * 1.22)}</span>
                            <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded">
                              {Math.round(((unitPrice * 1.22 - unitPrice) / (unitPrice * 1.22)) * 100)}% off
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 mt-1">
                            Total: <span className="font-bold">{currency}{lineTotal}</span>
                          </p>
                        </div>

                        {/* Quantity + Delete */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Stepper */}
                          <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-700/40">
                            <button
                              onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}
                              className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-colors"
                            >
                              <Minus size={12} strokeWidth={2.5} />
                            </button>
                            <span className="px-3 py-1.5 text-sm font-semibold text-slate-800 dark:text-white border-x border-slate-300 dark:border-slate-600 min-w-[36px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                              className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 transition-colors"
                            >
                              <Plus size={12} strokeWidth={2.5} />
                            </button>
                          </div>

                          <button
                            onClick={() => updateQuantity(item._id, item.size, 0)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </Card>

              {/* Promo Code */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={14} className="text-cyan-600" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Promo Code</p>
                  {promoApplied && (
                    <span className="ml-auto text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded">Applied!</span>
                  )}
                </div>
                {!promoApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      placeholder="Enter promo code (try GROZO10)"
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handlePromo}
                      className="px-4 py-2 text-sm font-semibold bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">{promoCode.toUpperCase()}</span>
                    <span className="text-slate-600 dark:text-slate-300">−₹10 discount applied</span>
                    <button onClick={() => { setPromoApplied(false); setPromoCode(""); }} className="text-xs text-slate-400 hover:text-red-500">Remove</button>
                  </div>
                )}
              </Card>

              {/* Info */}
              <div className="flex items-start gap-2 px-1">
                <Info size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Prices and availability are subject to change. Items in your cart are not reserved.</p>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-80 flex-shrink-0 space-y-3 lg:sticky lg:top-24">
              <CartTotal />

              <button
                onClick={() => navigate("/place-order")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md active:scale-98"
              >
                {t("place_order", "Proceed to Checkout")} <ArrowRight size={15} />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-2">
                <ShieldCheck size={13} className="text-cyan-600" />
                <span>Secure checkout · Instant refunds · 100% safe</span>
              </div>

              {/* Accepted Payments */}
              <Card className="p-3">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-2 text-center">We Accept</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {["UPI", "Visa", "Mastercard", "Rupay", "COD"].map(p => (
                    <span key={p} className="px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-lg">
                      {p}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Empty State */
          <Card className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} className="text-slate-400 dark:text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Your cart is empty</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
              Add items to your cart to get started. Delivery in just 8 minutes!
            </p>
            <Link
              to="/collection"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Start Shopping <ArrowRight size={14} />
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Cart;
