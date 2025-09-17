import mongoose from "mongoose";

const { Schema } = mongoose;

const cahtSchema=new Schema({ 
    room:{
        type:String,
        required:true
    },
    userId:{
        type:String,
    },

    message:{
        type:String,
        required:true
    }
},{timestamps:true})
const Chat=mongoose.model("Chat",cahtSchema);
export default Chat;