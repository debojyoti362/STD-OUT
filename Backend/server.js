import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import User from "./models/user.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;
const isProd = process.env.NODE_ENV === "production";

for (const key of ["MONGODB_URI", "SESSION_SECRET"]) {
  if (!process.env[key]) {
    console.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }
}

// Render sits behind a proxy; needed so "secure" cookies work
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 2. API Routes
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

// --- 3. DYNAMIC FRONTEND DIST PATH RESOLUTION ---
// Checks root-level frontend/dist first, then fallback to relative path
const rootDistPath = path.resolve(process.cwd(), "frontend/dist");
const relativeDistPath = path.resolve(__dirname, "../frontend/dist");
const frontendDistPath = fs.existsSync(rootDistPath) ? rootDistPath : relativeDistPath;

app.use(express.static(frontendDistPath));

// --- 4. SPA CATCH-ALL ROUTE ---
app.get("*", (req, res, next) => {
  // If the request is for an API route or file asset that doesn't exist, don't return index.html
  if (req.path.startsWith("/api")) {
    return next();
  }
  
  const indexPath = path.join(frontendDistPath, "index.html");
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send("Frontend build dist/index.html not found.");
  }
  
  res.sendFile(indexPath);
});

// 5. Connect Database and Start Server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connected with database");
    app.listen(port, () => console.log(`Server listening on port ${port}...`));
  })
  .catch((err) => {
    console.error("Failed to connect to database!", err);
    process.exit(1);
  });