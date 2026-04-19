import { PrismaClient } from "../generated/prisma";

const gloabalForPrisma = globalThis as unknown as {
    prisma : PrismaClient | undefined
};

export const prisma = gloabalForPrisma.prisma ?? new PrismaClient({log:["query"]})

if (process.env.NODE_ENV !== "production") {
    gloabalForPrisma.prisma = prisma;
}