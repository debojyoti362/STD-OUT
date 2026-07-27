import mongoose from "mongoose";
import { Content } from "openai/resources/skills.js";


// for a particular message schema
const MessageSchema = new mongoose.Schema({
  role:{
    type: String,
    enum:["user","assistant"],
    required:true,
  },
  content:{
    type:String,
    required:true
  },
  timestamp:{
    type:Date,
    default:Date.now
}
});

// for a particular thread schema 
const ThreadSchema = new mongoose.Schema({
  threadId:{
    type:String,
    required:true,
    unique:true
  },
  title:{
    type:String,
    default:"New Chat"
  },
  messages:[MessageSchema],
  createdAt:{
    type:Date,
    default:Date.now
  },
  updateAt:{
    type:Date,
    default:Date.now
  }
})


export default mongoose.model("Thread",ThreadSchema);
