import { prisma } from "../database/prisma";
import { TCreateAttendance, TUpdateAttendance } from "../validator/attendance.validator";

export class AttendanceRepository {
  async index(params: { page: number; perPage: number; search?: string }) {
    const { page, perPage, search } = params;
    const skip = (page - 1) * perPage;

    const where: any = { deletedAt: null };
    if (search) {
      where.customer = { name: { contains: search, mode: "insensitive" } };
    }

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        skip,
        take: perPage,
        where,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          receptionist: { select: { id: true, name: true } },
          screening: { select: { id: true, status: true } },
          consultation: { select: { id: true, deletedAt: true } },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    return { data, total };
  }

  async show(id: string) {
    return prisma.attendance.findUnique({
      where: { id },
      include: {
        customer: true,
        receptionist: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, unit_price: true } },
        screening: {
          include: { nurse: { select: { id: true, name: true } } },
        },
        consultation: {
          include: {
            doctor: { select: { id: true, name: true } },
            screening: true,
          },
        },
      },
    });
  }

  async byCustomer(customerId: string) {
    return prisma.attendance.findMany({
      where: { customerId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        reference: true,
        status: true,
        createdAt: true,
        service: { select: { id: true, name: true, unit_price: true } },
      },
    });
  }

  async create(data: TCreateAttendance & { reference: string }) {
    return prisma.attendance.create({ data });
  }

  async update(id: string, data: TUpdateAttendance) {
    return prisma.attendance.update({ where: { id }, data });
  }

  async generateReference(): Promise<string> {
    const today = new Date();
    const date = today.toISOString().slice(0, 10).replace(/-/g, "");
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const count = await prisma.attendance.count({ where: { createdAt: { gte: start, lt: end } } });
    return `AT-${date}-${String(count + 1).padStart(4, "0")}`;
  }
}
