import config from "../../config"
import { prisma } from "../../lib/prisma"
import { stripe } from "../../lib/stripe"
import { AppError } from "../../utils/AppError";

export const createPaymentQuery = async (bookingId: string, customerId: string) => {
    const BDT_USD = 0.0081;

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: true }
    })

    if (!booking || booking.customerId !== customerId)
        throw new AppError(404, 'Booking not found.')

    if (booking.status === 'DECLINED')
        throw new AppError(403, 'Booking is declined by the technician.')

    if (booking.status !== 'ACCEPTED')
        throw new AppError(400, 'Booking must be accepted by technician before payment.')

    const existingPayment = await prisma.payment.findUnique({
        where: { bookingId }
    })

    if (existingPayment?.status === 'PAID')
        throw new AppError(400, 'Payment already initiated for this booking.')

    const priceInUsd = booking.service.price * BDT_USD
    const amountInCents = Math.round(priceInUsd * 100)

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: { name: booking.service.title },
                    unit_amount: amountInCents
                },
                quantity: 1
            }
        ],
        success_url: `${config.APP_URL}/bookings/${booking.id}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.APP_URL}/bookings/${booking.id}/payment-cancel`,
        metadata: {
            bookingId: booking.id
        }
    })

    if (existingPayment) {
        await prisma.payment.update({
            where: { bookingId },
            data: {
                amount: booking.service.price,
                stripeIntentId: session.id,
                status: 'PENDING',
            }
        })
    }
    else {
        await prisma.payment.create({
            data: {
                amount: booking.service.price,
                stripeIntentId: session.id,
                bookingId: booking.id
            }
        });
    }

    return { checkoutUrl: session.url }
}

export const stripeWebhookHandlerQuery = async (payload: Buffer, signature: string) => {
    // console.log("webhook recevied...");
    const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        config.WEBHOOK_SECRET
    )

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object

        const payment = await prisma.payment.update({
            where: { stripeIntentId: session.id },
            data: {
                status: 'PAID',
                paidAt: new Date()
            }
        })

        await prisma.booking.update({
            where: { id: payment.bookingId },
            data: {
                status: 'PAID'
            }
        })
    }

    if (event.type === 'checkout.session.expired') {
        const session = event.data.object
        console.log("Failed....");
        await prisma.payment.update({
            where: { stripeIntentId: session.id },
            data: { status: 'FAILED' }
        })
    }
}

export const getUsersPaymentQuery = async (customerId: string) => {
    const payment = await prisma.payment.findMany({
        where: {
            booking: {
                customerId
            }
        }
    })

    return payment
}

export const getPaymentByIdQuery = async (paymentId: string, customerId: string) => {
    const payment = await prisma.payment.findUnique({
        where: {
            id: paymentId,
            booking: { customerId }
        },
        include: {
            booking: {
                select: {
                    service: {
                        select: {
                            title: true,
                            description: true,
                            technician: {
                                select: {
                                    user: {
                                        select: {
                                            name: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    return payment
}