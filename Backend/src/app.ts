import express, { Application, Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./middleware/globalErrorHandler";
import morganMiddleware from "./middleware/morganMiddleware";
import authRoutes from "./modules/auth/auth.routes";
import tenantRoutes from "./modules/tenant/tenant.routes";
import userRoutes from "./modules/user/user.routes";
import doctorRoutes from "./modules/doctor/doctor.routes";
import patientRoutes from "./modules/patient/patient.route";
import serviceRoutes from "./modules/service/service.routes";
import appointmentRoutes from "./modules/appointment/appointment.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.route";
import notificationRoutes from "./modules/notification/notification.routes";
import { authenticate } from "./middleware/authMiddleware";

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

// ✅ Health Check
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Hello from Clinic Appointment Management System API",
  });
});

// ✅ Core API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", authenticate, notificationRoutes);

// ✅ Global Error Handler - Always last
app.use(globalErrorHandler);

export default app;