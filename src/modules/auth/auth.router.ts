import { Router } from "express";
import { loginUser, regUser } from "./auth.controller";

const authRouter = Router()

authRouter.post('/register', regUser)
authRouter.post('/login', loginUser)

export default authRouter