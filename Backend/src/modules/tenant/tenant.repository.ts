import prisma from "../../shared/prisma";
import { SearchOptions } from "../../shared/Types";
import { calculatePagination, generateSearchCondition } from "../../utils";

export class TenantRepository {
  async create(data: {
    name: string;
    slug: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  }) {
    return prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug.toLowerCase(),
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
      },
    });
  }

  async findAll(options?: SearchOptions & { isActive?: boolean }) {
    if (!options) {
      return prisma.tenant.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    const { page, limit, sortBy, sortOrder, searchTerm, isActive } = options;
    const { skip, take } = calculatePagination(page, limit);

    const searchCondition = generateSearchCondition(searchTerm, ["name", "slug", "email", "phone", "address"]);
    const filterCondition: any = {};
    if (isActive !== undefined) filterCondition.isActive = isActive;

    const where = {
      ...searchCondition,
      ...filterCondition,
    };

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || "asc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [data, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          _count: {
            select: {
              users: true,
              doctors: true,
              patients: true,
              appointments: true,
            },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: page || 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / (take || 10)),
      },
    };
  }

  async findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            doctors: true,
            patients: true,
            appointments: true,
            services: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.tenant.findUnique({
      where: { slug: slug.toLowerCase() },
    });
  }

  async update(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug.toLowerCase();
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.tenant.update({
      where: { id },
      data: updateData,
    });
  }

  async setStatus(id: string, isActive: boolean) {
    return prisma.tenant.update({
      where: { id },
      data: { isActive },
    });
  }
}

export default new TenantRepository();
