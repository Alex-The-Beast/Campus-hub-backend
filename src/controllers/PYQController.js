import PYQService from "../services/PYQService.js";

class PYQController {
  constructor() {
    this.pyqService = new PYQService();
  }

  async uploadPyQ(req, res) {
    try {
      const { branch, year, semester, subject, course, examType, uploadedBy } = req.body;
      const file = req.file; // multer required in future

      const result = await this.pyqService.uploadPDF(
        file,
        branch,
        year,
        semester,
        subject,
        course,
        examType,
        uploadedBy || "Anonymous"
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }



  async getPyQs(req, res) {
    try {
      const filters = req.query;
      const pyqs = await this.pyqService.getPDFs(filters);
      res.status(200).json({ success: true, data: pyqs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default PYQController;
