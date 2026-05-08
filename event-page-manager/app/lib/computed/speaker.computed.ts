export interface SessionStatusFields {
  isLive: boolean;
  isUpcoming: boolean;
  isEnded: boolean;
}

export function computeSessionStatus(
  startDate: Date,
  endDate: Date
): SessionStatusFields {
  const now = new Date();
  return {
    isLive:     now >= startDate && now <= endDate,
    isUpcoming: now < startDate,
    isEnded:    now > endDate,
  };
}

export function formatSpeakerWithStatus(speaker: any) {
  return {
    ...speaker,
    sessions: speaker.sessions.map((ss: any) => {
      const s = ss.session;
      return {
        ...s,
        ...computeSessionStatus(new Date(s.startDate), new Date(s.endDate)),
      };
    }),
  };
}

export function formatSpeakersWithStatus(speakers: any[]) {
  return speakers.map(formatSpeakerWithStatus);
}