import * as multer from 'multer';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}_${file.originalname}`);
    }
})

const upload = multer({ storage: storage })

export default upload;