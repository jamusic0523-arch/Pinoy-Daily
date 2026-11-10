"use client";

import { useState, useEffect, useRef } from "react";

// ===== REAL MAP - Leaflet + OpenStreetMap - Accurate tulad ng Google =====
function RealMap({ routeId }: { routeId: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const layerRef = useRef<any>(null);

  const routes: any = {
    mura: {
      color: "#2563eb",
      coords: [
        [14.6567, 121.0295], // SM North
        [14.6425, 121.0370], // Quezon Ave MRT
        [14.5907, 121.0165], // Taft
        [14.5490, 121.0150], // Taft Jeep
        [14.5350, 120.9820], // MOA
      ],
      stops: ["SM North", "MRT Quezon Ave", "MRT Taft", "Jeep Taft", "MOA"],
    },
    mabilis: {
      color: "#dc2626",
      coords: [
        [14.6567, 121.0295],
        [14.6425, 121.0370],
        [14.5907, 121.0165],
        [14.5350, 120.9820],
      ],
      stops: ["SM North", "MRT", "Bus EDSA", "MOA"],
    },
    konti: {
      color: "#16a34a",
      coords: [
        [14.6567, 121.0295],
        [14.5950, 121.0050],
        [14.5350, 120.9820],
      ],
      stops: ["SM North", "Bus Direct", "MOA"],
    },
  };

  useEffect(() => {
    // Load Leaflet CSS + JS kung wala pa
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if ((window as any).L) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve(true);
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then(() => {
      const L = (window as any).L;
      if (!mapRef.current) return;
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView([14.595, 121.01], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance.current);
      }
      // Linisin old route
      if (layerRef.current) mapInstance.current.removeLayer(layerRef.current);
      const current = routes[routeId] || routes.mura;
      const group: any = L.layerGroup().addTo(mapInstance.current);
      // Linya
      L.polyline(current.coords, { color: current.color, weight: 5, opacity: 0.9 }).addTo(group);
      // Pins
      current.coords.forEach((c: any, i: number) => {
        L.marker(c).addTo(group).bindPopup(`<b>${current.stops[i]}</b>`);
      });
      mapInstance.current.fitBounds(current.coords, { padding: [30, 30] });
      layerRef.current = group;
    });
  }, [routeId]);

  return <div ref={mapRef} className="w-full h-[320px] rounded-b-[20px] z-0" />;
}

export default function SakayPage() {
  const [from, setFrom] = useState("SM North");
  const [to, setTo] = useState("MOA");
  const [selected, setSelected] = useState("mura");

  const routes = [
    { id: "mura", title: "Pinakamura", price: "₱45", time: "55 min • 2 sakay", steps: ["🚇 MRT-3 SM North → Taft Ave", "🚙 Jeep Taft → MOA"], color: "border-blue-500", bg: "bg-blue-50" },
    { id: "mabilis", title: "Pinakamabilis", price: "₱65", time: "40 min • 2 sakay", steps: ["🚇 MRT-3 SM North → Taft", "🚌 Bus Taft → MOA"], color: "border-red-500", bg: "bg-red-50" },
    { id: "konti", title: "Pinaka-konti Lipat", price: "₱80", time: "50 min • 1 sakay", steps: ["🚌 Bus Direct SM North → MOA"], color: "border-green-500", bg: "bg-green-50" },
  ];

  const swap = () => { setFrom(to); setTo(from); };

  return (
    <div className="min-h-screen bg-[#FFF7E6] p-4 pb-24 max-w-md mx-auto">
      <h1 className="text-[28px] font-black">Saan ka pupunta? 🛵</h1>
      <p className="text-sm text-gray-600 mb-4">Hanapin natin pinakamura, pinakamabilis na sakay.</p>

      <div className="bg-white rounded-[20px] border-[3px] border-black p-3 shadow-[4px_4px_0_#000] space-y-2">
        <div><label className="text-xs font-bold">FROM</label><input value={from} onChange={(e) => setFrom(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-bold" /></div>
        <button onClick={swap} className="w-full bg-black text-white rounded-xl py-2 font-bold text-sm">🔄 Swap</button>
        <div><label className="text-xs font-bold">TO</label><input value={to} onChange={(e) => setTo(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-bold" /></div>
        <button className="w-full bg-[#FFC700] border-2 border-black rounded-xl py-2.5 font-black shadow-[2px_2px_0_#000]">Find My Route →</button>
      </div>

      <div className="mt-5 space-y-3">
        {routes.map((r) => (
          <button key={r.id} onClick={() => setSelected(r.id)} className={`w-full text-left bg-white rounded-[20px] border-[3px] p-3 shadow-[3px_3px_0_#000] ${selected === r.id ? r.color + " " + r.bg : "border-black"}`}>
            <div className="flex justify-between items-center"><span className="font-black">{r.title} {selected === r.id ? "✅" : ""}</span><span className="font-black text-lg">{r.price}</span></div>
            <div className="text-xs text-gray-600">{r.time}</div>
            <div className="mt-2 space-y-1">{r.steps.map((s, i) => (<div key={i} className="text-[13px] font-medium bg-white/70 rounded-lg px-2 py-1 border border-gray-100">{s}</div>))}</div>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-[20px] overflow-hidden border-[3px] border-black bg-white shadow-[4px_4px_0_#000]">
        <div className="px-3 py-2 flex justify-between items-center border-b border-gray-100">
          <span className="text-[13px] font-black">Mapa</span>
          <span className="text-[11px] text-gray-500">{from} → {to}</span>
        </div>
        <RealMap routeId={selected} />
      </div>
    </div>
  );
}