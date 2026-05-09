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