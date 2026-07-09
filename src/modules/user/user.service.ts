import { User } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import { AppError } from "../../utils/AppError"

export const getAllUsersQuery = async (query: any) => {
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc"
    const sortBy = query.sortBy || "created_at"

    const users = await prisma.user.findMany({
        where: {
            AND: [
                query.role ? { role: query.role.toUpperCase() } : {},
                query.status ? { status: query.status.toUpperCase() } : {}
            ]
        },
        omit: { password: true },
        orderBy: {
            [sortBy]: sortOrder
        }
    })

    return users
}

export const updateUserStatusQuery = async (userId: string, payload: Pick<User, 'status'>) => {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user)
        throw new AppError(404, 'User not found.')

    const upUser = await prisma.user.update({
        where: { id: userId },
        data: {
            status: payload.status
        }
    })

    return upUser
}

export const getAllBookingsQuery = async (query: any) => {
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc"
    const sortBy = query.sortBy || 'bookedAt'

    const bookings = await prisma.booking.findMany({
        where: {
            AND: [
                query.status ? { status: query.status.toUpperCase() } : {}
            ]
        },
        include: {
            technician: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            }
        },
        orderBy: {
            [sortBy]: sortOrder
        }
    })

    return bookings
}