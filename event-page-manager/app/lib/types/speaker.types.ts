export interface SpeakerFilters {
  sessionId?: number;
  page?: number;
  limit?: number;
}

export interface CreateSpeakerDTO {
  fullName: string;
  biography: string;
  photo?: string;
  links?: Record<string, string>;
  sessionIds?: number[];
}

export type UpdateSpeakerDTO = Partial<CreateSpeakerDTO>;

export class NotFoundError extends Error {
  constructor(resource: string, id: number) {
    super(`${resource} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
