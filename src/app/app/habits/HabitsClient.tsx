"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { todayKey } from "@/lib/money";

type Todo = { id: string; title: string; done: boolean };
type Habit = { id: string; name: string; logs: { date: string }[] };

export function HabitsClient({
  initialTodos,
  initialHabits,
}: {
  initialTodos: Todo[];
  initialHabits: Habit[];
}) {
  const router = useRouter();
  const today = todayKey();
  const [todos, setTodos] = useState(initialTodos);
  const [habits, setHabits] = useState(initialHabits);
  const [task, setTask] = useState("");
  const [habitName, setHabitName] = useState("");

  async function addTodo(event: FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: task }),
    });
    const data = await res.json();
    if (res.ok) {
      setTodos((list) => [data.todo, ...list]);
      setTask("");
    }
  }

  async function toggleTodo(todo: Todo) {
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !todo.done }),
    });
    const data = await res.json();
    if (res.ok) {
      setTodos((list) =>
        list.map((item) => (item.id === todo.id ? data.todo : item)),
      );
      router.refresh();
    }
  }

  async function removeTodo(id: string) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    setTodos((list) => list.filter((item) => item.id !== id));
  }

  async function addHabit(event: FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: habitName }),
    });
    const data = await res.json();
    if (res.ok) {
      setHabits((list) => [...list, data.habit]);
      setHabitName("");
    }
  }

  async function toggleHabit(habit: Habit) {
    const res = await fetch(`/api/habits/${habit.id}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return;
    setHabits((list) =>
      list.map((item) => {
        if (item.id !== habit.id) return item;
        const logs = data.done
          ? [...item.logs, { date: today }]
          : item.logs.filter((log) => log.date !== today);
        return { ...item, logs };
      }),
    );
    router.refresh();
  }

  async function removeHabit(id: string) {
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    setHabits((list) => list.filter((item) => item.id !== id));
  }

  function streak(habit: Habit) {
    let count = 0;
    const dates = new Set(habit.logs.map((log) => log.date));
    const cursor = new Date();
    for (let i = 0; i < 40; i += 1) {
      const key = cursor.toISOString().slice(0, 10);
      if (!dates.has(key)) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="card p-6">
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          Smart to-do
        </h1>
        <p className="mt-1 text-muted">Finish a task to earn 15 points.</p>
        <form onSubmit={addTodo} className="mt-5 flex gap-2">
          <input
            className="field"
            placeholder="What needs doing?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            required
          />
          <button className="btn btn-primary shrink-0">Add</button>
        </form>
        <ul className="mt-4 grid gap-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3"
            >
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo)}
                />
                <span className={todo.done ? "text-muted line-through" : ""}>
                  {todo.title}
                </span>
              </label>
              <button
                className="text-sm text-coral"
                type="button"
                onClick={() => removeTodo(todo.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-6">
        <h2
          className="text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Habit tracker
        </h2>
        <p className="mt-1 text-muted">Check in today for 20 points each.</p>
        <form onSubmit={addHabit} className="mt-5 flex gap-2">
          <input
            className="field"
            placeholder="e.g. Mag-exercise, magbasa, no soda"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            required
          />
          <button className="btn btn-primary shrink-0">Add</button>
        </form>
        <ul className="mt-4 grid gap-2">
          {habits.map((habit) => {
            const done = habit.logs.some((log) => log.date === today);
            return (
              <li
                key={habit.id}
                className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{habit.name}</p>
                  <p className="text-sm text-muted">{streak(habit)}-day streak</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className={`btn py-2 ${done ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => toggleHabit(habit)}
                  >
                    {done ? "Done today" : "Check in"}
                  </button>
                  <button
                    className="text-sm text-coral"
                    type="button"
                    onClick={() => removeHabit(habit.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
