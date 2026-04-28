import { NextRequest, NextResponse } from "next/server";
import { sessionService } from "@/app/lib/session.service";
import { handleError } from "@/app/lib/http";
import type { CreateSessionDTO } from "@/app/lib/session.types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  try {
    const result = await sessionService.getAll({
      eventId: searchParams.get("eventId") ? parseInt(searchParams.get("eventId")!, 10) : undefined,
      roomId:  searchParams.get("roomId")  ? parseInt(searchParams.get("roomId")!,  10) : undefined,
      page:    searchParams.get("page")    ? parseInt(searchParams.get("page")!,    10) : undefined,
      limit:   searchParams.get("limit")   ? parseInt(searchParams.get("limit")!,   10) : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  let body: CreateSessionDTO;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const session = await sessionService.create(body);
    return NextResponse.json({ data: session }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
