import multer from "multer";
import { v4 as uuid } from 'uuid';

// create a storage
const storage = multer.diskStorage({
	// destination
	destination(req, file, callback) {
		callback(null, "./uploads");
    },
    filename(req, file, callback) {
        const id = uuid()
        const ext = file.originalname.split('.').pop()?.trim()
        callback(null , `${id}.${ext}` )
    } 
});


// create a multer instance
export const singleUpload = multer({ storage }).single("photo");
// req.file.photo
