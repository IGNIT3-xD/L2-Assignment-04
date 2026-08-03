import { Router } from "express";
import { auth } from './../../middlewares/auth';
import { Role } from './../../../prisma/generated/prisma/enums';
import { getAdminDashboardStats, getCustomerDashboardStats, getTechnicianDashboardStats } from './dashboard.controller';

const dashboardRouter = Router()

dashboardRouter.get('/admin', auth(Role.ADMIN), getAdminDashboardStats)
dashboardRouter.get('/customer', auth(Role.ADMIN, Role.CUSTOMER), getCustomerDashboardStats)
dashboardRouter.get('/technician', auth(Role.ADMIN, Role.TECHNICIAN), getTechnicianDashboardStats)

export default dashboardRouter