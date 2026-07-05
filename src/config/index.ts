import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({
    path: path.join(process.cwd(), '.env')
})

export default {
    PORT: process.env.PORT,
    APP_URL: process.env.APP_URL,
    DATABASE_URL: process.env.DATABASE_URL as string,
}