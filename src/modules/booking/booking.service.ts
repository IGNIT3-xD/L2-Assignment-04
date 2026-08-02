import { Booking, Role } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

export const createBookingQuery = async (payload: Pick<Booking, 'technicianId' | 'serviceId' | 'scheduledAt'>, customerId: string) => {
    const { technicianId, serviceId, scheduledAt } = payload

    if (!technicianId || !serviceId || !scheduledAt)
        throw new AppError(400, "Technician Id, Service Id and Schedule date must be provided.")

    const service = await prisma.service.findUnique({
        where: { id: serviceId }
    })

    if (!service)
        throw new AppError(404, 'Service not found')

    if (service.technicianId !== technicianId)
        throw new AppError(403, 'This service does not belong to the specified technician.')

    const ScheduleDate = new Date(scheduledAt)

    if (ScheduleDate < new Date())
        throw new AppError(400, 'Scheduled date must be in the future.')

    const isExist = await prisma.booking.findFirst({
        where: {
            customerId,
            technicianId,
            serviceId,
            status: 'REQUESTED'
        }
    })

    if (isExist)
        throw new AppError(400, "You've already requested this booking. Please wait untill ACCEPTED.")

    const booking = await prisma.booking.create({
        data: {
            scheduledAt: ScheduleDate,
            customerId,
            technicianId,
            serviceId
        },
        include: {
            technician: {
                omit: { id: true, userId: true },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            },
            service: {
                omit: { id: true }
            }
        }
    })

    return booking
}

export const getUsersBookingQuery = async (userId: string, role: Role) => {
    if (role === 'TECHNICIAN') {
        const technician = await prisma.technician.findUnique({
            where: {
                userId
            }
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
                },
            }
        })

        return booking
    }

    if (role === 'CUSTOMER') {
        const booking = await prisma.booking.findMany({
            where: {
                customerId: userId
            },
            include: {
                service: {
                    select: {
                        title: true,
                        description: true,
                        price: true
                    }
                },
                payment: true
            }
        })

        return booking
    }

    // const booking = await prisma.booking.findMany({
    //     include: {
    //         technician: {
    //             include: {
    //                 user: {
    //                     select: {
    //                         name: true,
    //                         email: true
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // })

    // return booking
}

export const getBookingByIdQuery = async (bookingId: string, userId: string, role: Role) => {
    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    })

    if (!booking)
        throw new AppError(404, "Booking details not found.")

    if (role === 'CUSTOMER' && booking.customerId !== userId)
        throw new AppError(401, 'Unauthorized.')

    if (role === 'TECHNICIAN') {
        const technician = await prisma.technician.findUnique({ where: { userId } })

        if (!technician || booking.technicianId !== technician.id)
            throw new AppError(404, 'Booking details not found')
    }

    return booking
}

export const cancelBookingQuery = async (bookingId: string, customerId: string) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true }
    })

    if (booking?.customerId !== customerId)
        throw new AppError(401, 'Unauthorized.')

    if (booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED')
        throw new AppError(400, "You can't cancel your booking now.")

    if (booking.status === 'CANCELLED' || booking.payment?.status === 'REFUND_PENDING')
        throw new AppError(400, 'Cancelation in progress. Please, wait')

    const cancelledBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
        include: { payment: true }
    })

    if (booking.payment?.status === 'PAID') {
        await prisma.payment.update({
            where: { bookingId },
            data: {
                status: 'REFUND_PENDING'
            }
        })
    }

    return cancelledBooking
}