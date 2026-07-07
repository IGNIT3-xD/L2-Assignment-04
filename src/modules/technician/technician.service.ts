import { Availability, Technician } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const createTechnicianProfileQuery = async (payload: Pick<Technician, "experience" | "location"> & {
    availablities: Pick<Availability, "dayOfWeek" | "startTime" | "endTime">[]
}, userId: string) => {
    const { experience, location, availablities } = payload

    if (!availablities || availablities.length === 0)
        throw new Error("At least one availability slot is required.")

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