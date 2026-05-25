import { NextRequest, NextResponse } from "next/server";
import { roomService } from "@/app/lib/service/room.service";
import { handleRoomError } from "@/app/lib/http/room.http";
import type { CreateRoomDTO } from "@/app/lib/types/room.types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  try {
    const result = await roomService.getAll({
      page:  searchParams.get("page")  ? parseInt(searchParams.get("page")!,  10) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return handleRoomError(err);
  }
}

export async function POST(request: NextRequest) {
  let body: CreateRoomDTO;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const room = await roomService.create(body);
    return NextResponse.json({ data: room }, { status: 201 });
  } catch (err) {
    return handleRoomError(err);
  }
}