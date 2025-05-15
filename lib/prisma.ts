import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

export default prisma;

export * from "./generated/prisma";
