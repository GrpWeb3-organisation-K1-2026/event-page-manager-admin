import { NextResponse } from "next/server";
import { NotFoundError, ValidationError } from "./types/session.types";

export function handleError(err: unknown): NextResponse {
    if (err instanceof NotFoundError) {
        return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof ValidationError) {
        return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}