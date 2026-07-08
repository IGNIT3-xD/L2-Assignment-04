import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({
    path: path.join(process.cwd(), '.env')
})

export default {
    PORT: process.env.PORT,
    APP_URL: process.env.APP_URL,
    DATABASE_URL: process.env.DATABASE_URL as string,
    JWT_ACCESS: process.env.JWT_ACCESS as string,
    JWT_REFRESH: process.env.JWT_REFRESH as string,
    STRIPE_SECRET: process.env.STRIPE_SECRET as string,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET as string,
}