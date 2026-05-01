import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const speakerSchema = z.object({
  fullName: z.string().min(2).max(100),
  biography: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  externalLinks: z.record(z.string().url()).optional(),
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

export async function GET(_: NextRequest, { params }: Params) {
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

export async function PATCH(req: NextRequest, { params }: Params) {
  const authSession = await auth();
  if (!authSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = speakerSchema.partial().extend({
      sessionIds: z.array(z.number().int()).optional(),
    }).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 422 });
    }

    const { sessionIds, ...speakerData } = parsed.data;

    const existing = await prisma.speaker.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Speaker not found" }, { status: 404 });
    }

    if (sessionIds !== undefined && sessionIds.length > 0) {
      const found = await prisma.session.findMany({
        where: { id: { in: sessionIds } },
        select: { id: true },
      });
      if (found.length !== sessionIds.length) {
        return NextResponse.json({ error: "One or more sessions not found" }, { status: 404 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.speaker.update({
        where: { id: Number(id) },
        data: speakerData,
      });

      if (sessionIds !== undefined) {
        await tx.sessionSpeaker.deleteMany({ where: { speakerId: Number(id) } });
        if (sessionIds.length > 0) {
          await tx.sessionSpeaker.createMany({
            data: sessionIds.map((sessionId) => ({
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

export async function DELETE(req: NextRequest, { params }: Params) {
  const authSession = await auth();
  if (!authSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const force = new URL(req.url).searchParams.get("force") === "true";

    const speaker = await prisma.speaker.findUnique({
      where: { id: Number(id) },
      include: {
        sessions: {
          include: {
            session: { select: { startTime: true, endTime: true, title: true } },
          },
        },
      },
    });

    if (!speaker) {
      return NextResponse.json({ error: "Speaker not found" }, { status: 404 });
    }

    if (!force) {
      const now = new Date();
      const activeSessions = speaker.sessions.filter((ss) => now <= ss.session.endTime);
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