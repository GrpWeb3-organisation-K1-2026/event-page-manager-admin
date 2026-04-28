export interface SessionFilters {
  eventId?: number;
  roomId?: number;
  page?: number;
  limit?: number;
}

export interface CreateSessionDTO {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  roomId: number;
  eventId: number;
  speakerId?: number;
}

export type UpdateSessionDTO = Partial<CreateSessionDTO>;

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
