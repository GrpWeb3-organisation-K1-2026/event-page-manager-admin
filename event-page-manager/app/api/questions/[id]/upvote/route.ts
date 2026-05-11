import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type Params = { params: Promise<{ id: string }> };
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const questionId = parseInt(id, 10);
  if (isNaN(questionId)) {
    return NextResponse.json({ error: "Invalid question id" }, { status: 400 });
  }
  const existing = await prisma.question.findUnique({ where: { id: questionId } });
  if (!existing) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const question = await prisma.question.update({
    where: { id: questionId },
    data: { upvotes: { increment: 1 } },
  });

  return NextResponse.json({ data: question });
} 