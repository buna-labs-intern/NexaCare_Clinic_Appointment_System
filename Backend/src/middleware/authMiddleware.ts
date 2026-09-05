import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";
import prisma from "../shared/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "ADMIN" | "RECEPTIONIST";
    fullName: string;
    tenantId: string;
    tenantName?: string;
    tenantSlug?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "appointment_system_jwt_secret_key_2026";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "You are not authenticated. Please log in.");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError(401, "Invalid authorization token.");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: "ADMIN" | "RECEPTIONIST";
      tenantId?: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        tenantId: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(401, "User belonging to this token no longer exists.");
    }

    if (!user.isActive) {
      throw new AppError(403, "Your account has been deactivated. Please contact an administrator.");
    }

    if (!user.tenant || !user.tenant.isActive) {
      throw new AppError(403, "The clinic account is currently inactive. Please contact support.");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "RECEPTIONIST",
      fullName: user.fullName,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      tenantSlug: user.tenant.slug,
    };

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new AppError(401, "Invalid or expired session token. Please log in again."));
    } else {
      next(error);
    }
  }
};

export const authorize = (...allowedRoles: ("ADMIN" | "RECEPTIONIST")[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "You are not authenticated."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(403, "You do not have permission to perform this action.")
      );
    }

    next();
  };
};
