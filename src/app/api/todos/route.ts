import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";

const schema = z.object({
  title: z.string().trim().min(1, "Write a task").max(80),
});

export async function GET() {
  try {
    const user = await requireUser();
    const todos = await prisma.todo.findMany({
      where: { userId: user.id },
      orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ todos });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = schema.parse(await request.json());
    const todo = await prisma.todo.create({
      data: { userId: user.id, title: body.title },
    });
    return NextResponse.json({ todo });
  } catch (error) {
    return handleApiError(error);
  }
}
