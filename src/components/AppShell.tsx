"use client";


import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/app", label: "Home" },
  { href: "/app/budget", label: "Budget" },
  { href: "/app/habits", label: "To-do & habits" },
  { href: "/app/calc", label: "Gas & Commute" },
  { href: "/app/ranks", label: "Ranking" },
  { href: "/app/sakay", label: "🗺️ Map Guide" },
];
function getFireColor(streak: number) {
  if (streak >= 365) return "#FF00FF";
  if (streak >= 300) return "#FFFFFF";
  if (streak >= 250) return "#00E5FF";
  if (streak >= 200) return "#FF4081";
  if (streak >= 150) return "#AA00FF";
  if (streak >= 100) return "#2979FF";
  if (streak >= 50) return "#00E676";
  if (streak >= 30) return "#FFD700";
  return "#FF7A00";
}
function FlameIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ verticalAlign: 'middle', display: 'inline-block' }}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

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
  const [fireOn, setFireOn] = useState(true);
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    const today = new Date().toDateString();
    let savedStreak = parseInt(localStorage.getItem('streak') || '1');
    let lastOpen = localStorage.getItem('lastOpen');
    let savedFire = localStorage.getItem('fireOn');

    if (lastOpen !== today) {
      if (!lastOpen) {
        savedStreak = 1;
        setFireOn(true);
      } else {
        const diff = Math.round((new Date(today).getTime() - new Date(lastOpen).getTime()) / (1000*60*60*24));
        if (diff === 1) {
          savedStreak += 1;
          setFireOn(true);
        } else if (diff > 1) {
          // Hindi nag-open, hindi magre-reset, apoy lang mamamatay tapos buhay ulit
          setFireOn(true);
        }
      }
      localStorage.setItem('streak', String(savedStreak));
      localStorage.setItem('lastOpen', today);
      localStorage.setItem('fireOn', 'true');
    } else {
      setFireOn(savedFire !== 'false');
    }
    setStreak(savedStreak);
  }, []);

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
        <span className="text-sm">{fireOn ? <FlameIcon color={getFireColor(streak)} /> : ''} {name} • {points} pts</span>
          <button onClick={logout} className="text-sm border rounded-full px-3 py-1">Logout</button>
        </div>
      </header>
      <main className="mt-6">{children}</main>
    </div>
  );
}