import { Booking, Role } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const createBookingQuery = async (payload: Pick<Booking, 'technicianId' | 'serviceId' | 'scheduledAt'>, customerId: string) => {
    const { technicianId, serviceId, scheduledAt } = payload

    if (!technicianId || !serviceId || !scheduledAt)
        throw new Error("Technician Id, Service Id and Schedule date must be provided.")

    const service = await prisma.service.findUnique({
        where: { id: serviceId }
    })

    if (!service)
        throw new Error('Service not found')

    if (service.technicianId !== technicianId)
        throw new Error('This service does not belong to the specified technician.')

    const ScheduleDate = new Date(scheduledAt)

    if (ScheduleDate < new Date())
        throw new Error('Scheduled date must be in the future.')

    const isExist = await prisma.booking.findFirst({
        where: {
            customerId,
            technicianId,
            serviceId,
            status: 'REQUESTED'
        }
    })

    if (isExist)
        throw new Error("You've already requested this booking. Please wait untill ACCEPTED.")

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
            throw new Error("Technician profile not found.")

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
                }
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
        throw new Error("Booking details not found.")

    if (role === 'CUSTOMER' && booking.customerId !== userId)
        throw new Error('Unauthorized.')

    if (role === 'TECHNICIAN') {
        const technician = await prisma.technician.findUnique({ where: { userId } })

        if (!technician || booking.technicianId !== technician.id)
            throw new Error('Booking details not found')
    }

    return booking
}