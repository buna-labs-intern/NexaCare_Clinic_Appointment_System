import { z } from "zod";

export const createTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Clinic name must be at least 2 characters long"),
    slug: z
      .string()
      .min(2, "Slug must be at least 2 characters long")
      .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    email: z.string().email("Invalid email format").optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
  }),
});

export const updateTenantSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Clinic name must be at least 2 characters long").optional(),
    slug: z
      .string()
      .min(2, "Slug must be at least 2 characters long")
      .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
      .optional(),
    email: z.string().email("Invalid email format").optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const tenantStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});
