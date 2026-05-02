import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/lib/auth";

const speakerInclude = {
  sessions: {
    include: {
      session: {
        include: {
          room: true,
          event: { select: { id: true, title: true } },
        },
      },
    },
  },
} as const;

function formatSpeaker(sp: any) {
  const now = new Date();
  return {
    ...sp,
    sessions: sp.sessions.map((ss: any) => {
      const s = ss.session;
      return {
        ...s,
        status:
          now >= s.startDate && now <= s.endDate ? "live"
          : now < s.startDate ? "upcoming"
          : "ended",
      };
    }),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sessionId = searchParams.get("sessionId");

  try {
    const speakers = await prisma.speaker.findMany({
      where: sessionId
        ? { sessions: { some: { sessionId: Number(sessionId) } } }
        : undefined,
      include: speakerInclude,
      orderBy: { fullName: "asc" },
    });
    return NextResponse.json({ data: speakers.map(formatSpeaker) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authSession = await auth();
  if (!authSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fullName, biography, photo, links, sessionIds } = body;

    if (!fullName) {
      return NextResponse.json(
        { error: "fullName is required" },
        { status: 400 }
      );
    }

    if (sessionIds && !Array.isArray(sessionIds)) {
      return NextResponse.json(
        { error: "sessionIds must be an array" },
        { status: 400 }
      );
    }

    if (sessionIds && sessionIds.length > 0) {
      const found = await prisma.session.findMany({
        where: { id: { in: sessionIds } },
        select: { id: true },
      });
      if (found.length !== sessionIds.length) {
        return NextResponse.json(
          { error: "One or more sessions not found" },
          { status: 404 }
        );
      }
    }

    const speaker = await prisma.speaker.create({
      data: {
        fullName,
        biography,
        photo,
        links,
        sessions: sessionIds && sessionIds.length > 0
          ? { create: sessionIds.map((sessionId: number) => ({ sessionId })) }
          : undefined,
      },
      include: speakerInclude,
    });

    return NextResponse.json({ data: formatSpeaker(speaker) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}