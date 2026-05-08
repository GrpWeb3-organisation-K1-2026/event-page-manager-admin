import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/app/generated/prisma";
import type {
  SpeakerFilters,
  CreateSpeakerDTO,
  UpdateSpeakerDTO,
} from "../types/speaker.types";

export const SPEAKER_INCLUDE = {
  sessions: {
    include: {
      session: {
        include: {
          room: true,
          event: { select: { id: true, title: true } },
        },
      },
    },
  },
} satisfies Prisma.SpeakerInclude;

export const speakerRepository = {

  async findMany(filters: SpeakerFilters) {
    const { sessionId, page = 1, limit = 20 } = filters;

    const where: Prisma.SpeakerWhereInput = sessionId
      ? { sessions: { some: { sessionId } } }
      : {};

    const [total, rows] = await prisma.$transaction([
      prisma.speaker.count({ where }),
      prisma.speaker.findMany({
        where,
        include: SPEAKER_INCLUDE,
        orderBy: { fullName: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { rows, total, page, limit };
  },

  async findById(id: number) {
    return prisma.speaker.findUnique({
      where: { id },
      include: SPEAKER_INCLUDE,
    });
  },

  async create(data: CreateSpeakerDTO) {
    const { fullName, biography, photo, links, sessionIds } = data;

    return prisma.speaker.create({
      data: {
        fullName,
        biography,
        photo: photo ?? null,
        links: links ?? null,
        sessions:
          sessionIds && sessionIds.length > 0
            ? { create: sessionIds.map((sessionId) => ({ sessionId })) }
            : undefined,
      },
      include: SPEAKER_INCLUDE,
    });
  },

  async update(id: number, data: UpdateSpeakerDTO) {
    const { sessionIds, ...scalarFields } = data;
    return prisma.$transaction(async (tx) => {
      await tx.speaker.update({
        where: { id },
        data: {
          ...(scalarFields.fullName  !== undefined && { fullName:  scalarFields.fullName }),
          ...(scalarFields.biography !== undefined && { biography: scalarFields.biography }),
          ...(scalarFields.photo     !== undefined && { photo:     scalarFields.photo }),
          ...(scalarFields.links     !== undefined && { links:     scalarFields.links }),
        },
      });

      if (sessionIds !== undefined) {
        await tx.sessionSpeaker.deleteMany({ where: { speakerId: id } });
        if (sessionIds.length > 0) {
          await tx.sessionSpeaker.createMany({
            data: sessionIds.map((sessionId) => ({ sessionId, speakerId: id })),
          });
        }
      }

      return tx.speaker.findUnique({
        where: { id },
        include: SPEAKER_INCLUDE,
      });
    });
  },

  async delete(id: number) {
    return prisma.speaker.delete({ where: { id } });
  },

  async findActiveSessions(id: number) {
    const now = new Date();
    return prisma.sessionSpeaker.findMany({
      where: {
        speakerId: id,
        session: { endDate: { gte: now } },
      },
      include: {
        session: { select: { id: true, title: true, startDate: true, endDate: true } },
      },
    });
  },

  async validateSessionIds(sessionIds: number[]) {
    const found = await prisma.session.findMany({
      where: { id: { in: sessionIds } },
      select: { id: true },
    });
    return found.map((s) => s.id);
  },
};