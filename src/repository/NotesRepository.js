import IPYQRepository from "../interface/IPYQRepository.js";
import Notes from "../schema/Notes.js";
class NotesRepository extends IPYQRepository {
    async insert(notesData) {
        return Notes.create(notesData);
    }
    async find(filters) {
        return Notes.find(filters);
    }
}
export default NotesRepository;