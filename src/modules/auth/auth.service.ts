import { User } from "../../../generated/prisma/client";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import bcrypt from 'bcrypt'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { AppError } from "../../utils/AppError";
import { googleClient } from "../../lib/googleAuth";

export const regUserQuery = async (payload: Pick<User, 'name' | 'email' | 'password' | 'role'> & { profilePicture?: string }) => {
    const { name, email, password, role, profilePicture } = payload
    if (!name || !email || !password)
        throw new AppError(400, "Name, Email and Password must be provided.")

    if (role === Role.ADMIN)
        throw new AppError(400, "You are not eligible for Admin role.")

    if (password.length < 6)
        throw new AppError(400, "Password must be at least 6 characters long.")

    const isExist = await prisma.user.findUnique({
        where: { email }
    })

    if (isExist)
        throw new AppError(400, "User is already exist.")

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            profilePicture,
            role
        },
        omit: { password: true }
    })

    const jwtPaylaod = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwt.sign(jwtPaylaod, config.JWT_ACCESS, { expiresIn: '1d' })
    const refreshToken = jwt.sign(jwtPaylaod, config.JWT_REFRESH, { expiresIn: '7d' })

    return { user, accessToken, refreshToken }
}

export const loginUserQuery = async (data: Pick<User, 'email' | 'password'>) => {
    const { email, password } = data

    const user = await prisma.user.findUniqueOrThrow({
        where: { email }
    })

    const isPasswordMatched = await bcrypt.compare(password, user.password)
    if (!isPasswordMatched)
        throw new AppError(400, "Incorrect password")

    const jwtPaylaod = {
        id: user.id,
        name: user.name,
        email,
        role: user.role
    }

    const accessToken = jwt.sign(jwtPaylaod, config.JWT_ACCESS, { expiresIn: '1d' })
    const refreshToken = jwt.sign(jwtPaylaod, config.JWT_REFRESH, { expiresIn: '7d' })

    return {
        accessToken,
        refreshToken
    }
}

export const myProfileQuery = async (user_id: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: user_id },
        omit: { password: true },
        include: {
            technicians: {
                omit: {
                    userId: true
                },
                include: {
                    userBookings: true,
                    availabilities: true
                }
            },
            myBookings: true
        }
    })

    return user
}

export const tokenGenerateQuery = async (refreshToken: string) => {
    const varfiedRefreshToken = jwt.verify(refreshToken, config.JWT_REFRESH)
    // console.log(varfiedRefreshToken);
    const { id } = varfiedRefreshToken as JwtPayload

    const user = await prisma.user.findUniqueOrThrow({
        where: { id }
    })

    const jwtPayload = {
        id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwt.sign(jwtPayload, config.JWT_ACCESS, { expiresIn: '1d' })

    return { accessToken }
}

export const updateProfileQuery = async (user_id: string, payload: {
    name?: string,
    currentPassword?: string
    newPassword?: string
    profilePicture?: string
}) => {
    const { name, currentPassword, newPassword, profilePicture } = payload

    const isExist = await prisma.user.findUnique({
        where: { id: user_id }
    })

    if (!isExist) {
        throw new AppError(404, 'User not found')
    }

    const updateData: {
        name?: string
        profilePicture?: string
        password?: string
    } = {}

    if (name !== undefined) {
        updateData.name = name
    }

    if (profilePicture !== undefined) {
        updateData.profilePicture = profilePicture
    }

    if (newPassword) {
        if (!currentPassword) {
            throw new AppError(400, "Current password is required to change password")
        }

        const isPasswordMacthed = await bcrypt.compare(currentPassword, isExist.password)
        if (!isPasswordMacthed) {
            throw new AppError(400, "Incorrect current password")
        }

        updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const updateUser = await prisma.user.update({
        where: { id: user_id },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profilePicture: true,
            created_at: true,
            updated_at: true
        }
    })

    return updateUser
}

export const googleLoginQuery = async (idToken: string) => {
    let googleIdTokenPayload = null

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: config.GOOGLE_CLIENT_ID
        })

        googleIdTokenPayload = ticket.getPayload()

    } catch (error) {
        throw new AppError(500, 'Invalid or Expired ID Token')
    }

    if (!googleIdTokenPayload) {
        throw new AppError(500, 'Invalid or Expired ID Token')
    }

    if (!googleIdTokenPayload.email || !googleIdTokenPayload.name) {
        throw new AppError(500, 'Gmail or User not found.')
    }

    const userWithGoogle = await prisma.user.findUnique({
        where: {
            email: googleIdTokenPayload.email,
            role: Role.CUSTOMER
        }
    })

    let user = userWithGoogle

    if (!user) {
        const isExistWithCredentials = await prisma.user.findUnique({
            where: {
                email: googleIdTokenPayload.email,
                role: Role.CUSTOMER
            }
        })

        if (isExistWithCredentials) {
            if (isExistWithCredentials.status === UserStatus.BLOCKED) {
                throw new AppError(403, 'User has been blcoked')
            }

            user = await prisma.user.update({
                where: {
                    id: isExistWithCredentials.id,
                },
                data: {
                    googleId: googleIdTokenPayload.sub
                }
            })
        } else {
            user = await prisma.user.create({
                data: {
                    name: googleIdTokenPayload.name,
                    email: googleIdTokenPayload.email,
                    googleId: googleIdTokenPayload.sub
                }
            })
        }
    }

    if (user.status === UserStatus.BLOCKED) {
        throw new AppError(403, 'User has been blcoked')
    }

    const jwtPaylaod = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwt.sign(jwtPaylaod, config.JWT_ACCESS, { expiresIn: '1d' })
    const refreshToken = jwt.sign(jwtPaylaod, config.JWT_REFRESH, { expiresIn: '7d' })

    return {
        accessToken,
        refreshToken
    }
}