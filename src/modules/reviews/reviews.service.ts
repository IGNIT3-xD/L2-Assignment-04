import { Reviews } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const createReviwsQuery = async (customerId: string, bookingId: string, payload: Pick<Reviews, 'rating' | 'comment'>) => {
    const { rating, comment } = payload

    if (!rating || rating < 1 || rating > 5)
        throw new Error('Rating must be between 1 and 5.')

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    })

    if (booking?.customerId !== customerId || booking.id !== bookingId)
        throw new Error('Booking not found')

    if (booking.status !== 'COMPLETED')
        throw new Error('You can only review a booking after the service is completed.')

    const isExist = await prisma.reviews.findUnique({
        where: { bookingId }
    })

    if (isExist)
        throw new Error('You have already reviewed this booking.')

    const review = await prisma.$transaction(async (tx) => {
        const createdReview = await tx.reviews.create({
            data: {
                rating,
                comment,
                userId: customerId,
                bookingId
            }
        });

        const aggregate = await tx.reviews.aggregate({
            where: {
                booking: { technicianId: booking.technicianId }
            },
            _avg: { rating: true },
            _count: { rating: true }
        });

        await tx.technician.update({
            where: { id: booking.technicianId },
            data: {
                avgRating: aggregate._avg.rating ?? 0,
                totalReviews: aggregate._count.rating
            }
        });

        return createdReview
    })

    return review
}

export const getAllReviewsQuery = async () => {
    const reviews = await prisma.reviews.findMany({
        include: {
            customer: {
                select: {
                    name: true,
                    email: true,
                }
            },
            booking: {
                select: {
                    service: {
                        select: {
                            title: true,
                            description: true,
                            price: true,
                        }
                    }
                }
            }
        },
        omit: { bookingId: true }
    })

    if (!reviews)
        throw new Error('Review not found')

    return reviews
}

export const deleteReviewQuery = async (userId: string, reviewId: string) => {
    const review = await prisma.reviews.findUnique({ where: { id: reviewId } })

    if (!review || review.userId !== userId)
        throw new Error('Review not found.')

    const delReview = await prisma.reviews.delete({ where: { id: reviewId } })

    return delReview
}