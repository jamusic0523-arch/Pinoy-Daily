"use client";
import { useState, useEffect, useRef } from "react";

const PLACES = [
  { name: "SM North EDSA", lat: 14.6567, lng: 121.0295, area: "Quezon City" },
  { name: "MOA - Mall of Asia", lat: 14.535, lng: 120.982, area: "Pasay" },
  { name: "Divisoria", lat: 14.6018, lng: 120.9745, area: "Manila" },
  { name: "Quiapo Church", lat: 14.5989, lng: 120.9838, area: "Manila" },
  { name: "Intramuros", lat: 14.5895, lng: 120.9748, area: "Manila" },
  { name: "Cubao", lat: 14.622, lng: 121.053, area: "Quezon City" },
  { name: "Makati - Ayala Ave", lat: 14.5547, lng: 121.0244, area: "Makati" },
  { name: "BGC - High Street", lat: 14.554, lng: 121.048, area: "Taguig" },
  { name: "SM Megamall", lat: 14.5845, lng: 121.056, area: "Mandaluyong" },
  { name: "UP Diliman", lat: 14.6538, lng: 121.061, area: "Quezon City" },
  { name: "Binondo - Chinatown", lat: 14.6, lng: 120.97, area: "Manila" },
  { name: "NAIA Terminal 3", lat: 14.508, lng: 121.019, area: "Pasay" },
  { name: "Trinoma", lat: 14.653, lng: 121.032, area: "Quezon City" },
  { name: "Ortigas Center", lat: 14.586, lng: 121.061, area: "Pasig" },
];

const POPULAR = [
  { from: "SM North EDSA", to: "MOA - Mall of Asia", label: "SM North → MOA" },
  { from: "Cubao", to: "Divisoria", label: "Cubao → Divisoria" },
  { from: "Quiapo Church", to: "Intramuros", label: "Quiapo → Intramuros" },
  { from: "Makati - Ayala Ave", to: "BGC - High Street", label: "Makati → BGC" },
  { from: "SM Megamall", to: "MOA - Mall of Asia", label: "Megamall → MOA" },
  { from: "UP Diliman", to: "Trinoma", label: "UP → Trinoma" },
];

