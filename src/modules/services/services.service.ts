import type { Service } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const createServiceQuery = async (payload: Pick<Service, 'title' | 'description' | 'price' | 'categoryId'>, userId: string) => {
    const { title, description, price, categoryId } = payload

    if (!categoryId)
        throw new Error("Please, provide a category id. You can get it from (/api/categories)")

    const technician = await prisma.technician.findUnique({
        where: { userId }
    })

    if (!technician)
        throw new Error("Technician profile not found for this user.")

    const category = await prisma.category.findUnique({
        where: { id: categoryId }
    })

    if (!category)
        throw new Error("Category doesn't exist")

    const service = await prisma.service.create({
        data: {
            title,
            description,
            price,
            technicianId: technician.id,
            categoryId
        },
        include: {
            technician: true,
            category: {
                omit: {
                    id: true
                }
            }
        },
        omit: {
            categoryId: true
        }
    })

    return service
}