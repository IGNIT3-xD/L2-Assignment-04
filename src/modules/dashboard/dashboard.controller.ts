import { catchAsync } from './../../utils/catchAsync';
import { Request } from 'express';
import { Response } from 'express';
import { getAdminDashboardStatsQuery, getCustomerDashboardStatsQuery, getTechnicianDashboardStatsQuery } from './dashboard.service';

export const getAdminDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id

    const stats = await getAdminDashboardStatsQuery(userId as string)

    res.status(200).json({
        success: true,
        message: "Stats retrieved successfully.",
        data: stats
    })
})

export const getCustomerDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id

    const stats = await getCustomerDashboardStatsQuery(userId as string)

    res.status(200).json({
        success: true,
        message: "Stats retrieved successfully.",
        data: stats
    })
})

export const getTechnicianDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id

    const stats = await getTechnicianDashboardStatsQuery(userId as string)

    res.status(200).json({
        success: true,
        message: "Stats retrieved successfully.",
        data: stats
    })
})