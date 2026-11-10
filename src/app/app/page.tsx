"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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

function FlameIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ verticalAlign: 'middle', display: 'inline-block' }}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
export default function Page() {
  const [todayStr, setTodayStr] = useState("");
  const [gasTotal, setGasTotal] = useState(0);
  const [commuteTotal, setCommuteTotal] = useState(0);
  const [displayName, setDisplayName] = useState("Kaibigan");
  const [streak, setStreak] = useState(1);
const [fireOn, setFireOn] = useState(true);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    setTodayStr(today);
    background: getFireColor(streak)
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d?.user?.name) setDisplayName(d.user.name);
    }).catch(() => {});
    try {
      const g = localStorage.getItem("gas_simple");
      const c = localStorage.getItem("commute");
      if (g) {
        const gasEntries = JSON.parse(g);
        const todayGas = gasEntries.filter((e:any) => e.date === today);
        setGasTotal(todayGas.reduce((a:any,b:any)=>a+b.amount,0));
      }
      if (c) {
        const commEntries = JSON.parse(c);
        const todayComm = commEntries.filter((e:any) => e.date === today);
        setCommuteTotal(todayComm.reduce((a:any,b:any)=>a+b.fare,0));
      }
    } catch {}
  }, []);

  const totalToday = gasTotal + commuteTotal;

  const hour = new Date().getHours();
let greeting = "Kumusta";
if (hour < 5) greeting = "Magandang Gabi";
else if (hour < 12) greeting = "Magandang Umaga";
else if (hour < 13) greeting = "Magandang Tanghali";
else if (hour < 18) greeting = "Magandang Hapon";
else greeting = "Magandang Gabi";

  return (
    <div className="space-y-6">
      <div>
      <h1 className="text-[28px] leading-[1.15] sm:text-4xl font-serif font-normal tracking-tight flex flex-wrap items-center gap-x-2">{greeting}, {displayName}. {fireOn && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', verticalAlign: 'middle', fontSize: '20px' }}><FlameIcon color={getFireColor(streak)} size={18} /> {streak}</span>}</h1>
        <p className="text-sm text-gray-500 mt-1">Your everyday tools are ready.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-500">This month</p>
          <p className="text-3xl font-serif font-normal mt-2">₱0.00</p>
          <p className="text-xs text-gray-500 mt-1">of ₱0.00 budget</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-500">Open tasks</p>
          <p className="text-3xl font-serif font-normal mt-2">0</p>
          <p className="text-xs text-gray-500 mt-1">Finish one for +15 pts</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-500">Habits today</p>
          <p className="text-3xl font-serif font-normal mt-2">0/0</p>
          <p className="text-xs text-gray-500 mt-1">Add your first habit</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-500">Your rank</p>
          <p className="text-3xl font-serif font-normal mt-2">#2</p>
          <p className="text-xs text-gray-500 mt-1">50 points</p>
        </div>

        {/* PUTI NA AT KASING LAKI LANG NG IBA */}
        <Link href="/app/calc" className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition block">
          <p className="text-xs text-gray-500">Gas & Commute today</p>
          <p className="text-3xl font-serif font-normal mt-2">₱{totalToday.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Gas ₱{gasTotal.toFixed(0)} • Commute ₱{commuteTotal.toFixed(0)}</p>
        </Link>
        <Link href="/map-guide" className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition block">
  <p className="text-xs text-gray-500">Map Guide</p>
  <p className="text-3xl font-serif font-normal mt-2">Find Route</p>
  <p className="text-xs text-gray-500 mt-1">SM North → SM MOA • ~45 mins</p>
</Link>
      </div>
    </div>
  );
}