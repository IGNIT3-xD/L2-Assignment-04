import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}

export const auth = (...requiredRoles: Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1]

        if (!token)
            throw new AppError(403, 'Please login to access !!!')

        const varifiedToken = jwt.verify(token, config.JWT_ACCESS) as JwtPayload
        // console.log(varifiedToken);

        if (requiredRoles.length && !requiredRoles.includes(varifiedToken.role))
            throw new AppError(401, "Unauthorize access")

        const user = await prisma.user.findUnique({
            where: { id: varifiedToken.id }
        })
        if (!user)
            throw new AppError(404, "User not found")

        if (user.status === 'BLOCKED')
            throw new AppError(403, 'Your account has been blocked.')

        req.user = varifiedToken

        next()
    })
}