import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/app/generated/prisma";
import type { RoomFilters, CreateRoomDTO, UpdateRoomDTO } from "../lib/room.types";

export const ROOM_INCLUDE = {
  _count: { select: { sessions: true } },
} satisfies Prisma.RoomInclude;

export const roomRepository = {

  async findMany(filters: RoomFilters) {
    const { page = 1, limit = 20 } = filters;

    const [total, rows] = await prisma.$transaction([
      prisma.room.count(),
      prisma.room.findMany({
        include: ROOM_INCLUDE,
        orderBy: { id: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { rows, total, page, limit };
  },

  async findById(id: number) {
    return prisma.room.findUnique({
      where: { id },
      include: ROOM_INCLUDE,
    });
  },

  async create(data: CreateRoomDTO) {
    return prisma.room.create({
      data: {
        name: data.name,
      },
      include: ROOM_INCLUDE,
    });
  },

  async update(id: number, data: UpdateRoomDTO) {
    const updateData: Prisma.RoomUpdateInput = {};

    if (data.name != null) updateData.name = data.name;

    return prisma.room.update({
      where: { id },
      data: updateData,
      include: ROOM_INCLUDE,
    });
  },

  async delete(id: number) {
    return prisma.room.delete({ where: { id } });
  },

  async countSessions(id: number) {
    return prisma.session.count({ where: { roomId: id } });
  },
};