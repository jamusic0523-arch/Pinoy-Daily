"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Page() {
  const [todayStr, setTodayStr] = useState("");
  const [gasTotal, setGasTotal] = useState(0);
  const [commuteTotal, setCommuteTotal] = useState(0);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    setTodayStr(today);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-serif font-normal tracking-tight">Kumusta, Ja?</h1>
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
      </div>
    </div>
  );
}