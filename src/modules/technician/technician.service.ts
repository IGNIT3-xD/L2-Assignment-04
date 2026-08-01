import { Availability, Booking, Technician } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

export const createTechnicianProfileQuery = async (payload: Pick<Technician, "experience" | "location"> & {
    availablities: Pick<Availability, "dayOfWeek" | "startTime" | "endTime">[]
}, userId: string) => {
    const { experience, location, availablities } = payload

    if (!availablities || availablities.length === 0)
        throw new AppError(400, "At least one availability slot is required.")

    const technician = await prisma.technician.create({
        data: {
            experience,
            location,
            userId,
            availabilities: {
                create: availablities.map((slot) => ({
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime
                }))
            },
        },
        include: {
            availabilities: {
                omit: {
                    technicianId: true
                }
            }
        }
    })

    return technician
}

export const getAllTechniciansQuery = async (query: any) => {
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    const sortBy = query.sortBy || 'createdAt';

    const technicians = await prisma.technician.findMany({
        where: {
            AND: [
                query.location ? { location: { contains: query.location, mode: 'insensitive' } } : {},
                query.available ? {
                    availabilities: {
                        some: { dayOfWeek: query.available.toUpperCase() }
                    }
                } : {}
            ]
        },
        include: {
            user: {
                omit: {
                    password: true
                }
            },
            availabilities: {
                select: {
                    dayOfWeek: true,
                    startTime: true,
                    endTime: true
                }
            }
        },
        omit: { userId: true },
        orderBy: {
            [sortBy]: sortOrder
        }
    })

    return technicians
}

export const getTechnicianServicesQuery = async (userId: string) => {
    const services = await prisma.technician.findUnique({
        where: { userId: userId },
        include: {
            services: {
                include: {
                    category: true
                }
            },
            userBookings: true
        }
    })

    if (!services) {
        throw new AppError(404, 'Services not found.')
    }

    return services
}

export const getTechnicianByIdQuery = async (technicianId: string) => {
    const technician = await prisma.technician.findUnique({
        where: { id: technicianId },
        include: {
            availabilities: { omit: { technicianId: true } },
            services: {
                include: {
                    category: {
                        select: { name: true }
                    },
                    bookings: {
                        select: { reviews: true }
                    }
                },
                omit: {
                    id: true,
                    technicianId: true,
                    updatedAt: true,
                    createdAt: true,
                    categoryId: true
                }
            }
        }
    })

    if (!technician)
        throw new AppError(404, 'Technician profile not found.')

    return technician
}

export const updateProfileQuery = async (userId: string, payload: Pick<Technician, 'experience' | 'location'>) => {
    const { experience, location } = payload

    const technician = await prisma.technician.findUnique({
        where: { userId }
    })

    if (technician?.userId !== userId)
        throw new AppError(404, "Technician not found.")

    const updateProfile = await prisma.technician.update({
        where: { userId },
        data: {
            experience,
            location
        }
    })

    return updateProfile
}

export const updateAvailablilityQuery = async (userId: string, availabilityId: string, paylaod: Pick<Availability, 'dayOfWeek' | 'startTime' | 'endTime' | 'isActive'>) => {
    const technician = await prisma.technician.findUnique({
        where: { userId }
    })

    if (technician?.userId !== userId)
        throw new AppError(404, "Technician not found.")

    const availablity = await prisma.availability.findUnique({
        where: { id: availabilityId }
    })

    if (!availablity || availablity.technicianId !== technician.id)
        throw new AppError(404, 'Availability slot not found.')

    if (paylaod.dayOfWeek && paylaod.dayOfWeek !== availablity.dayOfWeek) {
        const conflict = await prisma.availability.findFirst({
            where: {
                technicianId: technician.id,
                dayOfWeek: paylaod.dayOfWeek,
                id: { not: availabilityId }
            }
        })

        if (conflict)
            throw new AppError(409, `An availability slot for ${paylaod.dayOfWeek} already exists.`)
    }

    const updateAvailablity = await prisma.availability.update({
        where: { id: availabilityId },
        data: paylaod
    })

    return updateAvailablity
}

export const getTechnicanBookingsQuery = async (userId: string) => {
    const technician = await prisma.technician.findUnique({
        where: { userId }
    })

    if (!technician)
        throw new AppError(404, "Technician profile not found.")

    const booking = await prisma.booking.findMany({
        where: {
            technicianId: technician.id
        },
        include: {
            customer: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    })

    return booking
}

export const updateBookingStatusQuery = async (userId: string, bookingId: string, payload: Pick<Booking, 'status'>) => {
    const technician = await prisma.technician.findUnique({
        where: { userId }
    })

    if (!technician)
        throw new AppError(404, "Technician profile not found.")

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    })

    if (!booking || booking.technicianId !== technician.id)
        throw new AppError(404, 'Booking not found')

    const updateBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status: payload.status
        }
    })

    return updateBooking
}