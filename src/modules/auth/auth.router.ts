import { Router } from "express";
import { generateToken, loginUser, myProfile, regUser } from "./auth.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const authRouter = Router()

authRouter.post('/register', regUser)
authRouter.post('/login', loginUser)
authRouter.get('/me', auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN), myProfile)
authRouter.post('/refreshToken', generateToken)

export default authRouter