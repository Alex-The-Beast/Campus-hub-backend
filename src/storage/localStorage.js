import IPYQStorage from "../interface/IPYQStorage.js";
import fs from "fs";
import path from "path";
class LocalStorage extends IPYQStorage{
    async uploadFile(file){
        const uploadPath=path.join("uploads",file.originalname);
        fs.writeFileSync(uploadPath,file.buffer);
        return uploadPath; // return the file path as the file ID
    }
    async getFileUrl(fileId){
        return path.join("uploads",fileId); // return the file path as the file URL
    }
}
export default LocalStorage;