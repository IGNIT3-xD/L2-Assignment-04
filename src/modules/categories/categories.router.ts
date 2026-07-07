import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { createCategories, getCategories } from "./categories.controller";

const categoryRouter = Router()

categoryRouter.post('/admin/categories', auth(Role.ADMIN), createCategories)
categoryRouter.get('/categories', getCategories)

export default categoryRouter