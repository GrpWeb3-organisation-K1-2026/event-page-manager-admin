import { NextRequest, NextResponse } from "next/server";
import { speakerService } from "@/app/lib/service/speaker.service";
import { handleSpeakerError } from "@/app/lib/http/speaker.http";
import type { UpdateSpeakerDTO } from "@/app/lib/types/speaker.types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const speaker = await speakerService.getById(parseInt(id, 10));
    return NextResponse.json({ data: speaker });
  } catch (err) {
    return handleSpeakerError(err);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  let body: UpdateSpeakerDTO;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const speaker = await speakerService.update(parseInt(id, 10), body);
    return NextResponse.json({ data: speaker });
  } catch (err) {
    return handleSpeakerError(err);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const force = new URL(request.url).searchParams.get("force") === "true";

  try {
    await speakerService.delete(parseInt(id, 10), force);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleSpeakerError(err);
  }
}