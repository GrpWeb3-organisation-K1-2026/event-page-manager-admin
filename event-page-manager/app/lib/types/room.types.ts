export interface RoomFilters {
  page?: number;
  limit?: number;
}

export interface CreateRoomDTO {
  name: string;
}

export type UpdateRoomDTO = Partial<CreateRoomDTO>;

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