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

// Dynamic origin validator: allows any localhost/127.0.0.1 port in dev or configured origins
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Mobile apps, curl, Postman
  if (explicitlyAllowedOrigins.includes(origin)) return true;
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
    message: "Cartivo API is running.",
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
  server.listen(port, () => {
    console.log(`\n🚀 Cartivo API & Real-time Server running on http://localhost:${port}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔐 Security: Dynamic CORS + Helmet + Rate Limiter + Mongo Sanitize`);
    console.log(`⚡ Real-Time: Socket.IO initialized on port ${port}\n`);
  });
}

export { app, server, io };
export default app;
