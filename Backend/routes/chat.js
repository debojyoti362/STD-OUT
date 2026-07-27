import express from "express"
import Thread from "../models/threads.js"
import getOpenAIAPIResponse from "../utils/openai.js";

const router = express.Router();


router.post("/test", async(req,res)=>{
  try{
       const thread= new Thread({
        threadId:"xyz",
        title:"Testing new Thread"
       });
       const response = await thread.save();
       res.send(response);
  }
  
  catch(err)
  {
    console.log(err);
    res.status(500).json({error:"Failed to save the data"});
  }
})

// get all the threads 
router.get("/threads", async (req, res) => {
  try {
    // Sorts by creation time using the default MongoDB ObjectID structure
    const threads = await Thread.find({}).sort({ _id: -1 });
    res.status(200).json(threads);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Threads could not be loaded" });
  }
});

// get a particular thread message 
router.get("/thread/:threadId",async(req,res)=>{
  const {threadId} = req.params;
  try{
    const thread = await Thread.findOne({threadId})
    if(!thread)
    {
       res.status(404).json({error:"The thread cant find"})
    }
    res.json(thread.messages)

  }catch(err){
    console.log(err)
    res.status(500).json({error:"The thread can be loaded"})
  }
})
// delete a thread 
router.delete("/thread/:threadId",async(req,res)=>{
  const{threadId} = req.params;
  try{
    const thread = await Thread.findOneAndDelete({threadId})
    if(!thread){
      res.status(404).json({error:"Thread cant find"})
    }
    res.status(200).json({success:"Thread deleted succesfully"})

  }catch(err){
    console.log(err)
    res.status(500).json({error:"Thread cant be loaded"})
  }
})

//request response cycle post route
router.post("/chat",async(req,res)=>{
  const{threadId,message}= req.body
  if(!threadId || !message)
  {
     res.status(400).json({error:"Missing required fields"})
  }
  try{
    let  thread = await Thread.findOne({threadId})
    if(!thread)
    {
      thread= new Thread({
        threadId,
        title:message,
        messages:[{role:"user",content:message}]
      });
    }else{
      thread.messages.push({role:"user",content:message})
    }
    const apiResponse = await getOpenAIAPIResponse(message);
    const assistantreply =  apiResponse?.choices?.[0]?.message?.content || "No response text generated.";
      thread.messages.push({role:"assistant",content:assistantreply})
      thread.updatedAt=new Date();

      await thread.save();
      res.json({reply:assistantreply})
  }
  catch(err){
    console.log(err)
    res.status(500).json({error:""})
  }
})
export default router;