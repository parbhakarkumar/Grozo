import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  Truck, 
  Lock, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Sparkles,
  Smartphone
} from "lucide-react";
import UpiPaymentModal from "../components/UpiPaymentModal";

const PlaceOrder = () => {
  const { 
    navigate, 
    backendUrl, 
    token, 
    cartItems, 
    setCartItems, 
    getCartAmount, 
    getDiscountAmount,
    getEffectiveDeliveryFee,
    appliedPromo,
    delivery_fee, 
    products,
    currency = "₹",
    getProductPriceForSize
  } = useContext(ShopContext);

  const { walletPrefs, playChime, t } = useSettings();

  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "India",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getOrderItems = () => {
    let orderItems = [];
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          const product = products.find((p) => p._id === items);
          if (product) {
            const itemInfo = structuredClone(product);
            itemInfo.size = item;
            itemInfo.quantity = cartItems[items][item];
            itemInfo.price = getProductPriceForSize
              ? getProductPriceForSize(product, item)
              : product.price;
            orderItems.push(itemInfo);
          }
        }
      }
    }
    return orderItems;
  };

  const getCalculatedTotal = () => {
    const subtotal = getCartAmount();
    const discount = getDiscountAmount();
    const effectiveDeliveryFee = getEffectiveDeliveryFee();
    return Math.max(0, subtotal - discount + effectiveDeliveryFee);
  };

  const executeOrderPlacement = async ({ orderMethod, isPaid, transactionId = "", orderItems }) => {
    setLoading(true);

    try {
      const totalAmount = getCalculatedTotal();
      const discount = getDiscountAmount();

      const orderData = {
        items: orderItems,
        address: formData,
        amount: totalAmount,
        appliedPromo: appliedPromo ? appliedPromo.code : null,
        discountAmount: discount,
        paymentMethod: orderMethod.toUpperCase(),
        payment: isPaid,
        transactionId: transactionId || "",
        paymentDetails: isPaid ? {
          upiId: "kumarparbhakar2005-1@okhdfcbank",
          payee: "Parbhakar Kumar",
          utr: transactionId,
          verifiedAt: new Date().toISOString(),
        } : {},
        date: Date.now(),
        status: "Confirmed",
      };

      // Try backend API first if token and backendUrl are present
      if (token && backendUrl) {
        try {
          await axios.post(
            backendUrl + "/api/order/place",
            orderData,
            { headers: { token } }
          );
        } catch (apiError) {
          console.warn("Backend order sync note, saving locally:", apiError.message);
        }
      }

      // Always save order to local storage history as persistent backup
      const existingOrders = JSON.parse(localStorage.getItem("placed_orders") || "[]");
      const localOrder = {
        _id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        items: orderItems,
        address: formData,
        amount: totalAmount,
        paymentMethod: orderMethod.toUpperCase(),
        payment: isPaid,
        transactionId: transactionId || "",
        date: Date.now(),
        status: "Confirmed",
      };
      existingOrders.unshift(localOrder);
      localStorage.setItem("placed_orders", JSON.stringify(existingOrders));

      // Reset cart and notify user
      setCartItems({});
      setShowUpiModal(false);
      playChime("order");
      if (isPaid) {
        toast.success(`🎉 UPI Payment Verified (UTR: ${transactionId})! Order confirmed.`);
      } else {
        toast.success("🎉 Order placed successfully! Check your purchase history.");
      }
      navigate("/orders");

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const orderItems = getOrderItems();
    if (orderItems.length === 0) {
      toast.error("Your bag is empty. Please add items before checkout.");
      return;
    }

    // If UPI chosen, first prompt user to pay via QR scanner modal
    if (method === "upi") {
      setShowUpiModal(true);
      return;
    }

    // Otherwise Cash On Delivery
    await executeOrderPlacement({
      orderMethod: "COD",
      isPaid: false,
      transactionId: "",
      orderItems,
    });
  };

  const handleUpiPaymentSuccess = async (utr) => {
    const orderItems = getOrderItems();
    await executeOrderPlacement({
      orderMethod: "UPI",
      isPaid: true,
      transactionId: utr,
      orderItems,
    });
  };

  const totalPayable = getCalculatedTotal();

  return (
    <div className="py-8 sm:py-12 border-t border-zinc-200/80 dark:border-slate-800 animate-fade-in">
      
      {/* Page Title & Breadcrumb Indicator */}
      <div className="text-xl sm:text-2xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title text1={"CHECKOUT"} text2={"INFORMATION"} />
          <p className="text-xs text-zinc-500 dark:text-slate-400 font-light mt-1">
            Provide shipping address and select preferred payment gateway.
          </p>
        </div>

        {/* Security / Quality Badges */}
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-zinc-200/60 dark:border-slate-700/60 text-[11px] text-zinc-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            256-Bit SSL
          </span>
          <span className="text-zinc-300 dark:text-slate-600">|</span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            UPI & COD Protected
          </span>
        </div>
      </div>

      <form onSubmit={onSubmitHandler} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Side: Delivery Details Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-slate-700 shadow-subtle space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-slate-700/60 pb-3">
            <h3 className="font-editorial text-lg text-zinc-950 dark:text-white font-medium">
              1. Delivery Address
            </h3>
            <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400">
              * Required fields
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-slate-300 mb-1.5 block">
                First Name *
              </label>
              <input
                required
                name="firstName"
                value={formData.firstName}
                onChange={onChangeHandler}
                type="text"
                placeholder="e.g. Rahul"
                className="w-full bg-zinc-50 dark:bg-slate-700/60 border border-zinc-200 dark:border-slate-600 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-slate-300 mb-1.5 block">
                Last Name *
              </label>
              <input
                required
                name="lastName"
                value={formData.lastName}
                onChange={onChangeHandler}
                type="text"
                placeholder="e.g. Sharma"
                className="w-full bg-zinc-50 dark:bg-slate-700/60 border border-zinc-200 dark:border-slate-600 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-slate-300 mb-1.5 block">
              Email Address *
            </label>
            <input
              required
              name="email"
              value={formData.email}
              onChange={onChangeHandler}
              type="email"
              placeholder="e.g. rahul.sharma@example.com"
              className="w-full bg-zinc-50 dark:bg-slate-700/60 border border-zinc-200 dark:border-slate-600 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-slate-300 mb-1.5 block">
              Street / Flat / Building *
            </label>
            <input
              required
              name="street"
              value={formData.street}
              onChange={onChangeHandler}
              type="text"
              placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
              className="w-full bg-zinc-50 dark:bg-slate-700/60 border border-zinc-200 dark:border-slate-600 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-slate-300 mb-1.5 block">
                City *
              </label>
              <input
                required
                name="city"
                value={formData.city}
                onChange={onChangeHandler}
                type="text"
                placeholder="e.g. Mumbai"
                className="w-full bg-zinc-50 dark:bg-slate-700/60 border border-zinc-200 dark:border-slate-600 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-slate-300 mb-1.5 block">
                State *
              </label>
              <input
                required
                name="state"
                value={formData.state}
                onChange={onChangeHandler}
                type="text"
                placeholder="e.g. Maharashtra"
                className="w-full bg-zinc-50 dark:bg-slate-700/60 border border-zinc-200 dark:border-slate-600 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-slate-300 mb-1.5 block">
                Pincode / ZIP *
              </label>
              <input
                required
                name="zipcode"
                value={formData.zipcode}
                onChange={onChangeHandler}
                type="text"
                placeholder="e.g. 400001"
                className="w-full bg-zinc-50 dark:bg-slate-700/60 border border-zinc-200 dark:border-slate-600 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-slate-300 mb-1.5 block">
                Country
              </label>
              <input
                name="country"
                value={formData.country}
                onChange={onChangeHandler}
                type="text"
                placeholder="e.g. India"
                className="w-full bg-zinc-50 dark:bg-slate-700/60 border border-zinc-200 dark:border-slate-600 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-slate-300 mb-1.5 block">
              Phone Number *
            </label>
            <input
              required
              name="phone"
              value={formData.phone}
              onChange={onChangeHandler}
              type="tel"
              placeholder="e.g. +91 98765 43210"
              className="w-full bg-zinc-50 dark:bg-slate-700/60 border border-zinc-200 dark:border-slate-600 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Right Side: Order Summary & Payment Gateway (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-28">
          <CartTotal />

          {/* Payment Method Selector Card */}
          <div className="bg-white dark:bg-slate-800/90 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-slate-700 shadow-subtle space-y-4 transition-colors">
            <h3 className="font-editorial text-lg text-zinc-950 dark:text-white font-medium pb-3 border-b border-zinc-100 dark:border-slate-700/60">
              2. Payment Method
            </h3>

            <div className="space-y-3">
              {/* UPI QR Payment Option */}
              <div
                onClick={() => setMethod("upi")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  method === "upi"
                    ? "border-cyan-600 dark:border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 shadow-xs"
                    : "border-zinc-200 dark:border-slate-700 hover:border-zinc-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        method === "upi" ? "border-cyan-600 dark:border-cyan-500 bg-cyan-600 dark:bg-cyan-500" : "border-zinc-300 dark:border-slate-600"
                      }`}
                    >
                      {method === "upi" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          Online Payment (UPI QR Scan & Pay)
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                          Instant
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 dark:text-slate-400 font-light">
                        Scan QR via GPay, PhonePe, Paytm, BHIM
                      </span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-cyan-100/70 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>

                {/* Sub-banner preview when selected */}
                {method === "upi" && (
                  <div className="mt-3 pt-2.5 border-t border-cyan-200/60 dark:border-cyan-800/60 flex items-center gap-2 text-[11px] text-cyan-800 dark:text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-cyan-600" />
                    <span>You will scan the QR code and confirm your 12-digit UTR on the next step.</span>
                  </div>
                )}
              </div>

              {/* Cash On Delivery Option */}
              <div
                onClick={() => setMethod("cod")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  method === "cod"
                    ? "border-cyan-600 dark:border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 shadow-xs"
                    : "border-zinc-200 dark:border-slate-700 hover:border-zinc-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      method === "cod" ? "border-cyan-600 dark:border-cyan-500 bg-cyan-600 dark:bg-cyan-500" : "border-zinc-300 dark:border-slate-600"
                    }`}
                  >
                    {method === "cod" && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">Cash On Delivery (COD)</span>
                    <span className="text-[11px] text-zinc-500 dark:text-slate-400 font-light">Pay conveniently at your doorstep</span>
                  </div>
                </div>
                <Banknote className="w-6 h-6 text-zinc-700 dark:text-slate-300" />
              </div>
            </div>

            {/* Place Order CTA Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 disabled:from-slate-500 disabled:to-slate-500 text-white text-xs font-bold tracking-widest uppercase py-4 px-6 rounded-2xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                {loading ? (
                  <span>Processing Order...</span>
                ) : method === "upi" ? (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Pay {currency}{totalPayable} via UPI QR</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>{t("place_order", "Complete Order (COD)")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </form>

      {/* Interactive UPI QR Payment Gateway Modal */}
      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        amount={totalPayable}
        currency={currency}
        onPaymentSuccess={handleUpiPaymentSuccess}
        isSubmitting={loading}
      />
    </div>
  );
};

export default PlaceOrder;
