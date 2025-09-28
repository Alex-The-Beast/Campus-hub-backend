import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    subject: { type: String },
    course: { type: String },
    uploadedBy: { type: String, default: "Anonymous" },
    pdfUrl: { type: String, required: true },
    type: { type: String, default: "Notes" },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);
export default Note;
