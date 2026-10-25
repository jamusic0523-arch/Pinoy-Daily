import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/points";
import { handleApiError } from "@/lib/api";

const schema = z.object({
  amount: z.number().positive("Amount must be more than 0"),
  category: z.string().min(1).max(40),
  note: z.string().max(120).optional().default(""),
});

export async function GET() {
  try {
    const user = await requireUser();
    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 80,
    });
    return NextResponse.json({ expenses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await request.json());
    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        amount: body.amount,
        category: body.category,
        note: body.note,
      },
    });
    await awardPoints(user.id, 5, "Logged an expense");
    return NextResponse.json({ expense });
  } catch (error) {
    return handleApiError(error);
  }
}
