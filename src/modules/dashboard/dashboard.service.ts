import { prisma } from '../../lib/prisma';
import { AppError } from './../../utils/AppError';

export const getAdminDashboardStatsQuery = async (userId: string) => {
    if (!userId) {
        throw new AppError(403, "Unauthorized")
    }

    const totalUsers = await prisma.user.count()
    const totalTechnicians = await prisma.technician.count()
    const Customers = await prisma.user.findMany({
        where: {
            role: 'CUSTOMER'
        }
    })
    const totalCustomer = Customers.length
    const totalServices = await prisma.service.count()
    const totalBookings = await prisma.booking.count()
    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true
        }
    })

    return {
        totalUsers,
        totalTechnicians,
        totalCustomer,
        totalServices,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount
    }
}

export const getCustomerDashboardStatsQuery = async (userId: string) => {
    if (!userId) {
        throw new AppError(403, "Unauthorized")
    }

    const myTotalBookings = await prisma.booking.count({
        where: {
            customerId: userId
        }
    })

    const totalPaid = await prisma.payment.aggregate({
        where: {
            booking: {
                customerId: userId
            }
        },
        _sum: {
            amount: true
        }
    })

    const totalReviewsGiven = await prisma.reviews.count({
        where: {
            userId
        }
    })

    return {
        myTotalBookings,
        totalPaid: totalPaid._sum.amount,
        totalReviewsGiven
    }
}

export const getTechnicianDashboardStatsQuery = async (userId: string) => {
    if (!userId) {
        throw new AppError(403, "Unauthorized")
    }

    const myServiceTotalBookings = await prisma.booking.count({
        where: {
            technician: {
                userId
            }
        }
    })

    const myServices = await prisma.service.count({
        where: {
            technician: { userId }
        }
    })

    const totalServicesCompleted = await prisma.booking.count({
        where: {
            technician: {
                userId
            },
            status: "COMPLETED"
        }
    })

    const totalServicesRequested = await prisma.booking.count({
        where: {
            technician: {
                userId
            },
            status: "REQUESTED"
        }
    })

    const totalEarned = await prisma.payment.aggregate({
        where: {
            booking: {
                technician: {
                    userId
                }
            }
        },
        _sum: {
            amount: true
        }
    })

    const totalReviewsReceived = await prisma.reviews.count({
        where: {
            booking: {
                technician: {
                    userId
                }
            }
        }
    })

    return {
        myServiceTotalBookings,
        myServices,
        totalServicesCompleted,
        totalServicesRequested,
        totalEarned: totalEarned._sum.amount,
        totalReviewsReceived
    }
}