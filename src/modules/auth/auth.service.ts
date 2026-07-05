import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IUser } from "./auth.interface";
import bcrypt from 'bcrypt'

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