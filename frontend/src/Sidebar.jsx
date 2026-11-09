import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext";
import { useAuth } from "./AuthContext.jsx";
import { api } from "./api.js";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
  const {
    allThreads, setAllThreads, currThreadId, setNewChat, setprompt, setreply,
    setcurrThreadId, setPrevChats, threadsVersion,
  } = useContext(MyContext);
  const { user, logout } = useAuth();

  const getAllThreads = async () => {
    try {
      const res = await api("/api/threads");
      setAllThreads(res.map((t) => ({ threadId: t.threadId, title: t.title })));
    } catch (err) {
      console.log(err);
    }
  };

  // reload list when the thread changes or a message was sent
  useEffect(() => {
    getAllThreads();
  }, [currThreadId, threadsVersion]);

  const createNewChat = () => {
    setNewChat(true);
    setprompt("");
    setreply(null);
    setcurrThreadId(uuidv1());
    setPrevChats([]);
  };

  const changeThread = async (newThreadId) => {
    setcurrThreadId(newThreadId);
    try {
      const res = await api(`/api/thread/${newThreadId}`);
      setPrevChats(res);
      setNewChat(false);
      setreply(null);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      await api(`/api/thread/${threadId}`, { method: "DELETE" });
      setAllThreads((prev) => prev.filter((t) => t.threadId !== threadId));
      if (currThreadId === threadId) createNewChat();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <section className="sidebar">
      <button onClick={createNewChat} className="new-chat-banner-btn" title="New Chat">
        <div className="logo-text-wrapper">
          <i className="fa-solid fa-terminal brand-icon"></i>
          <span className="brand-name">STD-out</span>
        </div>
      </button>

      <ul className="history">
        {allThreads?.map((thread) => (
          <li onClick={() => changeThread(thread.threadId)} key={thread.threadId}>
            {thread.title}
            <i
              className="fa-solid fa-trash"
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.threadId);
              }}
            ></i>
          </li>
        ))}
      </ul>

      <div className="sign">
        <p className="signUser">{user?.name || user?.email}</p>
        <button className="logoutBtn" onClick={logout}>
          <span>Log out</span>
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </section>
  );
}

export default Sidebar;
