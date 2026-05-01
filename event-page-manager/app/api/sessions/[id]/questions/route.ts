import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const sessionId = parseInt(id, 10);

  if (isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const questions = await prisma.question.findMany({
    where: { sessionId },
    orderBy: { upvotes: "desc" },
  });

  return NextResponse.json({ data: questions });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const sessionId = parseInt(id, 10);

  if (isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const now = new Date();
  const isLive = now >= session.startDate && now <= session.endDate;
  if (!isLive) {
    return NextResponse.json(
      { error: "Questions are only allowed during a live session" },
      { status: 403 }
    );
  }

  let body: { content: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { content, name } = body;

  if (!content || typeof content !== "string" || content.trim() === "") {
    return NextResponse.json(
      { error: "content is required and must be a non-empty string" },
      { status: 422 }
    );
  }

  const question = await prisma.question.create({
    data: {
      content: content.trim(),
      name: name ?? null,
      sessionId,
    },
  });

  return NextResponse.json({ data: question }, { status: 201 });
}