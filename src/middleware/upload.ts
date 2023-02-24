import * as multer from 'multer';
const util = require('util');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}_${file.originalname}`);
    }
})

const upload = multer({ storage: storage }).single('file');
const uploadFileMiddleware = util.promisify(upload);
export default uploadFileMiddleware;