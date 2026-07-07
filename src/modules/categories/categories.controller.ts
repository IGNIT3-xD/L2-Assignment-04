import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from 'express';
import { createCategoriesQuery, getCategoriesQuery } from "./categories.service";

export const createCategories = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body

    if (!payload.name)
        throw new Error("Invalid category.")

    const category = await createCategoriesQuery(payload)

    res.status(401).json({
        success: true,
        message: "Category created successfully.",
        data: category
    })
})

export const getCategories = catchAsync(async (req: Request, res: Response) => {
    const categories = await getCategoriesQuery()

    res.status(200).json({
        success: true,
        message: "Categories retrieved successfully.",
        data: categories
    })
})