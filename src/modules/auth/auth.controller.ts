import { Request, Response } from "express";
import { loginUserQuery, regUserQuery } from "./auth.service";
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

    res.status(201).json({
        success: true,
        message: "User login successfully.",
        data: result
    })
})