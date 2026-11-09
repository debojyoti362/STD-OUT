import express from "express";
import Thread from "../models/thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();
router.use(requireAuth); // every route below needs a logged-in user

// all threads of the current user (newest first)
router.get("/threads", async (req, res) => {
  try {
    const threads = await Thread.find({ user: req.user._id })
      .select("threadId title updatedAt")
      .sort({ updatedAt: -1 });
    res.json(threads);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Threads could not be loaded" });
  }
});

// messages of one thread
router.get("/thread/:threadId", async (req, res) => {
  try {
    const thread = await Thread.findOne({ threadId: req.params.threadId, user: req.user._id });
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    res.json(thread.messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Thread could not be loaded" });
  }
});

// delete a thread
router.delete("/thread/:threadId", async (req, res) => {
  try {
    const thread = await Thread.findOneAndDelete({ threadId: req.params.threadId, user: req.user._id });
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    res.json({ success: "Thread deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Thread could not be deleted" });
  }
});

// send a message, get the AI reply
router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body || {};
  if (!threadId || !message || !String(message).trim()) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let thread = await Thread.findOne({ threadId, user: req.user._id });
    if (!thread) {
      // threadId is globally unique, so refuse an id that belongs to someone else
      if (await Thread.exists({ threadId })) return res.status(403).json({ error: "Invalid thread" });
      thread = new Thread({ user: req.user._id, threadId, title: String(message).slice(0, 60), messages: [] });
    }
    thread.messages.push({ role: "user", content: message });

    // send recent history so the AI remembers the conversation
    const history = thread.messages.slice(-20).map((m) => ({ role: m.role, content: m.content }));
    const reply = await getOpenAIAPIResponse(history);

    thread.messages.push({ role: "assistant", content: reply });
    thread.updatedAt = new Date();
    await thread.save();

    res.json({ reply });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
});

export default router;
