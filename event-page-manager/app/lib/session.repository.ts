import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/app/generated/prisma";
import type { SessionFilters, CreateSessionDTO, UpdateSessionDTO } from "./session.types";

export const SESSION_INCLUDE = {
  room: true,
  event: { select: { id: true, title: true } },
  speaker: { select: { id: true, fullName: true, photo: true } },
  _count: { select: { questions: true } },
} satisfies Prisma.SessionInclude;

export const sessionRepository = {

  async findMany(filters: SessionFilters) {
    const { eventId, roomId, page = 1, limit = 20 } = filters;

    const where: Prisma.SessionWhereInput = {
      ...(eventId && { eventId }),
      ...(roomId  && { roomId }),
    };

    const [total, rows] = await prisma.$transaction([
      prisma.session.count({ where }),
      prisma.session.findMany({
        where,
        include: SESSION_INCLUDE,
        orderBy: { startDate: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { rows, total, page, limit };
  },

  async findById(id: number) {
    return prisma.session.findUnique({
      where: { id },
      include: SESSION_INCLUDE,
    });
  },

  async create(data: CreateSessionDTO) {
    const { speakerId, startDate, endDate, ...rest } = data;
    return prisma.session.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        ...(speakerId != null && { speakerId }),
      },
      include: SESSION_INCLUDE,
    });
  },

  async update(id: number, data: UpdateSessionDTO) {
    const { speakerId, roomId, startDate, endDate, ...rest } = data;
    return prisma.session.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate   && { endDate:   new Date(endDate) }),
        ...(roomId    != null && { room:    { connect: { id: roomId } } }),
        ...(speakerId != null && { speaker: { connect: { id: speakerId } } }),
      },
      include: SESSION_INCLUDE,
    });
  },

  async delete(id: number) {
    return prisma.session.delete({ where: { id } });
  },
};