import { Router } from "express";
import { createTechnicianProfile, getAllTechnicians, getTechnicianBookings, getTechnicianById, getTechnicianServices, updateAvailablility, updateBookingStatus, updateProfile } from "./technician.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const technicianRouter = Router()

technicianRouter.post('/technicians/', auth(Role.TECHNICIAN, Role.ADMIN), createTechnicianProfile)
technicianRouter.get('/technicians', getAllTechnicians)
technicianRouter.get('/technicians/services', auth(Role.TECHNICIAN, Role.ADMIN), getTechnicianServices)
technicianRouter.get('/technicians/:id', getTechnicianById)
technicianRouter.put('/technician/profile', auth(Role.ADMIN, Role.TECHNICIAN), updateProfile)
technicianRouter.put('/technician/:id/availability', auth(Role.ADMIN, Role.TECHNICIAN), updateAvailablility)
technicianRouter.get('/technician/bookings', auth(Role.ADMIN, Role.TECHNICIAN), getTechnicianBookings)
technicianRouter.patch('/technician/bookings/:id', auth(Role.ADMIN, Role.TECHNICIAN), updateBookingStatus)

export default technicianRouter