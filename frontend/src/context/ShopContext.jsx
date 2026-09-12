import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { products as defaultProducts } from "../assets/assets";

export const ShopContext = createContext();

export const AVAILABLE_PROMOS = [
  {
    code: "GROZO20",
    title: "20% OFF Everything",
    desc: "Get 20% discount on all groceries & essentials",
    discountPercent: 20,
    minOrder: 0,
    type: "PERCENT",
    badge: "POPULAR",
  },
  {
    code: "FRESH50",
    title: "Flat ₹50 OFF",
    desc: "Flat ₹50 savings on orders above ₹150",
    flatDiscount: 50,
    minOrder: 150,
    type: "FLAT",
    badge: "SUPER DEAL",
  },
  {
    code: "ZEPTO50",
    title: "50% OFF (Up to ₹100)",
    desc: "Enjoy half price savings up to ₹100 on snacks & drinks",
    discountPercent: 50,
    maxDiscount: 100,
    minOrder: 100,
    type: "PERCENT_CAPPED",
    badge: "LIMITED",
  },
  {
    code: "FREE8",
    title: "FREE 8-Min Delivery",
    desc: "100% off delivery fee on your instant order",
    freeDelivery: true,
    minOrder: 0,
    type: "FREE_DELIVERY",
    badge: "EXPRESS",
  },
];

