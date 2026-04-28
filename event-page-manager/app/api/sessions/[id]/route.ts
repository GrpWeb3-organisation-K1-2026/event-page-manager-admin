import { NextRequest, NextResponse } from "next/server";
import { sessionService } from "@/app/lib/session.service";
import { handleError } from "@/app/lib/http";
import type { UpdateSessionDTO } from "@/app/lib/session.types";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/sessions/:id
 * Retourne la session avec les champs calculés live :
 *   - isLive          : session en cours maintenant
 *   - isUpcoming      : pas encore commencée
 *   - isEnded         : terminée
 *   - durationMinutes : durée totale en minutes
 *   - remainingMinutes: minutes restantes (null si pas en cours)
 *   - progressPercent : % d'avancement (null si pas en cours)
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const session = await sessionService.getById(parseInt(id, 10));
    return NextResponse.json({ data: session });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PATCH /api/sessions/:id
 * Met à jour partiellement une session.
 * La réponse inclut également les champs calculés live.
 */
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

/**
 * DELETE /api/sessions/:id
 * Supprime une session. Retourne 204 sans contenu.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await sessionService.delete(parseInt(id, 10));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
