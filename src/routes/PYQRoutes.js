// routes/pyqRoutes.js
import express from "express";
import PYQController from "../controllers/PYQController.js";
import multer from "multer";

// Multer setup
const upload = multer({ storage: multer.memoryStorage() }); // in-memory storage for file upload

const router = express.Router();
const pyqController = new PYQController();

// Use multer middleware in route
router.post("/upload", upload.single("pdf"),(req, res) => pyqController.uploadPyQ(req, res));

router.get("/", (req, res) => pyqController.getPyQs(req, res));


export default router;
