import { Company, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateCompany,
  TUpdateCompany,
} from "../../validator/company.validator";
export class CompanyRepository {
  async create(createCompany: TCreateCompany): Promise<Company | null> {
    return prisma.company.create({ data: createCompany });
  }
  async update(
    companyWhereUniqueInput: Prisma.CompanyWhereUniqueInput,
    updateCompany: TUpdateCompany
  ): Promise<Company | null> {
    return prisma.company.update({
      where: companyWhereUniqueInput,
      data: updateCompany,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.CompanyWhereUniqueInput;
    where?: Prisma.CompanyWhereInput;
    orderBy?: Prisma.CompanyOrderByWithAggregationInput;
    include?: Prisma.CompanyInclude;
  }): Promise<Company[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.company.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    companyWhereUniqueInput: Prisma.CompanyWhereUniqueInput;
    include?: Prisma.CompanyInclude;
  }): Promise<Company | null> {
    const { companyWhereUniqueInput, include } = params;
    return prisma.company.findUnique({
      where: companyWhereUniqueInput,
      include,
    });
  }
  async destroy(
    companyWhereUniqueInput: Prisma.CompanyWhereUniqueInput
  ): Promise<Company | null> {
    return prisma.company.delete({ where: companyWhereUniqueInput });
  }
  async count(
    companyWhereUniqueInput?: Prisma.CompanyWhereInput
  ): Promise<number> {
    return prisma.company.count({ where: companyWhereUniqueInput });
  }
}
