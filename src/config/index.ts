import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({
    path: path.join(process.cwd(), '.env')
})

export default {
    PORT: process.env.PORT,
    APP_URL: process.env.APP_URL as string,
    BACKEND_URL: process.env.BACKEND_URL as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    JWT_ACCESS: process.env.JWT_ACCESS as string,
    JWT_REFRESH: process.env.JWT_REFRESH as string,
    STRIPE_SECRET: process.env.STRIPE_SECRET as string,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET as string,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string
}