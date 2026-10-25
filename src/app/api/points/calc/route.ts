import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { awardCapped } from "@/lib/points";
import { handleApiError } from "@/lib/api";

const schema = z.object({
  kind: z.enum(["gas", "pc"]),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await request.json());
    const awarded = await awardCapped(
      user.id,
      8,
      body.kind === "gas" ? "Used gas calculator" : "Used PC calculator",
      3,
    );
    return NextResponse.json({ awarded });
  } catch (error) {
    return handleApiError(error);
  }
}
