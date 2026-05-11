import { Prisma } from "@/app/generated/prisma";
import { speakerRepository } from "../repository/speaker.repository";
import { formatSpeakerWithStatus, formatSpeakersWithStatus } from "../computed/speaker.computed";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  type SpeakerFilters,
  type CreateSpeakerDTO,
  type UpdateSpeakerDTO,
} from "../types/speaker.types";

export const speakerService = {

  async getAll(filters: SpeakerFilters) {
    const page  = Math.max(1,   filters.page  ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const { rows, total } = await speakerRepository.findMany({ ...filters, page, limit });
    return {
      data: formatSpeakersWithStatus(rows),
      meta: { total, page, limit, pageCount: Math.ceil(total / limit) },
    };
  },

  async getById(id: number) {
    const speaker = await speakerRepository.findById(id);
    if (!speaker) throw new NotFoundError("Speaker", id);
    return formatSpeakerWithStatus(speaker);
  },

  async create(dto: CreateSpeakerDTO) {
    validateCreateDTO(dto);
    if (dto.sessionIds && dto.sessionIds.length > 0) {
      await validateSessionsExist(dto.sessionIds);
    }
    try {
      const speaker = await speakerRepository.create(dto);
      return formatSpeakerWithStatus(speaker);
    } catch (err) {
      handlePrismaError(err);
      // handlePrismaError always throws, but TypeScript needs this:
      throw err;
    }
  },

  async update(id: number, dto: UpdateSpeakerDTO) {
    validateUpdateDTO(dto);
    const existing = await speakerRepository.findById(id);
    if (!existing) throw new NotFoundError("Speaker", id);
    if (dto.sessionIds !== undefined && dto.sessionIds.length > 0) {
      await validateSessionsExist(dto.sessionIds);
    }
    try {
      const speaker = await speakerRepository.update(id, dto);
      return formatSpeakerWithStatus(speaker);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        throw new NotFoundError("Speaker", id);
      }
      handlePrismaError(err);
      throw err;
    }
  },

  async delete(id: number, force = false) {
    const speaker = await speakerRepository.findById(id);
    if (!speaker) throw new NotFoundError("Speaker", id);
    if (!force) {
      const activeSessions = await speakerRepository.findActiveSessions(id);
      if (activeSessions.length > 0) {
        throw new ConflictError(
          `Cannot delete: ${activeSessions.length} active or upcoming session(s) linked to this speaker. Use ?force=true to override.`
        );
      }
    }
    try {
      await speakerRepository.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        throw new NotFoundError("Speaker", id);
      }
      throw err;
    }
  },
};

function validateCreateDTO(dto: CreateSpeakerDTO) {
  if (!dto.fullName || typeof dto.fullName !== "string" || dto.fullName.trim() === "") {
    throw new ValidationError("fullName is required and must be a non-empty string");
  }
  if (!dto.biography || typeof dto.biography !== "string" || dto.biography.trim() === "") {
    throw new ValidationError("biography is required and must be a non-empty string");
  }
  validateSessionIds(dto.sessionIds);
}

function validateUpdateDTO(dto: UpdateSpeakerDTO) {
  if (dto.fullName !== undefined) {
    if (typeof dto.fullName !== "string" || dto.fullName.trim() === "") {
      throw new ValidationError("fullName must be a non-empty string");
    }
  }
  validateSessionIds(dto.sessionIds);
}

function validateSessionIds(sessionIds?: number[]) {
  if (sessionIds === undefined) return;
  if (!Array.isArray(sessionIds)) {
    throw new ValidationError("sessionIds must be an array of numbers");
  }
  if (sessionIds.some((id) => typeof id !== "number" || !Number.isInteger(id) || id < 1)) {
    throw new ValidationError("sessionIds must be an array of positive integers");
  }
}

async function validateSessionsExist(sessionIds: number[]) {
  const foundIds = await speakerRepository.validateSessionIds(sessionIds);
  if (foundIds.length !== sessionIds.length) {
    const missing = sessionIds.filter((id) => !foundIds.includes(id));
    throw new ValidationError(`Session(s) not found: ${missing.join(", ")}`);
  }
}

function handlePrismaError(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
    throw new ValidationError("Foreign key constraint failed: referenced record does not exist");
  }
  throw err;
}