"use client";
import { useState, useEffect } from "react";

type Entry = { id: string; date: string; vehicle: string; fare: number; note: string; };
type GasEntry = { id: string; date: string; distance: number; amount: number; octane: string; };

export default function Page() {
  const [mode, setMode] = useState<"gas" | "commute">("gas");
  const [gDistance, setGDistance] = useState("");
  const [gAmount, setGAmount] = useState("");
  const [gOctane, setGOctane] = useState("95 Premium");
  const [gasEntries, setGasEntries] = useState<GasEntry[]>([]);
  const [vehicle, setVehicle] = useState("Jeep");
  const [fare, setFare] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setTodayStr(new Date().toLocaleDateString());
    try {
      const s = localStorage.getItem("commute");
      const g = localStorage.getItem("gas_simple");
      if (s) setEntries(JSON.parse(s));
      if (g) setGasEntries(JSON.parse(g));
    } catch {
      localStorage.removeItem("commute");
      localStorage.removeItem("gas_simple");
    }
  }, []);
  useEffect(() => { localStorage.setItem("commute", JSON.stringify(entries)); }, [entries]);
  useEffect(() => { localStorage.setItem("gas_simple", JSON.stringify(gasEntries)); }, [gasEntries]);

  const addGas = () => {
    if (!gDistance || !gAmount) return alert("Lagyan mo Distance at Magkano");
    const nowDate = new Date().toLocaleDateString();
    setTodayStr(nowDate);
    setGasEntries([{ id: Date.now().toString(), date: nowDate, distance: Number(gDistance), amount: Number(gAmount), octane: gOctane }, ...gasEntries]);
    setGDistance(""); setGAmount("");
  };

  const add = () => {
    if (!fare) return alert("Please enter fare amount");
    const nowDate = new Date().toLocaleDateString();
    setTodayStr(nowDate);
    setEntries([{ id: Date.now().toString(), date: nowDate, vehicle, fare: Number(fare), note }, ...entries]);
    setFare(""); setNote("");
  };

  const todayEntries = todayStr ? entries.filter(e => e.date === todayStr) : [];
  const todayGasEntries = todayStr ? gasEntries.filter(e => e.date === todayStr) : [];
  const todayTotal = todayEntries.reduce((a,b)=>a+b.fare,0);
  const todayGasTotal = todayGasEntries.reduce((a,b)=>a+b.amount,0);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <h1 className="text-4xl font-serif font-normal text-gray-900 tracking-tight">Gas & Commute</h1>
      <div className="flex gap-3">
        <button onClick={()=>setMode("gas")} className={`flex-1 py-2.5 rounded-full font-medium text-sm border ${mode==="gas" ? "bg-emerald-800 text-white border-emerald-800" : "bg-white text-gray-600 border-gray-200"}`}>Gas</button>
        <button onClick={()=>setMode("commute")} className={`flex-1 py-2.5 rounded-full font-medium text-sm border ${mode==="commute" ? "bg-emerald-800 text-white border-emerald-800" : "bg-white text-gray-600 border-gray-200"}`}>Commute</button>
      </div>

      {mode==="gas" && (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-3xl font-serif font-normal text-gray-900 tracking-tight">Gas Record</h2>
            <p className="text-[14px] text-gray-500">Anong gas at magkano?</p>
            <div className="grid grid-cols-4 gap-2">
              {["91 Regular","95 Premium","97 Blaze","Diesel"].map(o=>(
                <button key={o} onClick={()=>setGOctane(o)} className={`py-2.5 rounded-full border text-xs font-medium ${gOctane===o ? "bg-emerald-800 text-white border-emerald-800" : "bg-white text-gray-600 border-gray-200"}`}>{o}</button>
              ))}
            </div>
            <input type="number" value={gDistance} onChange={e=>setGDistance(e.target.value)} placeholder="Distance (km) ex: 20" className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-700" />
            <input type="number" value={gAmount} onChange={e=>setGAmount(e.target.value)} placeholder="Magkano? (₱) ex: 100" className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-700" />
            <button onClick={addGas} className="w-full bg-emerald-800 text-white py-3 rounded-full font-medium text-sm">Save Gas Trip</button>
          </div>

          <div className="bg-emerald-800 text-white rounded-xl p-4 flex justify-between items-center">
            <span className="text-sm">Total gas today ({todayStr}):</span>
            <span className="font-medium text-lg">₱{todayGasTotal.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            {todayGasEntries.map(e=>(
              <div key={e.id} className="bg-white rounded-xl shadow-sm p-4 flex justify-between text-sm text-gray-700">
                <span>{e.date} • <b>{e.octane}</b> • {e.distance}km</span>
                <span className="font-medium">₱{e.amount} <button onClick={()=>setGasEntries(gasEntries.filter(x=>x.id!==e.id))} className="ml-2 text-red-500">x</button></span>
              </div>
            ))}
            {todayGasEntries.length===0 && <p className="text-center text-sm text-gray-400 py-2">No gas records today</p>}
          </div>
        </>
      )}

      {mode==="commute" && (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-3xl font-serif font-normal text-gray-900 tracking-tight">Commute</h2>
            <div className="grid grid-cols-3 gap-2">
              {["Jeep","Train","Bus","UV","Tricycle","Taxi","Move It","Angkas","Grab","JoyRide"].map(v=>(
                <button key={v} onClick={()=>setVehicle(v)} className={`py-2.5 rounded-full border text-sm font-medium ${vehicle===v ? "bg-emerald-800 text-white border-emerald-800" : "bg-white text-gray-600 border-gray-200"}`}>{v}</button>
              ))}
            </div>
            <input type="number" value={fare} onChange={e=>setFare(e.target.value)} placeholder="How much is fare? ex: 15" className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm" />
            <input type="text" value={note} onChange={e=>setNote(e.target.value)} placeholder="work, school, home, mall, etc" className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm" />
            <button onClick={add} className="w-full bg-emerald-800 text-white py-3 rounded-full font-medium text-sm">Add Trip</button>
          </div>
          <div className="bg-emerald-800 text-white rounded-xl p-4 flex justify-between items-center">
            <span className="text-sm">Total spent this day ({todayStr}):</span>
            <span className="font-medium text-lg">₱{todayTotal.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            {todayEntries.map(e=>(
              <div key={e.id} className="bg-white rounded-xl shadow-sm p-4 flex justify-between text-sm text-gray-700">
                <span><b>{e.vehicle}</b> - {e.date} {e.note && `(${e.note})`}</span>
                <span className="font-medium">₱{e.fare} <button onClick={()=>setEntries(entries.filter(x=>x.id!==e.id))} className="ml-2 text-red-500">x</button></span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}