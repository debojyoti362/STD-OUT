import "./chat.css";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import "highlight.js/styles/github-dark.css";
import rehypeHighlight from "rehype-highlight";

function chat() {
  const { newChat, prevChats , reply , setreply } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);

  useEffect(() => {
    if(reply == null)
    {
       setLatestReply(null);
       return;
    }
    // Your typing effect logic goes here
    if (prevChats && prevChats.length > 0) {
      const lastMessage = prevChats[prevChats.length - 1];
      if (lastMessage.role === "assistant") {
        // Run your typing effect or state updates here using lastMessage.content
      }
    }
  }, [prevChats]); // Removed the non-existent 'reply' variable

  return (
    <>
      {newChat && <h1>Start a New Chat!</h1>}
      <div className="chats">
        {prevChats?.map((chat, idx) => (
          <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
            {chat.role === "user" ? (
              <p className="userMessage">{chat.content}</p>
            ) : (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {chat.content}
              </ReactMarkdown>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default chat;