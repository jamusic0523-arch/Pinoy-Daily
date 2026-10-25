import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/points";
import { handleApiError, jsonError } from "@/lib/api";

const schema = z.object({
  done: z.boolean().optional(),
  title: z.string().trim().min(1).max(80).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = schema.parse(await request.json());
    const todo = await prisma.todo.findFirst({ where: { id, userId: user.id } });
    if (!todo) return jsonError("Task not found", 404);
    const updated = await prisma.todo.update({
      where: { id },
      data: {
        done: body.done ?? todo.done,
        title: body.title ?? todo.title,
      },
    });
    if (body.done === true && !todo.done) {
      await awardPoints(user.id, 15, "Completed a task");
    }
    return NextResponse.json({ todo: updated });
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
    const todo = await prisma.todo.findFirst({ where: { id, userId: user.id } });
    if (!todo) return jsonError("Task not found", 404);
    await prisma.todo.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
