import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { createPaymentQuery, getPaymentByIdQuery, getUsersPaymentQuery, stripeWebhookHandlerQuery } from "./payment.service";

export const createPayement = catchAsync(async (req: Request, res: Response) => {
    const { bookingId } = req.body
    const customerId = req.user?.id

    const payment = await createPaymentQuery(bookingId, customerId)

    res.status(201).json({
        success: true,
        message: "Checkout session created successfully.",
        data: payment,
    })
})

export const stripeWebhookHandler = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string

    await stripeWebhookHandlerQuery(req.body, signature)

    res.status(200).json({
        success: true,
        message: "Webhook triggered successfully.",
        data: null,
    })
})

export const getUsersPayment = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id
    const payments = await getUsersPaymentQuery(customerId)

    res.status(200).json({
        success: true,
        message: "Users payments retrieved successfully.",
        data: payments,
    })
})

export const getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user?.id
    const paymentId = req.params.id as string

    const payment = await getPaymentByIdQuery(paymentId, customerId)

    res.status(200).json({
        success: true,
        message: "Payment retrieved successfully.",
        data: payment,
    })
})

