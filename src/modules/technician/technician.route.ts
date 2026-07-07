import { Router } from "express";
import { createTechnicianProfile } from "./technician.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const technicianRouter = Router()

technicianRouter.post('/', auth(Role.TECHNICIAN, Role.ADMIN), createTechnicianProfile)

export default technicianRouter