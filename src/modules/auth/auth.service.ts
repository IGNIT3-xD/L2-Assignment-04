import { User } from "../../../generated/prisma/client";
import { Role } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import bcrypt from 'bcrypt'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { AppError } from "../../utils/AppError";

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
                    userBookings: true
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