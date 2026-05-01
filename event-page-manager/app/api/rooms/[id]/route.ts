import { NextRequest, NextResponse } from "next/server";
import { roomService } from "@/app/lib/room.service";
import { handleRoomError } from "@/app/lib/room.http";
import type { UpdateRoomDTO } from "@/app/lib/room.types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const room = await roomService.getById(parseInt(id, 10));
    return NextResponse.json({ data: room });
  } catch (err) {
    return handleRoomError(err);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  let body: UpdateRoomDTO;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const room = await roomService.update(parseInt(id, 10), body);
    return NextResponse.json({ data: room });
  } catch (err) {
    return handleRoomError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await roomService.delete(parseInt(id, 10));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleRoomError(err);
  }
}