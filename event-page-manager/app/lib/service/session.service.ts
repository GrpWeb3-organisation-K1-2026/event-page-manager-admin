import { Prisma } from "@/app/generated/prisma";
import { sessionRepository } from "../repository/session.repository";
import { withLiveFields, withLiveFieldsMany } from "../computed/session.computed";
import {
  NotFoundError,
  ValidationError,
  type SessionFilters,
  type CreateSessionDTO,
  type UpdateSessionDTO,
} from "../types/session.types";

export const sessionService = {
  async getAll(filters: SessionFilters) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const { rows, total } = await sessionRepository.findMany({
      ...filters,
      page,
      limit,
    });
    return {
      data: withLiveFieldsMany(rows),
      meta: { total, page, limit, pageCount: Math.ceil(total / limit) },
    };
  },

  async getById(id: number) {
    const session = await sessionRepository.findById(id);
    if (!session) throw new NotFoundError("Session", id);
    return withLiveFields(session);
  },

  async create(dto: CreateSessionDTO) {
    validateCreateDTO(dto);
    try {
      const session = await sessionRepository.create(dto);
      return withLiveFields(session);
    } catch (err) {
      handlePrismaError(err);
      // handlePrismaError always throws, but TypeScript needs this:
      throw err;
    }
  },

  async update(id: number, dto: UpdateSessionDTO) {
    // Fix: only validate if BOTH dates are provided, or validate independently
    if (dto.startDate && dto.endDate) {
      validateDates(dto.startDate, dto.endDate);
    } else if (dto.startDate) {
      const start = new Date(dto.startDate);
      if (isNaN(start.getTime()))
        throw new ValidationError("startDate must be a valid ISO date");
    } else if (dto.endDate) {
      const end = new Date(dto.endDate);
      if (isNaN(end.getTime()))
        throw new ValidationError("endDate must be a valid ISO date");
    }

    try {
      const session = await sessionRepository.update(id, dto);
      return withLiveFields(session);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError("Session", id);
      }
      handlePrismaError(err);
      throw err;
    }
  },

  async delete(id: number) {
    try {
      await sessionRepository.delete(id);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError("Session", id);
      }
      throw err;
    }
  },
};

function validateCreateDTO(dto: CreateSessionDTO) {
  const required = [
    "title",
    "description",
    "startDate",
    "endDate",
    "capacity",
    "roomId",
    "eventId",
  ] as const;

  const missing = required.filter((k) => dto[k] == null);
  if (missing.length)
    throw new ValidationError(`Missing fields: ${missing.join(", ")}`);

  if (typeof dto.title !== "string" || dto.title.trim() === "")
    throw new ValidationError("title must be a non-empty string");

  if (typeof dto.capacity !== "number" || dto.capacity < 1)
    throw new ValidationError("capacity must be a positive integer");

  if (dto.speakerIds !== undefined) {
    if (!Array.isArray(dto.speakerIds))
      throw new ValidationError("speakerIds must be an array of numbers");
    if (dto.speakerIds.some((id) => typeof id !== "number"))
      throw new ValidationError("speakerIds must be an array of numbers");
  }

  validateDates(dto.startDate, dto.endDate);
}

function validateDates(startDate?: string, endDate?: string) {
  const start = new Date(startDate ?? "");
  const end = new Date(endDate ?? "");
  if (isNaN(start.getTime()) || isNaN(end.getTime()))
    throw new ValidationError(
      "startDate and endDate must be valid ISO dates"
    );
  if (end <= start)
    throw new ValidationError("endDate must be after startDate");
}

function handlePrismaError(err: unknown): never {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2003"
  )
    throw new ValidationError(
      "roomId, eventId or speakerId does not exist"
    );
  throw err;
}