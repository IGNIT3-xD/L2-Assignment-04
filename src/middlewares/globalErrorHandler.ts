import { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
        succcess: false,
        message: err.message,
        error: err.stack
    })
}