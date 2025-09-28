import express from "express";
import NotesController from "../controllers/NotesController.js";
import multer from "multer";

// Multer setup
const upload = multer({ storage: multer.memoryStorage() }); // in-memory storage for file upload

const router = express.Router();
const notesController = new NotesController();

// 🧠 Upload Notes (PDF)
router.post("/upload", upload.single("pdf"), (req, res) => notesController.uploadNote(req, res));

// 📥 Get Notes (with filters like branch, semester, subject)
router.get("/", (req, res) => notesController.getNotes(req, res));

export default router;
