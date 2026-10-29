import { Prisma, User } from "@prisma/client";
import { UserRepository } from "../../repositories/user";
import {
  TCreateUser,
  TUpdateUser,
  createUser,
  updateUser,
} from "../../validator/user.validator";
import { LoginController } from "../auth/login";
import { generateUsernameAndPassoword } from "../../utils/user";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type PublicUser = Omit<User, "password">;
function publicUser(data: User): PublicUser;
function publicUser(data: User | null): PublicUser | null;
function publicUser(data: User[]): PublicUser[];
function publicUser(data: User | User[] | null): PublicUser | PublicUser[] | null {
  if (Array.isArray(data)) return data.map((user) => publicUser(user));
  if (!data) return null;
  const { password, ...safe } = data;
  return safe;
}
export class UserController {
  constructor(private readonly repository: UserRepository) {}
  private readonly authController = new LoginController(this.repository);
  async index(params: {
    search: string;
    perPage: string;
    page: string;
  }): Promise<{
    data: PublicUser[];
    meta: {
      totalPages: number;
      total: number;
      search?: string;
      perPage: number;
      page: number;
    };
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { page, perPage, search } = params;
    const data = await this.repository.index({
      take: Math.min(100, Math.max(1, Number(perPage) || 25)),
      skip: (Math.max(1, Number(page) || 1) - 1) * Math.min(100, Math.max(1, Number(perPage) || 25)),
      where: {
        OR: [
          {
            name: search
              ? { contains: search, mode: "insensitive" }
              : { contains: "", mode: "insensitive" },
          },
        ],
      },
    });
    const total = await this.repository.count({
      name: search
        ? { contains: search, mode: "insensitive" }
        : { contains: "", mode: "insensitive" },
    });

    return {
      data: publicUser(data),
      meta: {
        total,
        totalPages: Math.ceil(total / Number(perPage)),
        search,
        page: Number(page),
        perPage: Number(perPage),
      },
      statusCode: 200,
      message: "OK",
      success: true,
    };
  }

  async show(id: string): Promise<{
    data: PublicUser | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const data = await this.repository.show({
      userWhereUniqueInput: { id },
    });
    return {
      data: publicUser(data),
      message: data ? "Sucesso" : "Não encontrado",
      statusCode: data ? 200 : 404,
      success: true,
    };
  }

  async create(createData: TCreateUser): Promise<{
    data: PublicUser | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const { password, name, ...payload } = createUser.parse(createData);
    const { password: hashedPassword, username } =
      await generateUsernameAndPassoword(createData.name, createData.password);
    try {
      const data = await this.repository.create({
        password: hashedPassword,
        username,
        name,
        ...payload,
      });
      return {
        data: publicUser(data),
        message: data ? "Sucesso" : "Sem sucesso",
        statusCode: data ? 201 : 400,
        success: true,
      };
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        return {
          data: null,
          statusCode: 500,
          message: error.message,
          success: false,
        };
      else {
        return {
          data: null,
          statusCode: 500,
          message: "NOT OK",
          success: false,
        };
      }
    }
  }

  async update(
    id: string,
    updateData: TUpdateUser
  ): Promise<{
    data: PublicUser | null;
    message?: string;
    success?: boolean;
    statusCode: number;
  }> {
    const payload = updateUser.parse(updateData);
    const data = await this.repository.update({ id }, payload);
    return {
      data: publicUser(data),
      message: data ? "Sucesso" : "Sem sucesso",
      statusCode: data ? 201 : 400,
      success: true,
    };
  }
}
