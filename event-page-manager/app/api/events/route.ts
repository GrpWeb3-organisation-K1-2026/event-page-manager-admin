import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id: Number(id) },
      include: {
        sessions: {
          include: {
            room: true,
            speakers: {
              include: {
                speaker: { select: { id: true, fullName: true, photo: true } },
              },
            },
            _count: { select: { questions: true } },
          },
          orderBy: { startDate: "asc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ data: event });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, startDate, endDate, place } = body;

    const existing = await prisma.event.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        ...(title       !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(startDate   !== undefined && { startDate: new Date(startDate) }),
        ...(endDate     !== undefined && { endDate:   new Date(endDate) }),
        ...(place       !== undefined && { place }),
      },
    });

    return NextResponse.json({ data: event });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await prisma.event.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { sessions: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (existing._count.sessions > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete this event: ${existing._count.sessions} session(s) are associated with it`,
        },
        { status: 409 }
      );
    }

    await prisma.event.delete({ where: { id: Number(id) } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}