import express, { type Application, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser'
import config from './config'
import cors from 'cors'
import authRouter from './modules/auth/auth.router';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import servicesRouter from './modules/services/services.router';
import technicianRouter from './modules/technician/technician.route';
import categoryRouter from './modules/categories/categories.router';
const app: Application = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: config.APP_URL,
    credentials: true
}))

app.get('/', (req: Request, res: Response) => {
    res.send('Server is running....')
})

app.use("/api/auth", authRouter)
app.use("/api/services", servicesRouter)
app.use("/api/technicians", technicianRouter)
app.use("/api/admin/categories", categoryRouter)

app.use(globalErrorHandler)

export default app