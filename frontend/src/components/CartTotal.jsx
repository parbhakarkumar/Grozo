import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";
import { Zap, Check, Tag, X, Percent, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";

const CartTotal = () => {
  const { 
    getCartAmount, 
    currency, 
    appliedPromo, 
    applyPromoCode, 
    removePromoCode, 
    getDiscountAmount, 
    getEffectiveDeliveryFee,
    availablePromos 
  } = useContext(ShopContext);

  const { t } = useSettings();

  const [inputCode, setInputCode] = useState("");
  const [showPromoList, setShowPromoList] = useState(false);

  const subtotal = getCartAmount();
  const discount = getDiscountAmount();
  const effectiveDeliveryFee = getEffectiveDeliveryFee();
  const total = Math.max(0, subtotal - discount + effectiveDeliveryFee);
  const isFreeShipping = effectiveDeliveryFee === 0 && subtotal > 0;
  const freeShippingThreshold = 199;

  const handleApply = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const success = applyPromoCode(inputCode);
    if (success) setInputCode("");
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800/90 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
        <h3 className="text-base font-black text-slate-900 dark:text-white">{t("bill_details", "Bill Details")}</h3>
        <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800/60">
          ⚡ 8-Min Dispatch
        </span>
      </div>

      {/* Free Shipping Progress */}
      {subtotal > 0 && (
        <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-xs">
          {isFreeShipping ? (
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-300 font-bold">
              <Check className="w-4 h-4" />
              <span>Unlocked FREE 8-Min Delivery!</span>
            </div>
          ) : (
            <div>
              <p className="text-slate-700 dark:text-slate-300 font-medium mb-1.5 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                Add <span className="font-bold text-slate-900 dark:text-white">{currency}{freeShippingThreshold - subtotal}</span> for <span className="font-bold text-cyan-600 dark:text-cyan-400">FREE Delivery</span>
              </p>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Breakdown Items */}
      <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
        <div className="flex justify-between items-center">
          <span className="font-medium">{t("item_total", "Item Total")}</span>
          <span className="font-bold text-slate-900 dark:text-white">{currency}{subtotal}</span>
        </div>

        {appliedPromo && discount > 0 && (
          <div className="flex justify-between items-center text-cyan-600 dark:text-cyan-400 font-bold">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Discount ({appliedPromo.code})
            </span>
            <span>-{currency}{discount}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="font-medium flex items-center gap-1">
            <span>{t("delivery_fee", "Delivery Fee")}</span>
            <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {subtotal === 0 ? (
              `${currency}0`
            ) : isFreeShipping ? (
              <span className="text-cyan-600 dark:text-cyan-400 font-extrabold uppercase text-[10px] bg-cyan-100 dark:bg-cyan-900/60 px-2 py-0.5 rounded">FREE</span>
            ) : (
              `${currency}${effectiveDeliveryFee}`
            )}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
          <span className="text-sm font-black uppercase text-slate-900 dark:text-white">To Pay</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {currency}{total}
          </span>
        </div>
      </div>

      {/* Applied Promo Code Pill OR Input Form */}
      {appliedPromo ? (
        <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-cyan-900 dark:text-cyan-200">{appliedPromo.code} Applied</p>
              <p className="text-[10px] text-cyan-700 dark:text-cyan-400">{appliedPromo.title}</p>
            </div>
          </div>
          <button
            onClick={removePromoCode}
            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700"
            title="Remove Coupon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <form onSubmit={handleApply} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter Promo Code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              Apply
            </button>
          </form>

          {/* Clickable available offers toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowPromoList(!showPromoList)}
              className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Percent className="w-3 h-3" />
              <span>{showPromoList ? "Hide Available Coupons" : "View Available Coupons"}</span>
            </button>

            {showPromoList && (
              <div className="mt-2 space-y-1.5 animate-fade-in">
                {availablePromos.map((promo) => (
                  <div
                    key={promo.code}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 dark:text-white font-mono">{promo.code}</span>
                        <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black px-1.5 py-0.2 rounded">
                          {promo.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{promo.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyPromoCode(promo.code)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-600 hover:text-white font-bold text-[10px] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartTotal;
