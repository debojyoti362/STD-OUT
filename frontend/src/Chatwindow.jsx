import "./Chatwindow.css";
import Chat from "./Chat.jsx"
import { MyContext } from "./MyContext.jsx";
import { useContext ,useState } from "react";
import {RingLoader} from "react-spinners";

function Chatwindow(){
  const { prompt, setprompt, setreply, currThreadId, setPrevChats,setNewChat } = useContext(MyContext);
  const [loading ,setLoading] = useState(false);

  const getreply = async () => {
    if (!prompt.trim()) return; // Prevent sending empty spaces

    const currentMessage = prompt; // Capture the exact message state right now
    setprompt(""); // Instantly clear the input bar for better UX

    setLoading(true);
    setNewChat(false);
    console.log("message:", currentMessage, "threadId:", currThreadId);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: currentMessage,
        threadId: currThreadId // Sends the exact stable thread ID
      })
    };

    try {
      const response = await fetch("http://localhost:8080/api/chat", options);
      const res = await response.json();
      console.log(res);
      
      setreply(res.reply);

      // Append BOTH the user message and the assistant reply directly here
      setPrevChats(prevChats => [
        ...prevChats,
        { role: "user", content: currentMessage },
        { role: "assistant", content: res.reply }
      ]);

    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span>STD-out<i className="fa-solid fa-angle-down"></i></span>
        <div className="userIconDiv">
          <span className="userIcon"><i className="fa-solid fa-user"></i></span>
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
            onKeyDown={(e) => e.key === 'Enter' ? getreply() : ''}
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