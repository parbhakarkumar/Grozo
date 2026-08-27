import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import { ShieldCheck, Tag, Check, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

const CartTotal = () => {
  const { getCartAmount, currency, delivery_fee } = useContext(ShopContext);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  const subtotal = getCartAmount();
  const freeShippingThreshold = 500;
  const isFreeShipping = subtotal >= freeShippingThreshold && subtotal > 0;
  const effectiveDeliveryFee = subtotal === 0 ? 0 : isFreeShipping ? 0 : delivery_fee;
  const total = Math.max(0, subtotal - discount + effectiveDeliveryFee);

  const applyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === "CARTIVO20" || code === "EASE20") {
      const disc = Math.round(subtotal * 0.2);
      setDiscount(disc);
      setAppliedCode(code);
      toast.success(`Promo code ${code} applied (20% Off)!`, { position: "bottom-center" });
    } else {
      toast.error("Invalid promo code. Try CARTIVO20", { position: "bottom-center" });
    }
  };


  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-subtle">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <h3 className="font-editorial text-lg text-zinc-950 font-medium">Order Summary</h3>
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Estimated</span>
      </div>

      {/* Free Shipping Progress */}
      {subtotal > 0 && (
        <div className="my-5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/60 text-xs">
          {isFreeShipping ? (
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <Check className="w-4 h-4" />
              <span>You've unlocked Complimentary Express Delivery!</span>
            </div>
          ) : (
            <div>
              <p className="text-zinc-600 font-light mb-2">
                Add <span className="font-semibold text-zinc-950">{currency}{freeShippingThreshold - subtotal}</span> more for <span className="font-semibold text-emerald-700">FREE Delivery</span>
              </p>
              <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-950 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Breakdown Items */}
      <div className="space-y-3.5 text-xs text-zinc-600 pt-2">
        <div className="flex justify-between items-center">
          <span className="font-light">Subtotal</span>
          <span className="font-semibold text-zinc-950 font-sans">{currency}{subtotal}.00</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center text-emerald-700 font-medium">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" /> Discount ({appliedCode})
            </span>
            <span>-{currency}{discount}.00</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="font-light">Estimated Shipping</span>
          <span className="font-semibold text-zinc-950">
            {subtotal === 0 ? (
              `${currency}0.00`
            ) : isFreeShipping ? (
              <span className="text-emerald-700 font-semibold uppercase text-[10px] tracking-wider bg-emerald-50 px-2 py-0.5 rounded">FREE</span>
            ) : (
              `${currency}${delivery_fee}.00`
            )}
          </span>
        </div>

        <div className="pt-4 border-t border-zinc-200 flex justify-between items-baseline">
          <span className="text-sm font-bold uppercase tracking-wider text-zinc-950">Total Amount</span>
          <span className="text-xl font-extrabold text-zinc-950 font-sans">
            {currency}{total}.00
          </span>
        </div>
      </div>

      {/* Promo Code Input */}
      <form onSubmit={applyPromo} className="mt-6 pt-6 border-t border-zinc-100 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Promo code (try EASE20)"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 uppercase tracking-wider focus:outline-none focus:border-zinc-950"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold tracking-wider transition-colors shrink-0"
        >
          Apply
        </button>
      </form>
    </div>
  );
};

export default CartTotal;

