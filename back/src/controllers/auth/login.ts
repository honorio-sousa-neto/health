import { UserRepository } from "../../repositories/user";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { signSession } from "../../security/auth";
import { z } from "zod";

const dummyHash = bcrypt.hashSync("invalid-account-password", 10);
export class LoginController {
  constructor(private readonly userRespository: UserRepository) {}
  generateToken(user: User): string {
    return signSession(user);
  }
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
  async handle(form: { username: string; password: string }): Promise<any> {
    try {
      const { username, password } = z.object({ username: z.string().min(1).max(150), password: z.string().min(1).max(256) }).parse(form);
      const user = await this.userRespository.show({
        userWhereUniqueInput: { username },
      });
      const isValidPassword = await bcrypt.compare(password, user?.password ?? dummyHash);
      if (!user || user.deletedAt || !isValidPassword) {
        return { message: "Credenciais inválidas", success: false, statusCode: 401 };
      }

      const token = this.generateToken(user);
      const {
        password: savedPassword,
        createdAt,
        deletedAt,
        updatedAt,
        ...spread
      } = user;
      return {
        data: { ...spread, token },
        message: "Login feito com sucesso",
        success: true,
        statusCode: 200,
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Não foi possível iniciar sessão",
        statusCode: error instanceof z.ZodError ? 400 : 500,
      };
    }
  }
}
