import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { createReviwsQuery, deleteReviewQuery, getAllReviewsQuery, getCustomerReviewsQuery } from "./reviews.service";

export const createReviews = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const { bookingId } = req.body

    const review = await createReviwsQuery(userId, bookingId, req.body)

    res.status(201).json({
        success: true,
        message: "Review submitted successfully.",
        data: review
    })
})

export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const reviews = await getAllReviewsQuery()

    res.status(200).json({
        success: true,
        message: "Reviews retrieved successfully.",
        data: reviews
    })
})

export const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const reviewId = req.params.id as string
    const review = await deleteReviewQuery(userId, reviewId)

    res.status(200).json({
        success: true,
        message: "Review deleted successfully.",
        data: review
    })
})

export const getCustomerReviews = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id

    const reviews = await getCustomerReviewsQuery(userId as string)

    res.status(200).json({
        success: true,
        message: "Reviews retrieved successfully.",
        data: reviews
    })
})