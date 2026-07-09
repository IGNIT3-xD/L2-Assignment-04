import express, { type Application, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser'
import config from './config'
import cors from 'cors'
import authRouter from './modules/auth/auth.router';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import servicesRouter from './modules/services/services.router';
import technicianRouter from './modules/technician/technician.route';
import categoryRouter from './modules/categories/categories.router';
import bookingRouter from './modules/booking/booking.router';
import paymentRouter from './modules/payment/payment.router';
import { stripeWebhookHandler } from './modules/payment/payment.controller';
import reviewsRouter from './modules/reviews/reviews.router';
import usersRouter from './modules/user/user.router';
const app: Application = express()

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler)

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
app.use("/api", technicianRouter)
app.use("/api", categoryRouter)
app.use("/api/bookings", bookingRouter)
app.use("/api/payments", paymentRouter)
app.use("/api/reviews", reviewsRouter)
app.use("/api/admin", usersRouter)

app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Route not found!",
    })
})

app.use(globalErrorHandler)

export default app