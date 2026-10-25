import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(1, "Name your habit").max(40),
});

export async function GET() {
  try {
    const user = await requireUser();
    const habits = await prisma.habit.findMany({
      where: { userId: user.id },
      include: { logs: { orderBy: { date: "desc" }, take: 40 } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ habits });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await request.json());
    const habit = await prisma.habit.create({
      data: { userId: user.id, name: body.name },
      include: { logs: true },
    });
    return NextResponse.json({ habit });
  } catch (error) {
    return handleApiError(error);
  }
}
