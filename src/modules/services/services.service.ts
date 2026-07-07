import type { Service } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const createServiceQuery = async (payload: Pick<Service, 'title' | 'description' | 'price'>, userId: string) => {
    const { title, description, price } = payload

    const technician = await prisma.technician.findUnique({
        where: { userId }
    })

    if (!technician)
        throw new Error("Technician profile not found for this user.")

    const service = await prisma.service.create({
        data: {
            title,
            description,
            price,
            technicianId: technician.id,
        },
        include: {
            technician: true
        }
    })

    return service
}