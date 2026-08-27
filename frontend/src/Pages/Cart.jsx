import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { useNavigate, Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

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
    <div className="py-8 sm:py-12 border-t border-zinc-200/80 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-200/80">
        <div>
          <Title text1="SHOPPING" text2="BAG" />
          <p className="text-xs text-zinc-400 font-light -mt-4">
            Review your selected items before proceeding to secure checkout.
          </p>
        </div>

        <Link
          to="/collection"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {cartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left: Cart Items List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {cartData.map((item, i) => {
              const productData = products.find((product) => product._id === item._id);
              if (!productData) return null;

              return (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 transition-all gap-4 shadow-xs"
                >
                  {/* Item Image + Details */}
                  <div className="flex items-center gap-4 sm:gap-5 flex-1">
                    <img
                      className="w-20 sm:w-24 aspect-[3/4] object-cover rounded-xl bg-zinc-100 shrink-0"
                      src={productData.image[0]}
                      alt={productData.name}
                    />

                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                        {productData.category}
                      </span>
                      <h4 className="text-sm font-semibold text-zinc-900 line-clamp-1 mb-1">
                        {productData.name}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-zinc-500 font-light">Size:</span>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px] font-semibold">
                          {item.size}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-zinc-950 font-sans">
                        {currency}{productData.price}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                    
                    {/* Stepper Controls */}
                    <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item._id, item.size, Math.max(0, item.quantity - 1))}
                        className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-zinc-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                        className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total for this line */}
                    <div className="hidden md:block min-w-[70px] text-right">
                      <span className="text-xs text-zinc-400 font-light block">Subtotal</span>
                      <span className="text-sm font-bold text-zinc-950 font-sans">
                        {currency}{productData.price * item.quantity}
                      </span>
                    </div>

                    {/* Trash / Delete */}
                    <button
                      onClick={() => updateQuantity(item._id, item.size, 0)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Cart Total Summary (5 Cols) */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <CartTotal />

            <button
              onClick={() => navigate("/place-order")}
              className="w-full inline-flex items-center justify-center gap-3 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold tracking-widest uppercase py-4 px-6 rounded-2xl transition-all shadow-md active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* Empty Cart State */
        <div className="text-center py-24 px-4 flex flex-col items-center justify-center bg-white rounded-3xl border border-zinc-200/80 my-8 shadow-xs">
          <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-5">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="font-editorial text-xl sm:text-2xl text-zinc-950 font-normal mb-2">
            Your shopping bag is empty
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mb-8 font-light leading-relaxed">
            Looks like you haven't added anything to your cart yet. Explore our curated collections to find your essentials.
          </p>
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-950 text-white rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-all shadow-sm"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;

