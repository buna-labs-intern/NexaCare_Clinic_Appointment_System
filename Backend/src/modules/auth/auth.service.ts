import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../shared/prisma";
import AppError from "../../utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "appointment_system_jwt_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export class AuthService {
  static async login(payload: {
    email: string;
    password: string;
    tenantSlug?: string;
    tenantId?: string;
  }) {
    const normalizedEmail = payload.email.trim().toLowerCase();

    let user: any = null;

    if (payload.tenantSlug) {
      const tenant = await prisma.tenant.findUnique({
        where: { slug: payload.tenantSlug.trim().toLowerCase() },
      });
      if (!tenant) {
        throw new AppError(404, "Clinic not found with the provided slug");
      }
      user = await prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: tenant.id,
            email: normalizedEmail,
          },
        },
        include: { tenant: true },
      });
    } else if (payload.tenantId) {
      user = await prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: payload.tenantId,
            email: normalizedEmail,
          },
        },
        include: { tenant: true },
      });
    } else {
      const users = await prisma.user.findMany({
        where: { email: normalizedEmail },
        include: { tenant: true },
      });

      if (users.length === 0) {
        throw new AppError(401, "Invalid email or password");
      }

      if (users.length > 1) {
        throw new AppError(
          400,
          "Multiple clinics found for this email account. Please provide your clinic identifier (tenantSlug)."
        );
      }

      user = users[0];
    }

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new AppError(403, "Your account has been deactivated. Please contact an administrator.");
    }

    if (!user.tenant || !user.tenant.isActive) {
      throw new AppError(403, "The clinic account is currently inactive. Please contact support.");
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        tenantId: user.tenantId,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
        },
      },
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        tenantId: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  }
}
