import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HabitsClient } from "./HabitsClient";

export default async function HabitsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [todos, habits] = await Promise.all([
    prisma.todo.findMany({
      where: { userId: user.id },
      orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    }),
    prisma.habit.findMany({
      where: { userId: user.id },
      include: { logs: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <HabitsClient
      initialTodos={todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        done: todo.done,
      }))}
      initialHabits={habits.map((habit) => ({
        id: habit.id,
        name: habit.name,
        logs: habit.logs.map((log) => ({ date: log.date })),
      }))}
    />
  );
}
