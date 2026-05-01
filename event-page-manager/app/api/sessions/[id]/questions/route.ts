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