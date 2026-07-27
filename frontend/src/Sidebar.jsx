import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext";
import {v1 as uuidv1} from "uuid";
function Sidebar(){
      const {allThreads , setAllThreads,currThreadId,setNewChat , newChat , setprompt , setreply , setcurrThreadId , setPrevChats} = useContext(MyContext)
      const getAllThreads = async()=>{
         try{
          const response = await fetch("http://localhost:8080/api/threads");
          const res = await response .json();
          const filteredData = res.map(thread =>({threadId:thread.threadId,title:thread.title}))
          // console.log(filteredData);
          setAllThreads(filteredData);
         }
         catch(err)
         {
           console.log(err);
         }
      }
      useEffect(()=>{
        getAllThreads();
      },[currThreadId]);
      const createNewChat = ()=>{
        setNewChat(true);
        setprompt("");
        setreply(null);
        setcurrThreadId(uuidv1());
        setPrevChats([]);
      }
      const changeThread = async(newThreadId)=>{
        setcurrThreadId(newThreadId);
         try{
            const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`);
            const res = await response.json();
            console.log(res);
            setPrevChats(res);
            setNewChat(false);
            setreply(null);
         }

         catch(err)
         {
           console.log(err);
         }
      }
const deleteThread = async (threadId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/thread/${threadId.replace(/^\//, "")}`, {
      method: "DELETE"
    });
    
    const res = await response.json();
    console.log(res);

    // FIX: If the backend says OK, filter out the deleted thread from the UI instantly
    if (response.ok) {
      setAllThreads((prevThreads) => prevThreads.filter(thread => thread.threadId !== threadId));
      
      // Optional: If you delete the thread you are currently looking at, clear the main window
      if (currThreadId === threadId) {
        createNewChat();
      }
    }

  } catch (err) {
    console.log(err);
  }
};
return (
    <section className="sidebar">
{/* Completely clean, full-width text brand button */}
<button onClick={createNewChat} className="new-chat-banner-btn" title="New Chat">
  <div className="logo-text-wrapper">
    <i className="fa-solid fa-terminal brand-icon"></i>
    <span className="brand-name">STD-out</span>
  </div>
</button>
      {/* history */}
      <ul className="history">
        {allThreads?.map((thread, idx) => (
          <li onClick={() => changeThread(thread.threadId)} key={idx}>
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

      {/* sign */}
      <div className="sign">
        <p>By Debojyoti</p>
      </div>
    </section>
  );
}
export default Sidebar;