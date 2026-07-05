import { Role } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IUser } from "./auth.interface";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const regUserQuery = async (payload: IUser) => {
    const { name, email, password, role } = payload
    if (!name || !email || !password)
        throw new Error("Name, Email and Password must be provided.")

    if (role === Role.ADMIN)
        throw new Error("You are not eligible for Admin role.")

    if (password.length < 6)
        throw new Error("Password must be at least 6 characters long.")

    const isExist = await prisma.user.findUnique({
        where: { email }
    })

    if (isExist)
        throw new Error("User is already exist.")

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role
        }
    })

    return user
}

export const loginUserQuery = async (data: IUser) => {
    const { email, password } = data

    const user = await prisma.user.findUniqueOrThrow({
        where: { email }
    })

    const isPasswordMatched = await bcrypt.compare(password, user.password)
    if (!isPasswordMatched)
        throw new Error("Incorrect password")

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
        omit: { password: true }
    })

    return user
}