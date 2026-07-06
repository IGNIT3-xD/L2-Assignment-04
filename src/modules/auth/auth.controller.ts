import { Request, Response } from "express";
import { loginUserQuery, myProfileQuery, regUserQuery, tokenGenerateQuery } from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";

export const regUser = catchAsync(async (req: Request, res: Response) => {
    const user = await regUserQuery(req.body)

    res.status(201).json({
        success: true,
        message: "User created sucessfully.",
        data: user
    })
})

export const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await loginUserQuery(req.body)

    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    })

    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
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
        throw new Error("Token is missing")

    const { accessToken } = await tokenGenerateQuery(refreshToken)

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24
    })

    res.status(201).json({
        success: true,
        message: "Token generated successfully.",
        data: { accessToken }
    })
})