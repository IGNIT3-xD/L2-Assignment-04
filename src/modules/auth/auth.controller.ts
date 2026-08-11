import { Request, Response } from "express";
import { googleLoginQuery, loginUserQuery, myProfileQuery, regUserQuery, tokenGenerateQuery, updateProfileQuery } from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import { uploadToCloudinary } from './../../utils/uploadToCloudinary';
import jwt from 'jsonwebtoken';
import config from "../../config";

export const regUser = catchAsync(async (req: Request, res: Response) => {
    let profilePicture: string | undefined

    if (req.file) {
        const result = await uploadToCloudinary(req.file)
        profilePicture = result.secure_url
    }

    const result = await regUserQuery({ ...req.body, profilePicture })

    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24
    })

    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    })

    res.status(201).json({
        success: true,
        message: "User created sucessfully.",
        data: result
    })
})

export const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await loginUserQuery(req.body)

    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24
    })

    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    })

    res.status(201).json({
        success: true,
        message: "User login successfully.",
        data: result
    })
})

export const myProfile = catchAsync(async (req: Request, res: Response) => {
    const user = await myProfileQuery(req.user?.id)

    res.status(200).json({
        success: true,
        message: "User retrieved successfully.",
        data: user
    })
})

export const generateToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies
    if (!refreshToken)
        throw new AppError(400, "Token is missing")

    const { accessToken } = await tokenGenerateQuery(refreshToken)

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24
    })

    res.status(201).json({
        success: true,
        message: "Token generated successfully.",
        data: { accessToken }
    })
})

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
    const id = req.user?.id

    let profilePicture: string | undefined;

    if (req.file) {
        const result = await uploadToCloudinary(req.file)
        profilePicture = result.secure_url
    }

    const result = await updateProfileQuery(id, { ...req.body, profilePicture })

    res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        data: result
    })
})

export const googleAuthCallback = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as any

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    }

    const accessToken = jwt.sign(jwtPayload, config.JWT_ACCESS, { expiresIn: '1d' })
    const refreshToken = jwt.sign(jwtPayload, config.JWT_REFRESH, { expiresIn: '7d' })

    // res.cookie("accessToken", accessToken, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: true,
    //     maxAge: 1000 * 60 * 60 * 24
    // })

    // res.cookie('refreshToken', refreshToken, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: true,
    //     maxAge: 1000 * 60 * 60 * 24 * 7
    // })

    const redirectUrl = new URL('/auth/google/callback', config.APP_URL || 'https://fix-it-now-live.vercel.app')
    redirectUrl.searchParams.set("accessToken", accessToken)
    redirectUrl.searchParams.set("refreshToken", refreshToken)

    res.redirect(redirectUrl.toString())
})

export const googleLogin = catchAsync(async (req: Request, res: Response) => {
    const { idToken } = req.body
    const result = await googleLoginQuery(idToken)

    const { accessToken, refreshToken } = result

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24
    })

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7
    })

    res.status(201).json({
        success: true,
        message: "User login with google successfully.",
        data: {
            accessToken,
            refreshToken
        }
    })
})