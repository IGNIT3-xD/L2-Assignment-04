import { Category } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

export const createCategoriesQuery = async (payload: Pick<Category, 'name'>) => {
    const { name } = payload

    const isExist = await prisma.category.findUnique({
        where: { name }
    })
    
    if (isExist)
        throw new AppError(400, "Category is already exist.")

    const category = await prisma.category.create({
        data: {
            name
        }
    })

    return category
}

export const getCategoriesQuery = async () => {
    const categories = await prisma.category.findMany({
        include: {
            services: {
                omit: { categoryId: true }
            }
        }
    })
    return categories
}