function RealMap({ from, to, routeId }: any) {
  const ref = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    const load = () => new Promise((res) => {
      if ((window as any).L) return res(true);
      const s = document.createElement("script");
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = () => res(true);
      document.head.appendChild(s);
      if (!document.getElementById("leaflet-css")) {
        const l = document.createElement("link");
        l.id = "leaflet-css"; l.rel = "stylesheet";
        l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(l);
      }
    });
    load().then(async () => {
      const L = (window as any).L;
      if (!ref.current) return;
      if (!mapRef.current) {
        mapRef.current = L.map(ref.current).setView([14.59, 121.01], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapRef.current);
      }
      if (layerRef.current) mapRef.current.removeLayer(layerRef.current);
      const fromPlace = PLACES.find(p => p.name === from) || PLACES[0];
      const toPlace = PLACES.find(p => p.name === to) || PLACES[1];
      const color = routeId === "mabilis" ? "#dc2626" : routeId === "konti" ? "#16a34a" : "#2563eb";
      const group = L.layerGroup().addTo(mapRef.current);
      // Totoong kalsada via OSRM
      try {
        const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromPlace.lng},${fromPlace.lat};${toPlace.lng},${toPlace.lat}?overview=full&geometries=geojson`);
        const d = await r.json();
        if (d.routes?.[0]) {
          const line = d.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          L.polyline(line, { color, weight: 6 }).addTo(group);
        }
      } catch {}
      L.marker([fromPlace.lat, fromPlace.lng]).addTo(group).bindPopup(`<b>Sakay Dito: ${fromPlace.name}</b>`).openPopup();
      L.marker([toPlace.lat, toPlace.lng]).addTo(group).bindPopup(`<b>Baba Dito: ${toPlace.name}</b>`);
      mapRef.current.fitBounds([[fromPlace.lat, fromPlace.lng], [toPlace.lat, toPlace.lng]], { padding: [40, 40] });
      layerRef.current = group;
    });
  }, [from, to, routeId]);
  return <div ref={ref} className="w-full h-[320px] rounded-b-[20px] z-0" />;
}

export default function SakayPage() {
  const [from, setFrom] = useState("SM North EDSA");
  const [to, setTo] = useState("MOA - Mall of Asia");
  const [selected, setSelected] = useState("mura");
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const routes = [
    { id: "mura", title: "Pinakamura", price: "₱45", time: "55 min • 2 sakay", steps: ["🚇 MRT-3", "🚙 Jeep"] },
    { id: "mabilis", title: "Pinakamabilis", price: "₱65", time: "40 min • 2 sakay", steps: ["🚇 MRT-3", "🚌 Bus"] },
    { id: "konti", title: "Pinaka-konti Lipat", price: "₱80", time: "50 min • 1 sakay", steps: ["🚌 Bus Direct"] },
  ];

  const filteredFrom = PLACES.filter(p => p.name.toLowerCase().includes(from.toLowerCase()));
  const filteredTo = PLACES.filter(p => p.name.toLowerCase().includes(to.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#FFF7E6] p-4 pb-24 max-w-md mx-auto">
      <h1 className="text-[28px] font-black">Saan ka pupunta? 🛵</h1>
      <div className="bg-white rounded-[20px] border-[3px] border-black p-3 shadow-[4px_4px_0_#000] space-y-2">
        <div className="relative">
          <label className="text-xs font-bold">FROM</label>
          <input value={from} onChange={e => { setFrom(e.target.value); setShowFrom(true); }} onFocus={() => setShowFrom(true)} placeholder="Type: Divisoria, Cubao..." className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-bold" />
          {showFrom && <div className="absolute z-20 w-full bg-white border-2 border-black rounded-xl mt-1 max-h-[180px] overflow-auto">{filteredFrom.map(p => <button key={p.name} onClick={() => { setFrom(p.name); setShowFrom(false); }} className="w-full text-left px-3 py-2 hover:bg-yellow-100 border-b">{p.name} <span className="text-xs text-gray-500">• {p.area}</span></button>)}</div>}
        </div>
        <button onClick={() => { setFrom(to); setTo(from); }} className="w-full bg-black text-white rounded-xl py-2 font-bold text-sm">🔄 Swap</button>
        <div className="relative">
          <label className="text-xs font-bold">TO</label>
          <input value={to} onChange={e => { setTo(e.target.value); setShowTo(true); }} onFocus={() => setShowTo(true)} placeholder="Type: MOA, BGC..." className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-bold" />
          {showTo && <div className="absolute z-20 w-full bg-white border-2 border-black rounded-xl mt-1 max-h-[180px] overflow-auto">{filteredTo.map(p => <button key={p.name} onClick={() => { setTo(p.name); setShowTo(false); }} className="w-full text-left px-3 py-2 hover:bg-yellow-100 border-b">{p.name} <span className="text-xs text-gray-500">• {p.area}</span></button>)}</div>}
        </div>
        <button className="w-full bg-[#FFC700] border-2 border-black rounded-xl py-2.5 font-black">Find My Route →</button>
        <div className="pt-2">
          <p className="text-xs font-black mb-2">🔥 PINAKA HINAHANAP SA MANILA:</p>
          <div className="flex flex-wrap gap-2">{POPULAR.map(t => <button key={t.label} onClick={() => { setFrom(t.from); setTo(t.to); }} className="bg-white border-2 border-black rounded-full px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0_#000]">{t.label}</button>)}</div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {routes.map(r => <button key={r.id} onClick={() => setSelected(r.id)} className={`w-full text-left bg-white rounded-[20px] border-[3px] p-3 shadow-[3px_3px_0_#000] ${selected === r.id ? "border-blue-500 bg-blue-50" : "border-black"}`}><div className="flex justify-between"><span className="font-black">{r.title} {selected === r.id ? "✅" : ""}</span><span className="font-black">{r.price}</span></div><div className="text-xs text-gray-600">{r.time} • {r.steps.join(" → ")}</div></button>)}
      </div>

      <div className="mt-5 rounded-[20px] overflow-hidden border-[3px] border-black bg-white shadow-[4px_4px_0_#000]">
        <div className="px-3 py-2 flex justify-between"><span className="text-[13px] font-black">Mapa</span><span className="text-[11px] text-gray-500">{from} → {to}</span></div>
        <RealMap from={from} to={to} routeId={selected} />
      </div>
    </div>
  );
}