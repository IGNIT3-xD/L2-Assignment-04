import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { createBooking } from "./booking.controller";

const bookingRouter = Router()

bookingRouter.post('/', auth(Role.ADMIN, Role.CUSTOMER), createBooking)

export default bookingRouter