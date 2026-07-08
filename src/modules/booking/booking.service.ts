import { Booking } from "../../../generated/prisma/client";
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