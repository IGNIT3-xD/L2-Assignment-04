import { Router } from "express";
import { regUser } from "./auth.controller";

const authRouter = Router()

authRouter.post('/register', regUser)

export default authRouter