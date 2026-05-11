<<<<<<< HEAD
import { NextRequest, NextResponse } from "next/server";
import { sessionService } from "@/app/lib/service/session.service";
import { handleError } from "@/app/lib/service.http";
import type {
  CreateSessionDTO,
  SessionFilters,
} from "@/app/lib/types/session.types";

/**
 * GET /api/sessions
 * Query params: eventId, roomId, page, limit
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const filters: SessionFilters = {
    eventId: searchParams.get("eventId")
      ? Number(searchParams.get("eventId"))
      : undefined,
    roomId: searchParams.get("roomId")
      ? Number(searchParams.get("roomId"))
      : undefined,
    page: searchParams.get("page")
      ? Number(searchParams.get("page"))
      : undefined,
    limit: searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : undefined,
  };

  try {
    const result = await sessionService.getAll(filters);
    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/sessions
 * Body: CreateSessionDTO
 */
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
=======
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        room: true,
        speakers: { include: { speaker: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json({ data: sessions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
>>>>>>> develop
