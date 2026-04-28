import { SESSION_INCLUDE } from "./session.repository";
import { Prisma } from "@/app/generated/prisma";

// Type d'une session retournée par Prisma avec les includes
type SessionWithIncludes = Prisma.SessionGetPayload<{
  include: typeof SESSION_INCLUDE;
}>;

export interface SessionLiveFields {
  isLive: boolean;       // session en cours maintenant
  isUpcoming: boolean;   // pas encore commencée
  isEnded: boolean;      // terminée
  durationMinutes: number; // durée totale en minutes
  remainingMinutes: number | null; // minutes restantes (null si pas en cours)
  progressPercent: number | null;  // % d'avancement (null si pas en cours)
}

export function computeLiveFields(session: SessionWithIncludes): SessionLiveFields {
  const now        = new Date();
  const start      = new Date(session.startDate);
  const end        = new Date(session.endDate);

  const isLive     = now >= start && now <= end;
  const isUpcoming = now < start;
  const isEnded    = now > end;

  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60_000);

  const remainingMinutes = isLive
    ? Math.round((end.getTime() - now.getTime()) / 60_000)
    : null;

  const progressPercent = isLive
    ? Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100)
    : null;

  return {
    isLive,
    isUpcoming,
    isEnded,
    durationMinutes,
    remainingMinutes,
    progressPercent,
  };
}

export function withLiveFields(session: SessionWithIncludes) {
  return {
    ...session,
    ...computeLiveFields(session),
  };
}

export function withLiveFieldsMany(sessions: SessionWithIncludes[]) {
  return sessions.map(withLiveFields);
}
