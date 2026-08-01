import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { createTechnicianProfileQuery, getAllTechniciansQuery, getTechnicanBookingsQuery, getTechnicianByIdQuery, updateAvailablilityQuery, updateBookingStatusQuery, updateProfileQuery, getTechnicianServicesQuery } from './technician.service';

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

export const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
    const technicians = await getAllTechniciansQuery(req.query)

    res.status(200).json({
        success: true,
        message: "All technicians retrieved successfully.",
        data: technicians
    })
})

export const getTechnicianServices = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const services = await getTechnicianServicesQuery(userId as string)

    res.status(200).json({
        success: true,
        message: "All technicians services retrieved successfully.",
        data: services
    })
})

export const getTechnicianById = catchAsync(async (req: Request, res: Response) => {
    const technicianId = req.params.id

    const technician = await getTechnicianByIdQuery(technicianId as string)

    res.status(200).json({
        success: true,
        message: "Technicians retrieved successfully.",
        data: technician
    })
})

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id
    // console.log(technicianId);
    const technician = await updateProfileQuery(userId, req.body)

    res.status(200).json({
        success: true,
        message: "Technician profile updated successfully.",
        data: technician
    })
})

export const updateAvailablility = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const availabilityId = req.params.id as string

    const technician = await updateAvailablilityQuery(userId, availabilityId, req.body)

    res.status(200).json({
        success: true,
        message: "Technician availablity updated successfully.",
        data: technician
    })
})

export const getTechnicianBookings = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id

    const technician = await getTechnicanBookingsQuery(userId)

    res.status(200).json({
        success: true,
        message: "Technician bookings retreived successfully.",
        data: technician
    })
})

export const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const bookingId = req.params.id as string

    const technician = await updateBookingStatusQuery(userId, bookingId, req.body)

    res.status(200).json({
        success: true,
        message: "Bookings status updated successfully.",
        data: technician
    })
})