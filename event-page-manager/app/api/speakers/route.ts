import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const speakerSchema = z.object({
  fullName: z.string().min(2).max(100),
  biography: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  externalLinks: z.record(z.string().url()).optional(),
});

const createSpeakerSchema = speakerSchema.extend({
  sessionIds: z.array(z.string().uuid()).optional().default([]),
});

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
          now >= s.startTime && now <= s.endTime ? "live"
          : now < s.startTime ? "upcoming"
          : "ended",
      };
    }),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    const speakers = await prisma.speaker.findMany({
      where: sessionId
        ? { sessions: { some: { sessionId } } }
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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSpeakerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 422 });
    }

    const { sessionIds, ...speakerData } = parsed.data;

    if (sessionIds.length > 0) {
      const found = await prisma.session.findMany({
        where: { id: { in: sessionIds } },
        select: { id: true },
      });
      if (found.length !== sessionIds.length) {
        return NextResponse.json({ error: "One or more sessions not found" }, { status: 404 });
      }
    }

    const speaker = await prisma.speaker.create({
      data: {
        ...speakerData,
        sessions: sessionIds.length > 0
          ? { create: sessionIds.map((sessionId) => ({ sessionId })) }
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