import { Router } from "express";
import { createService } from "./services.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const servicesRouter = Router()

servicesRouter.post('/', auth(Role.ADMIN, Role.TECHNICIAN), createService)

export default servicesRouter