import type { Service } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const createServiceQuery = async (payload: Pick<Service, 'title' | 'description' | 'price' | 'categoryId'>, userId: string) => {
    const { title, description, price, categoryId } = payload

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
            categoryId
        },
        include: {
            technician: true
        }
    })

    return service
}