import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from 'express';
import { createBookingQuery } from "./booking.service";

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