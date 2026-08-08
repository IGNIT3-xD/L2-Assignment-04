import cloudinary from "../lib/cloudinary"

export const uploadToCloudinary = (
    file: Express.Multer.File
): Promise<{
    secure_url: string
    public_id: string
}> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "fix-it-now/profile-pictures",
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    reject(error)
                } else if (result) {
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id
                    })
                }
            }
        )

        uploadStream.end(file.buffer)
    })
}