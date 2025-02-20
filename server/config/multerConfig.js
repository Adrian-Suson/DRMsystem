import multer from "multer";

// Configure Multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({ storage }); 

export default upload;
