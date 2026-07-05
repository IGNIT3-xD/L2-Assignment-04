import { Role } from "../../../generated/prisma/enums"

export interface IUser {
    name: string,
    email: string,
    password: string,
    role: Role
}