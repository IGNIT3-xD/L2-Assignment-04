import { Router } from "express";
import { createService, getAllServices, getServiceById } from "./services.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const servicesRouter = Router()

servicesRouter.post('/', auth(Role.ADMIN, Role.TECHNICIAN), createService)
servicesRouter.get('/', getAllServices)
servicesRouter.get('/:id', getServiceById)

export default servicesRouter