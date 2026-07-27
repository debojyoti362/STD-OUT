import './App.css'
import Sidebar from "./Sidebar.jsx";
import Chatwindow from "./Chatwindow.jsx";
import{MyContext} from "./MyContext.jsx";
import { useState } from 'react';
import {v1 as uuidv1} from "uuid";
import axios from "axios";

axios.defaults.withCredentials = true; // <--- ADD THIS ONCE
function App() {
  const [prompt , setprompt] = useState("");
  const [reply ,setreply] = useState(null);
  const [currThreadId , setcurrThreadId]=useState(uuidv1());
  const [prevChats , setPrevChats] = useState([]);
  const [newChat,setNewChat] = useState(true)
  const[allThreads , setAllThreads] = useState([]);
  const providerValues ={
    prompt ,setprompt,
    reply ,setreply,
    currThreadId , setcurrThreadId,
    newChat,setNewChat,
    prevChats, setPrevChats,
    allThreads , setAllThreads
  };
  return (
    <>
       <div className="app">
        <MyContext.Provider value={providerValues}>
        <Sidebar></Sidebar>
        <Chatwindow></Chatwindow>
        </MyContext.Provider>
       </div>
    </>
  )
}

export default App
