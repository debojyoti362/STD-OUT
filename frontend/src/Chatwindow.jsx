import "./Chatwindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";
import { useContext, useState } from "react";
import { RingLoader } from "react-spinners";

function Chatwindow() {
  const { prompt, setprompt, setreply, currThreadId, setPrevChats, setNewChat, setThreadsVersion } =
    useContext(MyContext);
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const getreply = async () => {
    if (loading || !prompt.trim()) return;

    const currentMessage = prompt;
    setprompt("");
    setLoading(true);
    setNewChat(false);

    // show the user's message immediately
    setPrevChats((prev) => [...prev, { role: "user", content: currentMessage }]);

    try {
      const res = await api("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: currentMessage, threadId: currThreadId }),
      });
      setreply(res.reply);
      setPrevChats((prev) => [...prev, { role: "assistant", content: res.reply }]);
      setThreadsVersion((v) => v + 1); // refresh sidebar so a new chat shows up
    } catch (e) {
      if (e.status === 401) {
        logout(); // session expired -> back to login page
        return;
      }
      setPrevChats((prev) => [...prev, { role: "assistant", content: `⚠️ ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span>
          STD-out <i className="fa-solid fa-angle-down"></i>
        </span>
        <div className="userIconDiv">
          <span className="userIcon">
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>

      <Chat />

      <RingLoader color="#fff" loading={loading} />

      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder="Ask Anything"
            value={prompt}
            onChange={(e) => setprompt(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? getreply() : "")}
          />
          <button id="submit" onClick={getreply}>
            <i className="fa-regular fa-paper-plane"></i>
          </button>
        </div>
        <p className="info">
          By messaging STD-out, an AI chatbot, you agree to our Terms and have read our Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default Chatwindow;
