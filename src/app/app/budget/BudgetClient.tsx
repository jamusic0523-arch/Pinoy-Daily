"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { peso } from "@/lib/money";

const CATEGORIES = [
  "Food",
  "Commute",
  "Bills",
  "Load / internet",
  "School",
  "Fun",
  "Health",
  "Other",
];

type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
};

export function BudgetClient({
  month,
  initialBudget,
  initialExpenses,
}: {
  month: string;
  initialBudget: number;
  initialExpenses: Expense[];
}) {
  const router = useRouter();
  const [budget, setBudget] = useState(initialBudget ? String(initialBudget) : "");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [expenses, setExpenses] = useState(initialExpenses);
  const [error, setError] = useState("");

  const spent = useMemo(
    () => expenses.reduce((sum, item) => sum + item.amount, 0),
    [expenses],
  );
  const budgetNum = Number(budget) || 0;
  const left = budgetNum - spent;
  const pct = budgetNum ? Math.min(100, (spent / budgetNum) * 100) : 0;

  async function saveBudget(event: FormEvent) {
    event.preventDefault();
    await fetch("/api/budget", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(budget) || 0, month }),
    });
    router.refresh();
  }

  async function addExpense(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        category,
        note,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save");
      return;
    }
    setExpenses((list) => [data.expense, ...list]);
    setAmount("");
    setNote("");
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    setExpenses((list) => list.filter((item) => item.id !== id));
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="card p-6">
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Personal budget
        </h1>
        <p className="mt-1 text-muted">Month {month}. Amounts in Philippine pesos.</p>

        <form onSubmit={saveBudget} className="mt-5 flex gap-2">
          <input
            className="field"
            type="number"
            min="0"
            step="1"
            placeholder="Monthly budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <button className="btn btn-primary shrink-0">Save</button>
        </form>

        <div className="mt-5 rounded-2xl bg-paper p-4">
          <div className="flex justify-between text-sm">
            <span>Spent {peso(spent)}</span>
            <span className={left < 0 ? "text-coral" : "text-leaf"}>
              {left < 0 ? `${peso(Math.abs(left))} over` : `${peso(left)} left`}
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: left < 0 ? "var(--coral)" : "var(--leaf)",
              }}
            />
          </div>
        </div>

        <form onSubmit={addExpense} className="mt-6 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="field"
              type="number"
              min="1"
              step="0.01"
              placeholder="Amount (₱)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <select
              className="field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <input
            className="field"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {error && <p className="text-sm text-coral">{error}</p>}
          <button className="btn btn-primary">Log expense · +5 pts</button>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">Recent gastos</h2>
        <ul className="mt-4 grid gap-2">
          {expenses.length === 0 && (
            <li className="text-muted">No expenses yet. Log your first one.</li>
          )}
          {expenses.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3"
            >
              <div>
                <p className="font-semibold">{item.category}</p>
                <p className="text-sm text-muted">
                  {item.note || new Date(item.date).toLocaleDateString("en-PH")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <strong>{peso(item.amount)}</strong>
                <button
                  className="text-sm text-coral"
                  onClick={() => remove(item.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
