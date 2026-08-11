import { Router } from "express";
import { generateToken, googleAuthCallback, googleLogin, loginUser, myProfile, regUser, updateProfile } from "./auth.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { upload } from './../../lib/multer';
import passport from './../../lib/passport';
import config from "../../config";

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
authRouter.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }))
authRouter.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${config.APP_URL}/auth/login` }),
    googleAuthCallback
)

authRouter.post("/google", googleLogin)

export default authRouter