export interface RoomFilters {
  page?: number;
  limit?: number;
}

<<<<<<<< HEAD:event-page-manager/app/lib/types/session.types.ts
export interface CreateSessionDTO {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  roomId: number;
  eventId: number;
  speakerIds?: number[];
}

export interface UpdateSessionDTO {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  roomId?: number;
  eventId?: number;
  speakerIds?: number[];
}
========
export interface CreateRoomDTO {
  name: string;
}

export type UpdateRoomDTO = Partial<CreateRoomDTO>;
>>>>>>>> feature-branches-room-back:event-page-manager/app/lib/types/room.types.ts

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