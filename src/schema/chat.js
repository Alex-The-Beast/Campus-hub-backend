import mongoose from "mongoose";

const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    room: { type: String, required: true }, // you can default to "general"
    user: { type: String, required: true }, // rename from userId → user for frontend
    text: { type: String, required: true }, // rename from message → text
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