// ─────────────────────────────────────────────
// Dynamic Size-Based Pricing Helper
// Calculates realistic proportional unit price based on pack size / weight / volume
// ─────────────────────────────────────────────
export const getProductPriceForSize = (product, size) => {
  if (!product || !product.price) return 0;
  const basePrice = Number(product.price);
  if (!size || !product.sizes || product.sizes.length <= 1) return basePrice;

  // Explicit sizePrice override if present on product
  if (product.sizePrices && product.sizePrices[size]) {
    return Number(product.sizePrices[size]);
  }

  // Parse numeric weight/volume if present (e.g. "100g", "200g", "500g", "1kg", "5kg", "500ml", "1L")
  const parseQty = (s) => {
    if (!s) return null;
    const str = String(s).toLowerCase().trim();
    const kgMatch = str.match(/^([\d.]+)\s*kg$/);
    if (kgMatch) return parseFloat(kgMatch[1]) * 1000;
    const gMatch = str.match(/^([\d.]+)\s*g$/);
    if (gMatch) return parseFloat(gMatch[1]);
    const lMatch = str.match(/^([\d.]+)\s*l(?:iter)?$/);
    if (lMatch) return parseFloat(lMatch[1]) * 1000;
    const mlMatch = str.match(/^([\d.]+)\s*ml$/);
    if (mlMatch) return parseFloat(mlMatch[1]);
    const pcMatch = str.match(/^([\d.]+)\s*(?:pc|pack|pcs)$/);
    if (pcMatch) return parseFloat(pcMatch[1]);
    return null;
  };

  const baseSize = product.sizes[0];
  const baseVal = parseQty(baseSize);
  const targetVal = parseQty(size);

  if (baseVal && targetVal && baseVal > 0) {
    const ratio = targetVal / baseVal;
    // Bulk packaging discount savings
    const bulkDiscount = ratio >= 4 ? 0.92 : ratio >= 2 ? 0.95 : 1;
    return Math.max(1, Math.round(basePrice * ratio * bulkDiscount));
  }

  // Index-based fallback for standard apparel / generic sizes (S, M, L, XL, etc.)
  const idx = product.sizes.indexOf(size);
  if (idx > 0) {
    const multipliers = [1, 1.35, 1.7, 2.1, 2.5];
    const mult = multipliers[idx] || (1 + idx * 0.35);
    return Math.round(basePrice * mult);
  }

  return basePrice;
};

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 20;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState(defaultProducts || []);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [socket, setSocket] = useState(null);
  const [realtimeOrderUpdate, setRealtimeOrderUpdate] = useState(null);
  const [userOrdersList, setUserOrdersList] = useState([]);
  
  // Promo code global state
  const [appliedPromo, setAppliedPromo] = useState(() => {
    try {
      const saved = localStorage.getItem("applied_promo");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persistent User Profile State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  // ─────────────────────────────────────────────
  // Promo Code Engine
  // ─────────────────────────────────────────────
  const applyPromoCode = (inputCode) => {
    const code = inputCode.trim().toUpperCase();
    const promo = AVAILABLE_PROMOS.find((p) => p.code === code);

    if (!promo) {
      toast.error(`Invalid code "${code}". Try GROZO20 or FRESH50`, { position: "bottom-center" });
      return false;
    }

    const subtotal = getCartAmount();
    if (promo.minOrder && subtotal < promo.minOrder) {
      toast.warn(`Minimum order amount of ${currency}${promo.minOrder} required for ${code}`, {
        position: "bottom-center",
      });
      return false;
    }

    setAppliedPromo(promo);
    localStorage.setItem("applied_promo", JSON.stringify(promo));
    toast.success(`🎉 Promo code ${code} applied successfully!`, { position: "bottom-center" });
    return true;
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    localStorage.removeItem("applied_promo");
    toast.info("Promo code removed.");
  };

  const getDiscountAmount = () => {
    const subtotal = getCartAmount();
    if (!appliedPromo || subtotal === 0) return 0;

    if (appliedPromo.type === "PERCENT") {
      return Math.round((subtotal * appliedPromo.discountPercent) / 100);
    } else if (appliedPromo.type === "FLAT") {
      return Math.min(subtotal, appliedPromo.flatDiscount);
    } else if (appliedPromo.type === "PERCENT_CAPPED") {
      const calc = Math.round((subtotal * appliedPromo.discountPercent) / 100);
      return Math.min(calc, appliedPromo.maxDiscount || 100);
    } else if (appliedPromo.type === "FREE_DELIVERY") {
      return 0; // Waives delivery fee directly in calculation
    }
    return 0;
  };

  const getEffectiveDeliveryFee = () => {
    const subtotal = getCartAmount();
    if (subtotal === 0) return 0;
    if (appliedPromo?.type === "FREE_DELIVERY") return 0;
    if (subtotal >= 199) return 0; // Free delivery threshold
    return delivery_fee;
  };

  // ─────────────────────────────────────────────
  // Real-Time Socket.IO Synchronization
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!backendUrl) return;

    const newSocket = io(backendUrl, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("⚡ [Socket.IO] Storefront connected:", newSocket.id);
      const userId = user?.id || user?._id;
      if (userId) {
        newSocket.emit("join_user", userId);
      }
    });

    newSocket.on("order_status_updated", (data) => {
      toast.info(`📦 Order #${data.orderId ? data.orderId.slice(-6) : ""}: Status changed to "${data.status}"!`, {
        autoClose: 6000,
      });
      setRealtimeOrderUpdate({ ...data, timestamp: Date.now() });
      fetchUserOrders();
    });

    newSocket.on("user_order_placed", (data) => {
      setRealtimeOrderUpdate({ ...data, timestamp: Date.now() });
      fetchUserOrders();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [backendUrl, user?.id, user?._id]);

  // Fetch full user profile from backend on token change
  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const res = await axios.get(backendUrl + "/api/user/profile", {
        headers: { token },
      });
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("user_profile", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.log("Profile fetch note:", err.message);
    }
  };

  const fetchUserOrders = async () => {
    if (!token) return;
    try {
      const res = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      if (res.data.success) {
        setUserOrdersList(res.data.orders.reverse());
      }
    } catch (err) {
      console.log("Orders fetch error:", err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchUserOrders();
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_profile");
    localStorage.removeItem("applied_promo");
    setToken("");
    setUser(null);
    setCartItems({});
    setAppliedPromo(null);
    setUserOrdersList([]);
    toast.info("Signed out successfully.");
    navigate("/login");
  };

  const updateUserProfile = async (updatedData) => {
    try {
      if (token) {
        const res = await axios.put(
          backendUrl + "/api/user/profile",
          updatedData,
          { headers: { token } }
        );
        if (res.data.success && res.data.user) {
          const newProfile = { ...user, ...res.data.user };
          setUser(newProfile);
          localStorage.setItem("user_profile", JSON.stringify(newProfile));
          toast.success("Profile details updated!");
          return true;
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
    const newProfile = { ...user, ...updatedData };
    setUser(newProfile);
    localStorage.setItem("user_profile", JSON.stringify(newProfile));
    return true;
  };

  const addToCart = async (itemId, size, quantity = 1) => {
    if (!size) {
      toast.error("Please select a pack / size first!");
      return;
    }
    const qtyToAdd = Math.max(1, Number(quantity) || 1);
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += qtyToAdd;
      } else {
        cartData[itemId][size] = qtyToAdd;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = qtyToAdd;
    }
    setCartItems(cartData);
    toast.success(`Added ${qtyToAdd > 1 ? qtyToAdd + 'x ' : ''}to Grocery Bag!`);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size, quantity: qtyToAdd },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity <= 0) {
      delete cartData[itemId][size];
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    } else {
      cartData[itemId][size] = quantity;
    }
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo) {
        for (const item in cartItems[items]) {
          try {
            const qty = cartItems[items][item];
            if (qty > 0) {
              const unitPrice = getProductPriceForSize(itemInfo, item);
              totalAmount += unitPrice * qty;
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      if (backendUrl) {
        const response = await axios.get(backendUrl + "/api/product/list");
        if (response.data.success && response.data.products && response.data.products.length > 0) {
          setProducts(response.data.products);
        } else {
          setProducts(defaultProducts);
        }
      }
    } catch (error) {
      setProducts(defaultProducts);
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );

      if (response.data.success && response.data.cartData) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (token) {
      getUserCart(token);
    }
  }, [token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    getProductPriceForSize,
    navigate,
    backendUrl,
    setToken,
    token,
    setCartItems,
    user,
    setUser,
    role: user?.role || "user",
    isAdmin,
    logout,
    updateUserProfile,
    fetchUserProfile,
    socket,
    realtimeOrderUpdate,
    userOrdersList,
    fetchUserOrders,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    getDiscountAmount,
    getEffectiveDeliveryFee,
    availablePromos: AVAILABLE_PROMOS,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;