import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { createPayement, getPaymentById, getUsersPayment } from "./payment.controller";

const paymentRouter = Router()

paymentRouter.post('/create', auth(Role.ADMIN, Role.CUSTOMER), createPayement)
paymentRouter.get('/', auth(Role.ADMIN, Role.CUSTOMER), getUsersPayment)
paymentRouter.get('/:id', auth(Role.ADMIN, Role.CUSTOMER), getPaymentById)

export default paymentRouter