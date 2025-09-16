// PyQService.js
//
import PYQRepository from "../repository/PYQRepository.js";
import localStorage from "../storage/localStorage.js" 
class PYQService {
  constructor(repository=new PYQRepository(), storage=new localStorage()) {
    this.repository = repository; // IPyQRepository
    this.storage = storage;       // IStorage
  }

  // Upload a PDF
  async uploadPDF(file, branch, year, semester, subject, course, examType, uploadedBy = "Anonymous") {
    // Step 1: Save file using storage (Local/Cloud)
    const pdfUrl = await this.storage.uploadFile(file);

    // Step 2: Save metadata + url in DB
    return await this.repository.insert({
      branch,
      year,
      semester,
      subject,
      course,
      examType,
      uploadedBy,
      pdfUrl,
    });
  }

  // Fetch PDFs with filters
  async getPDFs(filters) {
    return await this.repository.find(filters);
  }
}
export default PYQService;  