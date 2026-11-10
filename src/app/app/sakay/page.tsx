"use client";

import { useState } from "react";

// ===== PINOY DAILY MAP - ATIN TO, KATULAD NG APOY NATIN =====
// Hindi Google, hindi Waze. Tayo nag-drawing ng SVG na to.
function PinoyMap({ routeId }: { routeId: string }) {
  const maps: any = {
    mura: {
      color: "#2563eb",
      label: "Pinakamura - MRT + Jeep",
      stops: [
        { x: 40, y: 270, label: "SM North", sub: "Sakay Dito" },
        { x: 140, y: 180, label: "MRT Q.Ave", sub: "MRT-3" },
        { x: 250, y: 90, label: "MRT Taft", sub: "Baba + Lipat" },
        { x: 340, y: 160, label: "Jeep Taft", sub: "Jeep" },
        { x: 390, y: 270, label: "MOA", sub: "Baba Dito" },
      ],
    },
    mabilis: {
      color: "#dc2626",
      label: "Pinakamabilis - MRT + Bus",
      stops: [
        { x: 40, y: 270, label: "SM North", sub: "Sakay Dito" },
        { x: 160, y: 160, label: "MRT", sub: "MRT-3" },
        { x: 280, y: 80, label: "Bus EDSA", sub: "Bus" },
        { x: 390, y: 270, label: "MOA", sub: "Baba Dito" },
      ],
    },
    konti: {
      color: "#16a34a",
      label: "Pinaka-konti Lipat - Bus Direct",
      stops: [
        { x: 40, y: 270, label: "SM North", sub: "Sakay Dito" },
        { x: 215, y: 180, label: "Bus Direct", sub: "Isang Sakay Lang" },
        { x: 390, y: 270, label: "MOA", sub: "Baba Dito" },
      ],
    },
  };

  const current = maps[routeId] || maps.mura;

  return (
    <div className="rounded-[20px] overflow-hidden border-[3px] border-black bg-[#FFF7E6] shadow-[4px_4px_0_#000]">
      <div className="bg-white px-3 py-2 flex justify-between items-center border-b-2 border-black">
        <span className="text-[13px] font-black">🗺️ PINOY DAILY MAP</span>
        <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">● ATIN TO • WALANG GOOGLE</span>
      </div>

      <svg viewBox="0 0 430 320" className="w-full h-[300px] block">
        <rect width="430" height="320" fill="#FFF7E6" />
        {/* Parke - parang sa apoy natin, bilugan */}
        <rect x="15" y="15" width="105" height="70" rx="16" fill="#BFE8A0" />
        <text x="67" y="55" fontSize="11" textAnchor="middle" fill="#2f6b1f" fontWeight="bold">🌳 PARK</text>
        <rect x="305" y="15" width="105" height="60" rx="16" fill="#BFE8A0" />
        <text x="357" y="50" fontSize="11" textAnchor="middle" fill="#2f6b1f" fontWeight="bold">🌳 PARK</text>
        {/* Ilog */}
        <path d="M0 250 Q100 230 200 260 T430 240" stroke="#7DD3FC" strokeWidth="18" fill="none" strokeLinecap="round" />
        <text x="30" y="255" fontSize="9" fill="#0369a1" fontWeight="bold">ILOG</text>
        {/* Kalsada */}
        <g stroke="#E5E0D0" strokeWidth="10" strokeLinecap="round">
          <line x1="0" y1="120" x2="430" y2="120" />
          <line x1="0" y1="205" x2="430" y2="205" />
          <line x1="110" y1="0" x2="110" y2="320" />
          <line x1="285" y1="0" x2="285" y2="320" />
        </g>
        <g stroke="white" strokeWidth="1.5" strokeDasharray="8 6">
          <line x1="0" y1="120" x2="430" y2="120" />
          <line x1="0" y1="205" x2="430" y2="205" />
          <line x1="110" y1="0" x2="110" y2="320" />
          <line x1="285" y1="0" x2="285" y2="320" />
        </g>
        <text x="125" y="115" fontSize="10" fontWeight="bold" fill="#A8A29E">EDSA</text>
        <text x="295" y="200" fontSize="10" fontWeight="bold" fill="#A8A29E">ROXAS BLVD</text>

        {/* RUTA NATIN - makapal katulad ng apoy natin */}
        <polyline
          points={current.stops.map((s: any) => `${s.x},${s.y}`).join(" ")}
          fill="none"
          stroke={current.color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* White outline para lumutang */}
        <polyline
          points={current.stops.map((s: any) => `${s.x},${s.y}`).join(" ")}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />

        {current.stops.map((s: any, i: number) => (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r="14" fill="white" stroke="#000" strokeWidth="2.5" />
            <circle cx={s.x} cy={s.y} r="6" fill={current.color} stroke="white" strokeWidth="1" />
            <g>
              <rect x={s.x - 42} y={s.y + 20} width="84" height="28" rx="8" fill="white" stroke="#000" strokeWidth="1.2" />
              <text x={s.x} y={s.y + 32} fontSize="9" fontWeight="900" textAnchor="middle" fill="#111">{s.label}</text>
              <text x={s.x} y={s.y + 43} fontSize="7.5" textAnchor="middle" fill="#666">{s.sub}</text>
            </g>
          </g>
        ))}
      </svg>

      <div className="bg-white px-3 py-2 border-t-2 border-black flex justify-between items-center">
        <span className="text-[11px] font-bold">{current.label}</span>
        <span className="text-[10px] text-gray-500">Drawing natin • Walang bayad • Walang copyright</span>
      </div>
    </div>
  );
}

