import "./App.css";
import Sidebar from "./Sidebar.jsx";
import Chatwindow from "./Chatwindow.jsx";
import Auth from "./Auth.jsx";
import { MyContext } from "./MyContext.jsx";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import { useState } from "react";
import { v1 as uuidv1 } from "uuid";
import { RingLoader } from "react-spinners";

function MainApp() {
  const [prompt, setprompt] = useState("");
  const [reply, setreply] = useState(null);
  const [currThreadId, setcurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [threadsVersion, setThreadsVersion] = useState(0); // bump to refresh the sidebar list

  const providerValues = {
    prompt, setprompt,
    reply, setreply,
    currThreadId, setcurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    threadsVersion, setThreadsVersion,
  };

  return (
    <div className="app">
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <Chatwindow />
      </MyContext.Provider>
    </div>
  );
}

function Gate() {
  const { user, checking } = useAuth();

  if (checking) {
    return (
      <div className="app" style={{ alignItems: "center", justifyContent: "center" }}>
        <RingLoader color="#fff" />
      </div>
    );
  }
  if (!user) return <Auth />;
  // key = user id, so all chat state resets cleanly when a different user logs in
  return <MainApp key={user.id} />;
}

function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

export default App;
