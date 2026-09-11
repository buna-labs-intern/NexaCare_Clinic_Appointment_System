import { Request, Response, NextFunction } from "express";
import tenantService from "./tenant.service";
import sendResponse from "../../utils/sendResponse";
import { pickFilterOptions } from "../../utils";

export class TenantController {
  async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tenantService.createTenant(req.body);
      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Clinic registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const options = pickFilterOptions(req.query, ["isActive"]);
      const result = await tenantService.getAllTenants(options);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Clinics retrieved successfully",
        meta: result.meta,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTenantById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tenantService.getTenantById(req.params.id as string);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Clinic details retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tenantService.updateTenant(req.params.id as string, req.body);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Clinic updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async setTenantStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tenantService.setTenantStatus(
        req.params.id as string,
        req.body.isActive
      );
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Clinic status updated to ${req.body.isActive ? "active" : "inactive"}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TenantController();
