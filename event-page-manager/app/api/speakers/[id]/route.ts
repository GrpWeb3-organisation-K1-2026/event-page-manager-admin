import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

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

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const speaker = await prisma.speaker.findUnique({
      where: { id: Number(id) },
      include: speakerInclude,
    });
    if (!speaker) {
      return NextResponse.json({ error: "Speaker not found" }, { status: 404 });
    }
    return NextResponse.json({ data: formatSpeaker(speaker) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const authSession = await auth();
  if (!authSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { fullName, biography, photo, links, sessionIds } = body;

    const existing = await prisma.speaker.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      return NextResponse.json({ error: "Speaker not found" }, { status: 404 });
    }

    if (sessionIds !== undefined && !Array.isArray(sessionIds)) {
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

    const updated = await prisma.$transaction(async (tx) => {
      await tx.speaker.update({
        where: { id: Number(id) },
        data: {
          ...(fullName !== undefined && { fullName }),
          ...(biography !== undefined && { biography }),
          ...(photo !== undefined && { photo }),
          ...(links !== undefined && { links }),
        },
      });

      if (sessionIds !== undefined) {
        await tx.sessionSpeaker.deleteMany({
          where: { speakerId: Number(id) },
        });
        if (sessionIds.length > 0) {
          await tx.sessionSpeaker.createMany({
            data: sessionIds.map((sessionId: number) => ({
              sessionId,
              speakerId: Number(id),
            })),
          });
        }
      }

      return tx.speaker.findUnique({
        where: { id: Number(id) },
        include: speakerInclude,
      });
    });

    return NextResponse.json({ data: formatSpeaker(updated) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const authSession = await auth();
  if (!authSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const force = new URL(request.url).searchParams.get("force") === "true";

    const speaker = await prisma.speaker.findUnique({
      where: { id: Number(id) },
      include: {
        sessions: {
          include: {
            session: { select: { startDate: true, endDate: true, title: true } },
          },
        },
      },
    });

    if (!speaker) {
      return NextResponse.json({ error: "Speaker not found" }, { status: 404 });
    }

    if (!force) {
      const now = new Date();
      const activeSessions = speaker.sessions.filter(
        (ss) => now <= ss.session.endDate
      );
      if (activeSessions.length > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete: ${activeSessions.length} active or upcoming session(s) linked. Use ?force=true to override.`,
          },
          { status: 409 }
        );
      }
    }

    await prisma.speaker.delete({ where: { id: Number(id) } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}