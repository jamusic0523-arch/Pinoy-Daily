import { prisma } from "./prisma";

export async function awardPoints(
  userId: string,
  amount: number,
  reason: string,
) {
  await prisma.$transaction([
    prisma.pointEvent.create({ data: { userId, amount, reason } }),
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: amount } },
    }),
  ]);
}

export async function awardDailyLogin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const now = new Date();
  if (user.lastLoginAt) {
    const last = user.lastLoginAt;
    const sameDay =
      last.getFullYear() === now.getFullYear() &&
      last.getMonth() === now.getMonth() &&
      last.getDate() === now.getDate();
    if (sameDay) {
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: now },
      });
      return;
    }
  }
  await prisma.$transaction([
    prisma.pointEvent.create({
      data: { userId, amount: 10, reason: "Daily login" },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: 10 }, lastLoginAt: now },
    }),
  ]);
}

export async function awardCapped(
  userId: string,
  amount: number,
  reason: string,
  maxPerDay: number,
) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const count = await prisma.pointEvent.count({
    where: {
      userId,
      reason,
      createdAt: { gte: start },
    },
  });
  if (count >= maxPerDay) return false;
  await awardPoints(userId, amount, reason);
  return true;
}
