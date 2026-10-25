import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { awardPoints } from "@/lib/points";
import { handleApiError, jsonError } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(40),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return jsonError("That email already has an account", 409);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: await bcrypt.hash(body.password, 10),
        lastLoginAt: new Date(),
      },
    });
    await awardPoints(user.id, 50, "Welcome bonus");
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
