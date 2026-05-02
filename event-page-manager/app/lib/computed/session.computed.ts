import { SESSION_INCLUDE } from "../repository/session.repository";
import { Prisma } from "@/app/generated/prisma";

type SessionWithIncludes = Prisma.SessionGetPayload<{
  include: typeof SESSION_INCLUDE;
}>;

export interface SessionLiveFields {
  isLive: boolean;     
  isUpcoming: boolean;  
  isEnded: boolean;    
  durationMinutes: number; 
  remainingMinutes: number | null; 
  progressPercent: number | null;  
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