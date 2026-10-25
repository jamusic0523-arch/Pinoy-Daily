import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireUser();
    const users = await prisma.user.findMany({
      orderBy: [{ points: "desc" }, { createdAt: "asc" }],
      take: 20,
      select: { id: true, name: true, points: true },
    });
    const higher = await prisma.user.count({
      where: { points: { gt: user.points } },
    });
    return NextResponse.json({
      ranks: users,
      me: { id: user.id, name: user.name, points: user.points, rank: higher + 1 },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
