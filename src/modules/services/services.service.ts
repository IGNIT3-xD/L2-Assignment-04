import { time } from "node:console";
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
            categoryId: true,
            technicianId: true
        }
    })

    return service
}

export const getAllServicesQuery = async (query: any) => {
    // Sorting
    // const sortBy = query.sortBy ? query.sortBy : "createdAt"
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc"
    const technicianSortField = ['experience', 'avgRating', 'location']

    let orderBy: any;

    if (technicianSortField.includes(query.sortBy)) {
        orderBy = {
            technician: {
                [query.sortBy]: sortOrder
            }
        }
    }
    else {
        const sortBy = query.sortBy || "createdAt"
        orderBy = {
            [sortBy]: sortOrder
        }
    }

    const services = await prisma.service.findMany({
        where: {
            AND: [
                query.searchBy ? {
                    OR: [
                        { title: { contains: query.searchBy, mode: 'insensitive' } },
                        { technician: { location: { contains: query.searchBy, mode: 'insensitive' } } },
                        { category: { name: { contains: query.searchBy, mode: 'insensitive' } } }
                    ]
                } : {},
                query.title ? { title: { contains: query.title, mode: 'insensitive' } } : {},
                query.location ? { technician: { location: { contains: query.location, mode: 'insensitive' } } } : {},
                query.category ? { category: { name: { contains: query.category, mode: 'insensitive' } } } : {},
            ]
        },
        include: {
            category: {
                omit: { id: true }
            },
            technician: {
                omit: { userId: true }
            }
        },
        orderBy
    })

    return services
}