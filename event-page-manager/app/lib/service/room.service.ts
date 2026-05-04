import { Prisma } from "@/app/generated/prisma";
import { roomRepository } from "../repository/room.repository";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  type RoomFilters,
  type CreateRoomDTO,
  type UpdateRoomDTO,
} from "../types/room.types";

export const roomService = {

  async getAll(filters: RoomFilters) {
    const page  = Math.max(1,   filters.page  ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const { rows, total } = await roomRepository.findMany({ ...filters, page, limit });
    return {
      data: rows,
      meta: { total, page, limit, pageCount: Math.ceil(total / limit) },
    };
  },

  async getById(id: number) {
    const room = await roomRepository.findById(id);
    if (!room) throw new NotFoundError("Room", id);
    return room;
  },

  async create(dto: CreateRoomDTO) {
    validateCreateDTO(dto);
    try {
      return await roomRepository.create(dto);
    } catch (err) {
      handlePrismaError(err);
    }
  },

  async update(id: number, dto: UpdateRoomDTO) {
    if (dto.name != null) validateName(dto.name);
    try {
      return await roomRepository.update(id, dto);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        throw new NotFoundError("Room", id);
      }
      handlePrismaError(err);
    }
  },

  async delete(id: number) {
    const room = await roomRepository.findById(id);
    if (!room) throw new NotFoundError("Room", id);

    if (room._count.sessions > 0) {
      throw new ConflictError(
        `Cannot delete this room: ${room._count.sessions} session(s) are associated with it`
      );
    }

    try {
      await roomRepository.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        throw new NotFoundError("Room", id);
      }
      throw err;
    }
  },
};

function validateCreateDTO(dto: CreateRoomDTO) {
  if (dto.name == null) throw new ValidationError("Missing field: name");
  validateName(dto.name);
}

function validateName(name: string) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new ValidationError("name must be a non-empty string");
  }
}

function handlePrismaError(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
    throw new ValidationError("Foreign key constraint failed");
  }
  throw err;
}