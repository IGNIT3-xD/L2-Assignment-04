import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { getAllBookingsQuery, getAllUsersQuery, updateUserStatusQuery } from "./user.service";

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await getAllUsersQuery(req.query)

    res.status(200).json({
        success: true,
        message: 'Users retrieved sucessfully.',
        data: users
    })
})

export const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id as string
    const user = await updateUserStatusQuery(userId, req.body)

    res.status(200).json({
        success: true,
        message: 'User status updated sucessfully.',
        data: user
    })
})

export const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const user = await getAllBookingsQuery(req.query)

    res.status(200).json({
        success: true,
        message: 'Bookings retrieved sucessfully.',
        data: user
    })
})