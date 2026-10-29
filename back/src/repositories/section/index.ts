import { Section, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  TCreateSection,
  TUpdateSection,
} from "../../validator/section.validator";
export class SectionRepository {
  async create(createSection: TCreateSection): Promise<Section | null> {
    return prisma.section.create({ data: createSection });
  }
  async update(
    sectionWhereUniqueInput: Prisma.SectionWhereUniqueInput,
    updateSection: TUpdateSection
  ): Promise<Section | null> {
    return prisma.section.update({
      where: sectionWhereUniqueInput,
      data: updateSection,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.SectionWhereUniqueInput;
    where?: Prisma.SectionWhereInput;
    orderBy?: Prisma.SectionOrderByWithAggregationInput;
    include?: Prisma.SectionInclude;
  }): Promise<Section[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.section.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    sectionWhereUniqueInput: Prisma.SectionWhereUniqueInput;
    include?: Prisma.SectionInclude;
  }): Promise<Section | null> {
    const { sectionWhereUniqueInput, include } = params;
    return prisma.section.findUnique({
      where: sectionWhereUniqueInput,
      include,
    });
  }
  async destroy(
    sectionWhereUniqueInput: Prisma.SectionWhereUniqueInput
  ): Promise<Section | null> {
    return prisma.section.delete({ where: sectionWhereUniqueInput });
  }
  async count(
    sectionWhereUniqueInput?: Prisma.SectionWhereInput
  ): Promise<number> {
    return prisma.section.count({ where: sectionWhereUniqueInput });
  }
}
