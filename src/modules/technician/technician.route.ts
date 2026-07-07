import { Router } from "express";
import { createTechnicianProfile, getAllTechnicians, getTechnicianById } from "./technician.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const technicianRouter = Router()

technicianRouter.post('/', auth(Role.TECHNICIAN, Role.ADMIN), createTechnicianProfile)
technicianRouter.get('/', getAllTechnicians)
technicianRouter.get('/:id', getTechnicianById)

export default technicianRouter