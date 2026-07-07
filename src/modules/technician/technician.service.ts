import { Technician } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const createTechnicianProfileQuery = async (paylaod: Pick<Technician, "experience" | "location">, userId: string) => {
    const { experience, location } = paylaod

    const technician = await prisma.technician.create({
        data: {
            experience,
            location,
            userId
        }
    })

    return technician
}