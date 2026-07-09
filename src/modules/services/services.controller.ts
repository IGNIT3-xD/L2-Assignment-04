import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { createServiceQuery, getAllServicesQuery } from "./services.service";
import { AppError } from "../../utils/AppError";

export const createService = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const payload = req.body

    if (!payload.title || payload.title.length < 10)
        throw new AppError(400,"Title must be at least 10 characters long.")

    if (req.user?.role === 'CUSTOMER')
        throw new AppError(403,"Only technicians are eligible to create services.")

    const service = await createServiceQuery(payload, userId)

    res.status(201).json({
        success: true,
        message: "Service created successfully.",
        data: service
    })
})

export const getAllServices = catchAsync(async (req: Request, res: Response) => {
    const services = await getAllServicesQuery(req.query)

    res.status(200).json({
        sucess: true,
        message: "All services retrieved successfully.",
        data: services
    })
})