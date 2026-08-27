import React, { useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShieldCheck, Loader2 } from "lucide-react";

const VerifyPayment = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const handleVerifyPayment = async () => {
    try {
      if (!token) return null;

      const res = await axios.post(
        backendUrl + "/api/order/verifystripe",
        { success, orderId },
        { headers: { token } }
      );

      if (res.data.success) {
        setCartItems({});
        toast.success("Payment verified! Order confirmed.");
        navigate("/orders");
      } else {
        toast.error("Payment was not completed.");
        navigate("/cart");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      navigate("/cart");
    }
  };

  useEffect(() => {
    if (token) {
      handleVerifyPayment();
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-luxury text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-950 text-white flex items-center justify-center mb-4 shadow-sm">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <h3 className="font-editorial text-xl text-zinc-950 font-medium mb-1">
          Verifying Transaction
        </h3>
        <p className="text-xs text-zinc-500 font-light leading-relaxed mb-4">
          Please wait a moment while we securely authenticate your payment with the banking network...
        </p>
        <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Encrypted Gateway</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyPayment;

