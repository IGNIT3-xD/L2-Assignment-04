import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser'
import config from './config'
import cors from 'cors'
const app: Application = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: config.APP_URL,
    credentials: true
}))

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})

export default app