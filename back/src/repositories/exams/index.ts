import { Exam, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { TCreateExam, TUpdateExam } from "../../validator/exams.validator";
export class ExamRepository {
  async create(createExam: TCreateExam): Promise<Exam | null> {
    return prisma.exam.create({
      data: createExam,
    });
  }
  async update(
    examWhereUniqueInput: Prisma.ExamWhereUniqueInput,
    updateExam: TUpdateExam
  ): Promise<Exam | null> {
    return prisma.exam.update({
      where: examWhereUniqueInput,
      data: updateExam,
    });
  }
  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.ExamWhereUniqueInput;
    where?: Prisma.ExamWhereInput;
    orderBy?: Prisma.ExamOrderByWithAggregationInput;
    include?: Prisma.ExamInclude;
  }): Promise<Exam[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.exam.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    examWhereUniqueInput: Prisma.ExamWhereUniqueInput;
    include?: Prisma.ExamInclude;
  }): Promise<Exam | null> {
    const { examWhereUniqueInput, include } = params;
    return prisma.exam.findUnique({
      where: examWhereUniqueInput,
      include,
    });
  }
  async destroy(
    examWhereUniqueInput: Prisma.ExamWhereUniqueInput
  ): Promise<Exam | null> {
    return prisma.exam.delete({ where: examWhereUniqueInput });
  }
  async count(examWhereUniqueInput?: Prisma.ExamWhereInput): Promise<number> {
    return prisma.exam.count({ where: examWhereUniqueInput });
  }
}
