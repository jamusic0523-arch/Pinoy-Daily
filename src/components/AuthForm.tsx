"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mode === "register" ? { name, email, password } : { email, password },
      ),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not continue");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto w-full max-w-md p-8">
      <p className="text-sm font-semibold tracking-wide text-leaf">PINOY DAILY</p>
      <h1
        className="mt-2 text-3xl text-ink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-muted">
        {mode === "login"
          ? "Log in to keep your points, ranking, and everyday tools."
          : "Get 50 welcome points. Track gastos, habits, and Pinoy expenses."}
      </p>
      <div className="mt-6 grid gap-3">
        {mode === "register" && (
          <input
            className="field"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          className="field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={mode === "register" ? 6 : 1}
        />
      </div>
      {error && <p className="mt-3 text-sm text-coral">{error}</p>}
      <button className="btn btn-primary mt-5 w-full" disabled={busy}>
        {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
      </button>
      <p className="mt-4 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="font-semibold text-leaf">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-leaf">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
