import { NextRequest, NextResponse } from "next/server";
import { sessionService } from "@/app/lib/session.service";
import { handleError } from "@/app/lib/http";
import type { UpdateSessionDTO } from "@/app/lib/session.types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const session = await sessionService.getById(parseInt(id, 10));
    return NextResponse.json({ data: session });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  let body: UpdateSessionDTO;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const session = await sessionService.update(parseInt(id, 10), body);
    return NextResponse.json({ data: session });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await sessionService.delete(parseInt(id, 10));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
