import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { createServiceQuery } from "./services.service";

export const createService = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const payload = req.body

    if (!payload.title || payload.title.length < 10)
        throw new Error("Title must be at least 10 characters long.")

    if (req.user?.role === 'CUSTOMER')
        throw new Error("Only technicians are eligible to create services.")

    const service = await createServiceQuery(payload, userId)

    res.status(201).json({
        success: true,
        message: "Service created successfully.",
        data: service
    })
})