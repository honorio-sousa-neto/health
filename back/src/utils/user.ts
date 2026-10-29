import { prisma } from "../database/prisma";
import bcrypt from "bcrypt";
function removeAccents(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function generateUsernameAndPassoword(
  name: string,
  password: string
): Promise<{ username: string; password: string }> {
  const nameClean = removeAccents(name).toLowerCase();
  const nameParts = nameClean.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  const base = firstName + "." + lastName;

  let username = base;
  let counter = 1;
  while (await prisma.user.findUnique({ where: { username } })) {
    username = base + counter;
    counter++;
  }

  const hashPassword = await bcrypt.hash(password, 10);
  return { username, password: hashPassword };
}
