import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            include: {
                _count: { select: { sessions: true } },
            },
            orderBy: { startDate: "asc" },
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, startDate, endDate, place } = body;

        if (!title || !description || !startDate || !endDate || !place) {
            return NextResponse.json(
                {
                    error: "All fields are required",
                },
                { status: 400 }
            );
        }

        const event = await prisma.event.create({
            data: {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                place,
            },
        });

        return NextResponse.json(event, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}