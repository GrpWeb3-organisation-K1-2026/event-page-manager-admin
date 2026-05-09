import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { CreateQuestionSchema } from "@/app/lib/question.schemas";

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

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateQuestionSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 422 }
    );
  }

  const { content, name } = parsed.data;
  const question = await prisma.question.create({
    data: {
      content,
      name: name ?? null,
      sessionId,
    },
  });

  return NextResponse.json({ data: question }, { status: 201 });
}