export default function SakayPage() {
  const [from, setFrom] = useState("SM North");
  const [to, setTo] = useState("MOA");
  const [selected, setSelected] = useState("mura");

  const routes = [
    {
      id: "mura",
      title: "Pinakamura",
      price: "₱45",
      time: "55 min • 2 sakay",
      steps: ["🚇 MRT-3 SM North → Taft Ave", "🚙 Jeep Taft → MOA"],
      color: "border-blue-500",
      bg: "bg-blue-50",
    },
    {
      id: "mabilis",
      title: "Pinakamabilis",
      price: "₱65",
      time: "40 min • 2 sakay",
      steps: ["🚇 MRT-3 SM North → Taft", "🚌 Bus Taft → MOA"],
      color: "border-red-500",
      bg: "bg-red-50",
    },
    {
      id: "konti",
      title: "Pinaka-konti Lipat",
      price: "₱80",
      time: "50 min • 1 sakay",
      steps: ["🚌 Bus Direct SM North → MOA"],
      color: "border-green-500",
      bg: "bg-green-50",
    },
  ];

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="min-h-screen bg-[#FFF7E6] p-4 pb-24 max-w-md mx-auto">
      <h1 className="text-[28px] font-black leading-tight">Saan ka pupunta? 🛵</h1>
      <p className="text-sm text-gray-600 mb-4">Hanapin natin pinakamura, pinakamabilis na sakay.</p>

      <div className="bg-white rounded-[20px] border-[3px] border-black p-3 shadow-[4px_4px_0_#000] space-y-2">
        <div>
          <label className="text-xs font-bold">FROM</label>
          <input value={from} onChange={(e) => setFrom(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-bold" />
        </div>
        <button onClick={swap} className="w-full bg-black text-white rounded-xl py-2 font-bold text-sm">🔄 Swap</button>
        <div>
          <label className="text-xs font-bold">TO</label>
          <input value={to} onChange={(e) => setTo(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-bold" />
        </div>
        <button className="w-full bg-[#FFC700] border-2 border-black rounded-xl py-2.5 font-black shadow-[2px_2px_0_#000]">Find My Route →</button>
      </div>

      <div className="mt-5 space-y-3">
        {routes.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={`w-full text-left bg-white rounded-[20px] border-[3px] p-3 shadow-[3px_3px_0_#000] ${selected === r.id ? r.color + " " + r.bg : "border-black"}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-black">{r.title} {selected === r.id ? "✅" : ""}</span>
              <span className="font-black text-lg">{r.price}</span>
            </div>
            <div className="text-xs text-gray-600">{r.time}</div>
            <div className="mt-2 space-y-1">
              {r.steps.map((s, i) => (
                <div key={i} className="text-[13px] font-medium bg-white/70 rounded-lg px-2 py-1 border border-gray-100">{s}</div>
              ))}
            </div>
            {selected === r.id && <div className="mt-2 text-[11px] font-bold text-green-600">👆 Yan yung nasa mapa sa baba!</div>}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <PinoyMap routeId={selected} />
      </div>

      <p className="text-center text-[11px] text-gray-500 mt-4">🗺️ Pinoy Daily Map — katulad ng apoy natin, atin to, tayo nag-drawing.</p>
    </div>
  );
}