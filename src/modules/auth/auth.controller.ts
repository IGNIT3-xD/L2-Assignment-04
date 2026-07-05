import { Request, Response } from "express";
import { regUserQuery } from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";

export const regUser = catchAsync(async (req: Request, res: Response) => {
    const user = await regUserQuery(req.body)

    res.status(201).json({
        success: true,
        message: "User created sucessfully",
        data: user
    })
})