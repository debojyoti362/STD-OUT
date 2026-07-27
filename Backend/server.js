import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import chatRoutes from "./routes/chat.js";

const app = express();
const port = 8080;

// 1. Enable CORS with credentials
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 2. Parse incoming JSON
app.use(express.json());

// 3. Configure & mount Session BEFORE routes
app.use(
  session({
    secret: "debojyoti9614",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// 4. Test route to verify cookie creation
app.get("/api/test-session", (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  res.json({ message: "Session set!", views: req.session.views });
});

// 5. Mount API routes
app.use("/api", chatRoutes);

app.get("/", (req, res) => {
  res.send("Server running");
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Successfully connected with database");
  } catch (err) {
    console.log("Failed to connect!", err);
  }
};

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
  connectDB();
});