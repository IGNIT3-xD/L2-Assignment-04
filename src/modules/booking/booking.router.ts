import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { cancelBooking, createBooking, getBookingById, getUsersBooking } from "./booking.controller";

const bookingRouter = Router()

bookingRouter.post('/', auth(Role.ADMIN, Role.CUSTOMER), createBooking)
bookingRouter.get('/', auth(Role.ADMIN, Role.TECHNICIAN, Role.CUSTOMER), getUsersBooking)
bookingRouter.get('/:id', auth(Role.ADMIN, Role.TECHNICIAN, Role.CUSTOMER), getBookingById)
bookingRouter.patch('/:id/cancel', auth(Role.ADMIN, Role.CUSTOMER), cancelBooking)

export default bookingRouter