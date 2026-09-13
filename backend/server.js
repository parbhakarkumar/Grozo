import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import { Server } from "socket.io";
import "dotenv/config";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { initCronJobs } from "./cron/cronJobs.js";

import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import adminRouter from "./routes/adminRoute.js";
import trackingRouter from "./routes/trackingRoute.js";

// ─────────────────────────────────────────────
// Initialize App & HTTP Server
// ─────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;
const isDev = process.env.NODE_ENV !== "production";

// Connect to DB & Cloud Storage only if not testing
if (process.env.NODE_ENV !== "test") {
  connectDB();
  connectCloudinary();
  initCronJobs();
}

// ─────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Explicitly configured origins
const explicitlyAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

// Dynamic origin validator: allows any localhost/127.0.0.1 port in dev, vercel.app domains, or configured origins
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Mobile apps, curl, Postman
  if (explicitlyAllowedOrigins.includes(origin)) return true;
  try {
    const hostname = new URL(origin).hostname;
    if (hostname.endsWith(".vercel.app")) return true;
  } catch {}
  if (isDev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "token",
    "token_admin",
    "Accept",
    "X-Requested-With",
  ],
  exposedHeaders: ["token"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ─────────────────────────────────────────────
// Socket.IO Real-Time Engine Setup
// ─────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`⚡ [Socket.IO] Client connected: ${socket.id}`);

  // Admin panel joins admin broadcast room
  socket.on("join_admin", () => {
    socket.join("admin_room");
    console.log(`🛡️ [Socket.IO] Admin joined admin_room: ${socket.id}`);
  });

  // Customer storefront joins their private user room
  socket.on("join_user", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`👤 [Socket.IO] User ${userId} joined room user_${userId}`);
    }
  });

  socket.on("leave_user", (userId) => {
    if (userId) {
      socket.leave(`user_${userId}`);
    }
  });

  // Tracking page joins specific live order room
  socket.on("join_order", (orderId) => {
    if (orderId) {
      socket.join(`order_${orderId}`);
      console.log(`📍 [Socket.IO] Client ${socket.id} joined live tracking for order_${orderId}`);
    }
  });

  socket.on("leave_order", (orderId) => {
    if (orderId) {
      socket.leave(`order_${orderId}`);
    }
  });

  // ── Live Delivery Chat ─────────────────────────
  const RIDER_REPLIES = [
    "On my way! Will be there shortly 🛵",
    "Almost at your location, please be ready!",
    "Stuck in a small traffic jam, 2 mins more 🚦",
    "I can see your building, coming up now!",
    "At the entrance, please come to collect your order 📦",
    "Just a minute away! Please keep the OTP ready 🔐",
    "Navigating through the lane, almost there!",
    "Your order is safe with me, arriving soon! 😊",
    "Taking the shortcut, will reach faster! ⚡",
    "Hi! I'm your delivery partner. On my way to you!",
  ];

  socket.on("chat_message", (payload) => {
    const { orderId, message, sender, senderName, timestamp } = payload;
    if (!orderId || !message) return;

    const chatMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      orderId,
      message,
      sender: sender || "customer",
      senderName: senderName || "You",
      timestamp: timestamp || new Date().toISOString(),
    };

    // Broadcast to everyone in the order room
    io.to(`order_${orderId}`).emit("chat_message", chatMsg);
    console.log(`💬 [Chat] ${chatMsg.sender} → order_${orderId}: ${message}`);

    // Simulated rider auto-reply when customer sends a message
    if (sender === "customer") {
      const delay = 2000 + Math.random() * 2000; // 2-4 seconds

      // Typing indicator
      setTimeout(() => {
        io.to(`order_${orderId}`).emit("chat_typing", { orderId, sender: "rider" });
      }, delay * 0.4);

      // Rider reply
      setTimeout(() => {
        io.to(`order_${orderId}`).emit("chat_stop_typing", { orderId, sender: "rider" });

        const reply = RIDER_REPLIES[Math.floor(Math.random() * RIDER_REPLIES.length)];
        const riderMsg = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          orderId,
          message: reply,
          sender: "rider",
          senderName: "Rajesh Kumar",
          timestamp: new Date().toISOString(),
        };
        io.to(`order_${orderId}`).emit("chat_message", riderMsg);
        console.log(`🛵 [Chat] Rider auto-reply → order_${orderId}: ${reply}`);
      }, delay);
    }
  });

  socket.on("chat_typing", (payload) => {
    const { orderId, sender } = payload;
    if (orderId) {
      socket.to(`order_${orderId}`).emit("chat_typing", { orderId, sender });
    }
  });

  socket.on("chat_stop_typing", (payload) => {
    const { orderId, sender } = payload;
    if (orderId) {
      socket.to(`order_${orderId}`).emit("chat_stop_typing", { orderId, sender });
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
  });

});

// Attach io instance to express app
app.set("io", io);

// ─────────────────────────────────────────────
// General Middleware
// ─────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Strip MongoDB operator injection from request bodies
app.use(mongoSanitize());

// HTTP request logging
app.use(morgan(isDev ? "dev" : "combined"));

// Global rate limiting on all API routes
app.use("/api", apiLimiter);

// ─────────────────────────────────────────────
// Health Check & Socket Status
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Grozo API is running.",
    version: "2.1.0",
    realtime: "Socket.IO Active",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/orders", orderRouter); // RESTful alias
app.use("/api/tracking", trackingRouter);
app.use("/api/admin", adminRouter);

// ─────────────────────────────────────────────
// 404 Handler — Unknown Routes
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─────────────────────────────────────────────
// Global Error Handler (must be last)
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n⚠️  [PORT BUSY] Port ${port} is currently occupied by another process.`);
      console.error(`💡  To free port ${port}, run: npx --yes kill-port ${port}\n`);
      process.exit(1);
    } else {
      console.error("❌ Server error:", err.message);
      process.exit(1);
    }
  });

  server.listen(port, () => {
    console.log(`\n🚀 Grozo API & Real-time Server running on http://localhost:${port}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔐 Security: Dynamic CORS + Helmet + Rate Limiter + Mongo Sanitize`);
    console.log(`⚡ Real-Time: Socket.IO initialized on port ${port}\n`);
  });
}

export { app, server, io };
export default app;
