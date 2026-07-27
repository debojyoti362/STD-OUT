import express from "express";
import passport from "passport";
import User from "../models/user.js";

const router = express.Router();

// 1. SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const newUser = new User({ username, email });
    
    // User.register hashes password & saves to DB automatically
    const registeredUser = await User.register(newUser, password);

    // Auto-login after successful registration
    req.login(registeredUser, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({
        message: "Signup successful!",
        user: { id: registeredUser._id, username: registeredUser.username, email: registeredUser.email }
      });
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. LOGIN ROUTE
router.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({
    message: "Logged in successfully!",
    user: { id: req.user._id, username: req.user.username, email: req.user.email }
  });
});

// 3. LOGOUT ROUTE
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Logged out successfully!" });
  });
});

// 4. CHECK AUTH STATE (Used on page reload)
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      authenticated: true,
      user: { id: req.user._id, username: req.user.username, email: req.user.email }
    });
  }
  res.json({ authenticated: false, user: null });
});

export default router;