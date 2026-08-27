import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Zap, Check, Tag } from "lucide-react";
import { toast } from "react-toastify";

const CartTotal = () => {
  const { getCartAmount, currency, delivery_fee } = useContext(ShopContext);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  const subtotal = getCartAmount();
  const freeShippingThreshold = 199;
  const isFreeShipping = subtotal >= freeShippingThreshold && subtotal > 0;
  const effectiveDeliveryFee = subtotal === 0 ? 0 : isFreeShipping ? 0 : delivery_fee;
  const total = Math.max(0, subtotal - discount + effectiveDeliveryFee);

  const applyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === "GROZO20" || code === "CARTIVO20" || code === "ZEPTO20") {
      const disc = Math.round(subtotal * 0.2);
      setDiscount(disc);
      setAppliedCode(code);
      toast.success(`Promo code ${code} applied (20% Off)!`, { position: "bottom-center" });
    } else {
      toast.error("Invalid promo code. Try GROZO20", { position: "bottom-center" });
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-base font-black text-slate-900">Bill Details</h3>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#0C831F] bg-emerald-50 px-2 py-0.5 rounded">
          Instant Dispatch
        </span>
      </div>

      {/* Free Shipping Progress */}
      {subtotal > 0 && (
        <div className="my-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
          {isFreeShipping ? (
            <div className="flex items-center gap-2 text-[#0C831F] font-bold">
              <Check className="w-4 h-4" />
              <span>Unlocked FREE 8-Min Delivery!</span>
            </div>
          ) : (
            <div>
              <p className="text-slate-700 font-medium mb-1.5 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                Add <span className="font-bold text-slate-900">{currency}{freeShippingThreshold - subtotal}</span> for <span className="font-bold text-[#0C831F]">FREE Delivery</span>
              </p>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0C831F] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Breakdown Items */}
      <div className="space-y-3 text-xs text-slate-600 pt-1">
        <div className="flex justify-between items-center">
          <span className="font-medium">Item Total</span>
          <span className="font-bold text-slate-900">{currency}{subtotal}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center text-[#0C831F] font-bold">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Discount ({appliedCode})
            </span>
            <span>-{currency}{discount}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="font-medium flex items-center gap-1">
            <span>Delivery Fee</span>
            <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
          </span>
          <span className="font-bold text-slate-900">
            {subtotal === 0 ? (
              `${currency}0`
            ) : isFreeShipping ? (
              <span className="text-[#0C831F] font-extrabold uppercase text-[10px] bg-emerald-100 px-2 py-0.5 rounded">FREE</span>
            ) : (
              `${currency}${delivery_fee}`
            )}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
          <span className="text-sm font-black uppercase text-slate-900">To Pay</span>
          <span className="text-xl font-black text-slate-900">
            {currency}{total}
          </span>
        </div>
      </div>

      {/* Promo Code Input */}
      <form onSubmit={applyPromo} className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          placeholder="Promo code (GROZO20)"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 uppercase focus:outline-none focus:border-[#0C831F]"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#0C831F] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
        >
          Apply
        </button>
      </form>
    </div>
  );
};

export default CartTotal;
