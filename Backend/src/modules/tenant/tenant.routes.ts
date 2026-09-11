import { Router } from "express";
import tenantController from "./tenant.controller";
import validateRequest from "../../middleware/validateRequest";
import {
  createTenantSchema,
  updateTenantSchema,
  tenantStatusSchema,
} from "./tenant.validation";
import { authenticate, authorize } from "../../middleware/authMiddleware";

const router = Router();

// Clinic registration / creation (Admin authorized)
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateRequest(createTenantSchema),
  tenantController.createTenant
);

// Get all clinics
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  tenantController.getAllTenants
);

// Get clinic by ID
router.get(
  "/:id",
  authenticate,
  tenantController.getTenantById
);

// Update clinic
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest(updateTenantSchema),
  tenantController.updateTenant
);

// Activate / Deactivate clinic
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  validateRequest(tenantStatusSchema),
  tenantController.setTenantStatus
);

export default router;
