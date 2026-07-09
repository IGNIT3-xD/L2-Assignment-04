import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { getAllBookings, getAllUsers, updateUserStatus } from "./user.controller";

const usersRouter = Router()

usersRouter.get('/users', auth(Role.ADMIN), getAllUsers)
usersRouter.patch('/users/:id', auth(Role.ADMIN), updateUserStatus)
usersRouter.get('/bookings', auth(Role.ADMIN), getAllBookings)

export default usersRouter