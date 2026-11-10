import "./Chatwindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";
import { useContext, useState, useRef, useEffect } from "react";
import { RingLoader } from "react-spinners";

function Chatwindow() {
  const { prompt, setprompt, setreply, currThreadId, setPrevChats, setNewChat, setThreadsVersion } =
    useContext(MyContext);
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        {/* User Profile Dropdown Container */}
        <div className="userIconDiv" ref={dropdownRef} style={{ position: "relative" }}>
          <span 
            className="userIcon" 
            onClick={() => setShowProfile((prev) => !prev)}
            style={{ cursor: "pointer" }}
            title="User Profile"
          >
            <i className="fa-solid fa-user"></i>
          </span>

          {/* Profile Card Popup */}
          {showProfile && (
            <div className="profileDropdown">
              <div className="profileHeader">
                <div className="profileAvatar">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div className="profileInfo">
                  <p className="profileName">{user?.username || "Account Details"}</p>
                  <p className="profileEmail">{user?.username || user?.email || "User"}</p>
                </div>
              </div>
              <hr className="profileDivider" />
              <button className="profileLogoutBtn" onClick={logout}>
                <i className="fa-solid fa-right-from-bracket"></i> Log Out
              </button>
            </div>
          )}
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