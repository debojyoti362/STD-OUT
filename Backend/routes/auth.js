import express from "express";
import passport from "passport";
import User from "../models/user.js";

const router = express.Router();

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// SIGN UP
router.post("/signup", async (req, res) => {
  try {
    const { name = "", email = "", password = "" } = req.body || {};

    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });

    const user = await User.register(new User({ email, name: name.trim() }), password);

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Account created, but login failed. Please log in." });
      res.status(201).json({ message: "Signup successful", user: publicUser(user) });
    });
  } catch (err) {
    // e.g. UserExistsError
    res.status(400).json({ error: err.message || "Signup failed." });
  }
});

// LOG IN
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: "Incorrect email or password." });
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.json({ message: "Logged in", user: publicUser(user) });
    });
  })(req, res, next);
});

// LOG OUT
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed." });
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
});

// WHO AM I (called when the page loads)
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) return res.json({ authenticated: true, user: publicUser(req.user) });
  res.json({ authenticated: false, user: null });
});

export default router;
