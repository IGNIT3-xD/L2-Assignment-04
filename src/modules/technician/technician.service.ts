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