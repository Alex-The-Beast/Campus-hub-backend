// src/service/NoteService.js
import NotesRepository from "../repository/NotesRepository.js";
import cloudStorage from "../storage/cloudStorage.js";

class NotesService {
  constructor(repository = new NotesRepository(), storage = new cloudStorage()) {
    this.repository = repository;
    this.storage = storage;
  }

  // Upload a PDF Note
  async uploadPDF(file, branch, semester, subject, course, uploadedBy = "Anonymous", title) {
    // Step 1: Upload to Cloudflare
    const storageResult = await this.storage.uploadFile(file);

    // Step 2: Save metadata in DB
    return await this.repository.insert({
      title,
      branch,
      semester,
      subject,
      course,
      uploadedBy,
      pdfUrl: storageResult,
    });
  }

  // Fetch all Notes
  async getNotes(filters) {
    return await this.repository.find(filters);
  }
}

export default NotesService;
