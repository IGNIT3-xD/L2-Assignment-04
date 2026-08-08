import { Router } from "express";
import { generateToken, loginUser, myProfile, regUser, updateProfile } from "./auth.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { upload } from './../../lib/multer';

const authRouter = Router()

authRouter.post('/register', upload.single("profilePicture"), regUser)
authRouter.post('/login', loginUser)
authRouter.get('/me', auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN), myProfile)
authRouter.patch(
    '/me',
    auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
    upload.single('profilePicture'),
    updateProfile
)
authRouter.post('/refreshToken', generateToken)

export default authRouter