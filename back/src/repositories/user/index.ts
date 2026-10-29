import { User, Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { TCreateUser, TUpdateUser } from "../../validator/user.validator";
export class UserRepository {
  async create(
    createUser: TCreateUser & { username: string }
  ): Promise<User | null> {
    return prisma.user.create({ data: createUser });
  }
  async update(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    updateUser: TUpdateUser
  ): Promise<User | null> {
    return prisma.user.update({
      where: userWhereUniqueInput,
      data: updateUser,
    });
  }

  async index(params: {
    take?: number;
    skip?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithAggregationInput;
    include?: Prisma.UserInclude;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }
  async show(params: {
    userWhereUniqueInput: Prisma.UserWhereUniqueInput;
    include?: Prisma.UserInclude;
  }): Promise<User | null> {
    const { userWhereUniqueInput, include } = params;
    return prisma.user.findUnique({ where: userWhereUniqueInput, include });
  }
  async destroy(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput
  ): Promise<User | null> {
    return prisma.user.delete({ where: userWhereUniqueInput });
  }
  async count(userWhereUniqueInput?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where: userWhereUniqueInput });
  }
}
