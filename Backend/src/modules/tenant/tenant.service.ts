import tenantRepository from "./tenant.repository";
import AppError from "../../utils/AppError";
import { SearchOptions } from "../../shared/Types";

export class TenantService {
  async createTenant(payload: {
    name: string;
    slug: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  }) {
    const existing = await tenantRepository.findBySlug(payload.slug);
    if (existing) {
      throw new AppError(400, "A clinic with this slug identifier already exists");
    }

    return tenantRepository.create(payload);
  }

  async getAllTenants(options?: SearchOptions & { isActive?: boolean }) {
    return tenantRepository.findAll(options);
  }

  async getTenantById(id: string) {
    const tenant = await tenantRepository.findById(id);
    if (!tenant) {
      throw new AppError(404, "Clinic tenant not found");
    }
    return tenant;
  }

  async getTenantBySlug(slug: string) {
    const tenant = await tenantRepository.findBySlug(slug);
    if (!tenant) {
      throw new AppError(404, "Clinic tenant not found");
    }
    return tenant;
  }

  async updateTenant(
    id: string,
    payload: {
      name?: string;
      slug?: string;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
      isActive?: boolean;
    }
  ) {
    await this.getTenantById(id);

    if (payload.slug) {
      const existingSlug = await tenantRepository.findBySlug(payload.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new AppError(400, "A clinic with this slug already exists");
      }
    }

    return tenantRepository.update(id, payload);
  }

  async setTenantStatus(id: string, isActive: boolean) {
    await this.getTenantById(id);
    return tenantRepository.setStatus(id, isActive);
  }
}

export default new TenantService();
