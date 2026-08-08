import multer from "multer"

const storage = multer.memoryStorage()

const fileFilter: multer.Options["fileFilter"] = (
    req,
    file,
    cb
) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true)
    } else {
        cb(new Error("Only image files are allowed."))
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 3 * 1024 * 1024 // 3 MB
    }
})