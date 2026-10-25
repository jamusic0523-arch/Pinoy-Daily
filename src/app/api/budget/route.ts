import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentMonth } from "@/lib/money";
import { handleApiError } from "@/lib/api";

const schema = z.object({
  amount: z.number().min(0),
  month: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const month = currentMonth();
    const budget = await prisma.budget.findUnique({
      where: { userId_month: { userId: user.id, month } },
    });
    return NextResponse.json({ budget, month });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await request.json());
    const month = body.month ?? currentMonth();
    const budget = await prisma.budget.upsert({
      where: { userId_month: { userId: user.id, month } },
      update: { amount: body.amount },
      create: { userId: user.id, month, amount: body.amount },
    });
    return NextResponse.json({ budget });
  } catch (error) {
    return handleApiError(error);
  }
}
