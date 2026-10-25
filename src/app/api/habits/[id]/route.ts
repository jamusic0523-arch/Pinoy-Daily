import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/money";
import { awardPoints } from "@/lib/points";
import { handleApiError, jsonError } from "@/lib/api";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const habit = await prisma.habit.findFirst({
      where: { id, userId: user.id },
    });
    if (!habit) return jsonError("Habit not found", 404);
    const date = todayKey();
    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: id, date } },
    });
    if (existing) {
      await prisma.habitLog.delete({ where: { id: existing.id } });
      return NextResponse.json({ done: false });
    }
    await prisma.habitLog.create({ data: { habitId: id, date } });
    await awardPoints(user.id, 20, "Kept a habit");
    return NextResponse.json({ done: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const habit = await prisma.habit.findFirst({
      where: { id, userId: user.id },
    });
    if (!habit) return jsonError("Habit not found", 404);
    await prisma.habit.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
