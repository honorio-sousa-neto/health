import { Customer } from "@prisma/client";
import { IRepository, Meta } from "../../types/global.interfaces";
import {
  TCreateCustomer,
  TUpdateCustomer,
} from "../../validator/customer.validator";

import { prisma } from "../../database/prisma";

export class CustomerRepository
  implements IRepository<Customer, TCreateCustomer, TUpdateCustomer>
{
  async index(payload: {
    search?: string;
    page: number;
    perPage: number;
    orderBy?: any;
  }): Promise<Meta<Customer[]>> {
    const { page, perPage, search, orderBy } = payload;
    const skip = (page - 1) * perPage;

    const customers = await prisma.customer.findMany({
      take: perPage,
      skip: skip,
      where: search
        ? {
            AND: [
              { name: { contains: search, mode: "insensitive" } },
              { deletedAt: null },
            ],
          }
        : {
            AND: [{ deletedAt: null }],
          },
      orderBy: JSON.parse(orderBy),
      include: {
        customersInsurance: { include: { insurance: true } },
        protocol: true,
        Partner: true,
        intern_insurance: { include: { intern: true } },
        internInsuranceAggregate: { include: { intern: true } },
      },
    });
    const total = await prisma.customer.count({
      where: search
        ? {
            AND: [
              { name: { contains: search, mode: "insensitive" } },
              { deletedAt: null },
            ],
          }
        : {
            AND: [{ deletedAt: null }],
          },
    });
    return {
      data: customers,
      meta: {
        page,
        perPage,
        search,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async show(id: string): Promise<Meta<Customer>> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        customersInsurance: true,
        protocol: true,
        _count: true,
      },
    });
    return { data: customer };
  }

  async create(payload: TCreateCustomer): Promise<Meta<Customer>> {
    const { list, ...rest } = payload;
    const customer = await prisma.customer.create({
      data: { deletedAt: null, ...rest },
    });

    if (customer && list) {
      console.log(list);
      await Promise.all(
        list?.map(async (item) => {
          await prisma.customer.update({
            where: {
              id: item.id,
            },
            data: {
              order: item.order,
            },
          });
        })
      );
    }
    return { data: customer };
  }

  async update(id: string, payload: TUpdateCustomer): Promise<Meta<Customer>> {
    const { list, ...rest } = payload;
    await prisma.customer.update({
      where: { id },
      data: {
        address: null,
        email: null,
        nif: null,
        phone: null,
        source: null,
        protocolId: null,
        partnerId: null,
        name: undefined,
      },
    });
    const customer = await prisma.customer.update({
      where: { id },
      data: { ...rest },
    });
    if (customer && list) {
      console.log(list);
      await Promise.all(
        list?.map(async (item) => {
          await prisma.customer.update({
            where: {
              id: item.id,
            },
            data: {
              order: item.order,
            },
          });
        })
      );
    }
    return { data: customer };
  }

  async softDelete(id: string): Promise<Meta<Customer>> {
    const customer = await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { data: customer };
  }

  async destroy(id: string): Promise<Meta<Customer>> {
    const customer = await prisma.customer.delete({
      where: { id },
    });
    return { data: customer };
  }
  async searchByName(name: string): Promise<Meta<Customer[]>> {
    const customers = await prisma.customer.findMany({
      where: {
        name: { contains: name, mode: "insensitive" },
        deletedAt: null,
      },
      include: {
        customersInsurance: true,
        protocol: true,
      },
    });
    return { data: customers };
  }
}
