"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/app", label: "Home" },
  { href: "/app/budget", label: "Budget" },
  { href: "/app/habits", label: "To-do & habits" },
  { href: "/app/calc", label: "Gas & Commute" },
  { href: "/app/ranks", label: "Ranking" },
];

export function AppShell({
  children,
  name,
  points,
}: {
  children: React.ReactNode;
  name: string;
  points: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-5">
      <header className="card flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <Link href="/app" className="font-bold text-lg">Pinoy Daily</Link>
          <nav className="flex gap-2 flex-wrap">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-3 py-1 text-sm ${active ? "bg-emerald-700 text-white" : "bg-gray-100"}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">{name} • {points} pts</span>
          <button onClick={logout} className="text-sm border rounded-full px-3 py-1">Logout</button>
        </div>
      </header>
      <main className="mt-6">{children}</main>
    </div>
  );
}