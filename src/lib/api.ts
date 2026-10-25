import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Invalid input", 400);
  }
  if (error instanceof Error && "status" in error) {
    const status = Number((error as Error & { status?: number }).status) || 500;
    return jsonError(error.message, status);
  }
  return jsonError("Something went wrong", 500);
}
