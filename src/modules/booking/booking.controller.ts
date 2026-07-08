import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from 'express';
import { createBookingQuery, getBookingByIdQuery, getUsersBookingQuery } from "./booking.service";

export const createBooking = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id
    const payload = req.body

    if (!customerId)
        throw new Error('Unauthorized')

    const booking = await createBookingQuery(payload, customerId)

    res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
    })
})

export const getUsersBooking = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const role = req.user?.role

    const booking = await getUsersBookingQuery(userId, role)

    res.status(200).json({
        success: true,
        message: 'Users Booking retrieved successfully',
        data: booking
    })
})

export const getBookingById = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const role = req.user?.role
    const bookingId = req.params.id
    // console.log(bookingId);

    const booking = await getBookingByIdQuery(bookingId as string, userId, role)

    res.status(200).json({
        success: true,
        message: 'Booking retrieved successfully',
        data: booking
    })
})