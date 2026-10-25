import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentMonth } from "@/lib/money";
import { BudgetClient } from "./BudgetClient";

export default async function BudgetPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const month = currentMonth();
  const start = new Date(`${month}-01T00:00:00`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  const [budget, expenses] = await Promise.all([
    prisma.budget.findUnique({
      where: { userId_month: { userId: user.id, month } },
    }),
    prisma.expense.findMany({
      where: { userId: user.id, date: { gte: start, lt: end } },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <BudgetClient
      month={month}
      initialBudget={budget?.amount ?? 0}
      initialExpenses={expenses.map((item) => ({
        id: item.id,
        amount: item.amount,
        category: item.category,
        note: item.note,
        date: item.date.toISOString(),
      }))}
    />
  );
}
