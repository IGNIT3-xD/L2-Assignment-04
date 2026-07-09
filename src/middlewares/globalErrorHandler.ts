import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500
    let message = "Something went wrong!";

    if (err instanceof AppError) {
        statusCode = err.statusCode
        message = err.message
    }

    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            statusCode = 409
            message = `Duplicate value: ${err.meta?.target}`
        }
        else if (err.code === 'P2025') {
            statusCode = 404
            message = 'Not found!'
        }
        else {
            statusCode = 400
            message: `Database error: ${err.message}`
        }
    }

    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400
        message = 'Invalid data provided.'
    }

    else if (err instanceof Error) {
        message: err.message
    }

    res.status(statusCode).json({
        succcess: false,
        message,
        error: err.stack
    })
}