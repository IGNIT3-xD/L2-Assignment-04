import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { createTechnicianProfileQuery } from './technician.service';

export const createTechnicianProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const payload = req.body

    const technician = await createTechnicianProfileQuery(payload, userId)

    res.status(201).json({
        success: true,
        message: "Technician profile created successfully.",
        data: technician
    })
})