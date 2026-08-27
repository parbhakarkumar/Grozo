import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { products as defaultProducts } from "../assets/assets";

export const ShopContext = createContext();

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
    });

    newSocket.on("user_order_placed", (data) => {
      setRealtimeOrderUpdate({ ...data, timestamp: Date.now() });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [backendUrl, user?.id, user?._id]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_profile");
    setToken("");
    setUser(null);
    setCartItems({});
    toast.info("Signed out successfully.");
    navigate("/login");
  };

  const updateUserProfile = (updatedData) => {
    const newProfile = { ...user, ...updatedData };
    setUser(newProfile);
    localStorage.setItem("user_profile", JSON.stringify(newProfile));
    toast.success("Profile details updated!");
  };

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please select a size first!");
      return;
    }
    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Bag!");

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
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
            if (cartItems[items][item] > 0) {
              totalAmount += itemInfo.price * cartItems[items][item];
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
    navigate,
    backendUrl,
    setToken,
    token,
    setCartItems,
    user,
    setUser,
    logout,
    updateUserProfile,
    socket,
    realtimeOrderUpdate,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
