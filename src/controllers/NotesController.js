// import NotesService from "../services/NotesService.js";

// class NotesController {
//   constructor() {
//     this.notesService = new NotesService();
//   }

//   // 📤 Upload Notes PDF
//   uploadNote = async (req, res) => {
//     try {
//       const {
//         branch,
//         semester,
//         subject,
//         topic,
//         uploadedBy,
//       } = req.body;

//       const file = req.file;
//       if (!file) throw new Error("No file uploaded");

//       const result = await this.notesService.uploadPDF({
//         file,
//         branch,
//         semester,
//         subject,
//         topic,
//         uploadedBy: uploadedBy || "Anonymous",
//       });

//       res.status(201).json({ success: true, data: result });
//     } catch (error) {
//       console.error("Upload Note Error:", error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   };

//   // 📥 Get Notes (with optional filters)
//   getNotes = async (req, res) => {
//     try {
//       const filters = req.query;
//       const notes = await this.notesService.getPDFs(filters);
//       res.status(200).json({ success: true, data: notes });
//     } catch (error) {
//       console.error("Get Notes Error:", error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   };
// }

// export default NotesController;


import NotesService from "../services/NotesService.js";

class NotesController {
  constructor() {
    this.notesService = new NotesService();
  }

  // 📤 Upload Notes PDF
  uploadNote = async (req, res) => {
    try {
      const {
        title,
        branch,
        semester,
        subject,
        course,
        uploadedBy,
      } = req.body;

      const file = req.file;
      if (!file) throw new Error("No file uploaded");

      // Validate required fields
      if (!title || !branch || !semester) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: title, branch, or semester",
        });
      }

      // Call NotesService
      const result = await this.notesService.uploadPDF(
        file,
        branch,
        semester,
        subject,
        course,
        uploadedBy || "Anonymous",
        title
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      console.error("Upload Note Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // 📥 Get Notes (with optional filters)
  getNotes = async (req, res) => {
    try {
      const filters = req.query; // e.g., ?branch=CSE&semester=5
      const notes = await this.notesService.getNotes(filters);
      res.status(200).json({ success: true, data: notes });
    } catch (error) {
      console.error("Get Notes Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

export default NotesController;
