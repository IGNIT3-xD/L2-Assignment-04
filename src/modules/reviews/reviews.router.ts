import { Router } from "express";
import { createReviews, deleteReview, getAllReviews } from "./reviews.controller";
import { auth } from './../../middlewares/auth';
import { Role } from "../../../generated/prisma/enums";

const reviewsRouter = Router()

reviewsRouter.post('/', auth(Role.CUSTOMER, Role.ADMIN), createReviews)
reviewsRouter.get('/', getAllReviews)
reviewsRouter.delete('/:id', auth(Role.CUSTOMER, Role.ADMIN), deleteReview)

export default reviewsRouter