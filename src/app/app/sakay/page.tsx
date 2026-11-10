"use client";
import { useState, useEffect, useRef } from "react";

const PLACES = [
  { name: "SM North EDSA", lat: 14.6567, lng: 121.0295, area: "Quezon City" },
  { name: "Trinoma", lat: 14.653, lng: 121.032, area: "Quezon City" },
  { name: "Cubao - Araneta", lat: 14.622, lng: 121.053, area: "Quezon City" },
  { name: "Eastwood City", lat: 14.609, lng: 121.081, area: "Quezon City" },
  { name: "Fairview - SM Fairview", lat: 14.733, lng: 121.058, area: "Quezon City" },
  { name: "Commonwealth - Litex", lat: 14.678, lng: 121.078, area: "Quezon City" },
  { name: "Philcoa", lat: 14.648, lng: 121.057, area: "Quezon City" },
  { name: "Kamuning", lat: 14.636, lng: 121.045, area: "Quezon City" },
  { name: "Tomas Morato", lat: 14.635, lng: 121.037, area: "Quezon City" },
  { name: "Welcome Rotonda", lat: 14.618, lng: 121.002, area: "Quezon City" },
  { name: "UP Diliman", lat: 14.6538, lng: 121.061, area: "Quezon City - School" },
  { name: "Ateneo de Manila", lat: 14.639, lng: 121.078, area: "Quezon City - School" },
  { name: "Miriam College Katipunan", lat: 14.64, lng: 121.078, area: "Quezon City - School" },
  { name: "Philippine Science High - Main", lat: 14.648, lng: 121.057, area: "Quezon City - School" },
  { name: "New Era University", lat: 14.66, lng: 121.06, area: "Quezon City - School" },
  { name: "FEU Diliman", lat: 14.66, lng: 121.07, area: "Quezon City - School" },
  { name: "Quezon City Science High", lat: 14.645, lng: 121.045, area: "Quezon City - School" },
  { name: "Divisoria", lat: 14.6018, lng: 120.9745, area: "Manila" },
  { name: "Quiapo Church", lat: 14.5989, lng: 120.9838, area: "Manila" },
  { name: "Intramuros", lat: 14.5895, lng: 120.9748, area: "Manila" },
  { name: "Binondo - Chinatown", lat: 14.6, lng: 120.97, area: "Manila" },
  { name: "Rizal Park Luneta", lat: 14.5815, lng: 120.976, area: "Manila" },
  { name: "Tondo - Tutuban", lat: 14.611, lng: 120.968, area: "Manila" },
  { name: "Malate - Remedios", lat: 14.572, lng: 120.982, area: "Manila" },
  { name: "Ermita - Robinsons Manila", lat: 14.58, lng: 120.981, area: "Manila" },
  { name: "Paco Market", lat: 14.587, lng: 120.996, area: "Manila" },
  { name: "Pedro Gil", lat: 14.577, lng: 120.995, area: "Manila" },
  { name: "Recto - LRT Recto", lat: 14.602, lng: 120.984, area: "Manila" },
  { name: "Blumentritt", lat: 14.621, lng: 120.983, area: "Manila" },
  { name: "UST - University of Santo Tomas", lat: 14.609, lng: 120.989, area: "Manila - School" },
  { name: "FEU - Far Eastern University", lat: 14.603, lng: 120.986, area: "Manila - School" },
  { name: "UE - University of the East Recto", lat: 14.601, lng: 120.985, area: "Manila - School" },
  { name: "Adamson University", lat: 14.586, lng: 120.984, area: "Manila - School" },
  { name: "Mapua University Intramuros", lat: 14.587, lng: 120.977, area: "Manila - School" },
  { name: "PUP - Polytechnic University", lat: 14.598, lng: 121.004, area: "Manila - School" },
  { name: "TUP - Technological University", lat: 14.588, lng: 120.987, area: "Manila - School" },
  { name: "PLM - Pamantasan ng Lungsod", lat: 14.59, lng: 120.974, area: "Manila - School" },
  { name: "San Beda University", lat: 14.599, lng: 120.99, area: "Manila - School" },
  { name: "DLSU - De La Salle Manila", lat: 14.565, lng: 120.993, area: "Manila - School" },
  { name: "UP Manila", lat: 14.58, lng: 120.984, area: "Manila - School" },
  { name: "Makati - Ayala Ave", lat: 14.5547, lng: 121.0244, area: "Makati" },
  { name: "Greenbelt Makati", lat: 14.5525, lng: 121.0215, area: "Makati" },
  { name: "Glorietta Makati", lat: 14.5515, lng: 121.0265, area: "Makati" },
  { name: "Buendia - Gil Puyat", lat: 14.554, lng: 121.008, area: "Makati" },
  { name: "Guadalupe - EDSA", lat: 14.565, lng: 121.038, area: "Makati" },
  { name: "BGC - High Street", lat: 14.554, lng: 121.048, area: "Taguig" },
  { name: "BGC - Market Market", lat: 14.549, lng: 121.056, area: "Taguig" },
  { name: "McKinley Hill", lat: 14.532, lng: 121.052, area: "Taguig" },
  { name: "SM Aura BGC", lat: 14.546, lng: 121.055, area: "Taguig" },
  { name: "University of Makati", lat: 14.558, lng: 121.022, area: "Makati - School" },
  { name: "MOA - Mall of Asia", lat: 14.535, lng: 120.982, area: "Pasay" },
  { name: "NAIA Terminal 3", lat: 14.508, lng: 121.019, area: "Pasay" },
  { name: "MRT Taft Ave", lat: 14.5907, lng: 121.0165, area: "Pasay" },
  { name: "Baclaran Church", lat: 14.534, lng: 120.998, area: "Paranaque" },
  { name: "SM Sucat", lat: 14.47, lng: 121.02, area: "Paranaque" },
  { name: "SM Southmall Las Pinas", lat: 14.447, lng: 120.99, area: "Las Pinas" },
  { name: "Alabang Town Center", lat: 14.423, lng: 121.028, area: "Muntinlupa" },
  { name: "Festival Mall Alabang", lat: 14.417, lng: 121.04, area: "Muntinlupa" },
  { name: "San Beda Alabang", lat: 14.42, lng: 121.03, area: "Muntinlupa - School" },
  { name: "De La Salle Zobel Alabang", lat: 14.41, lng: 121.03, area: "Muntinlupa - School" },
  { name: "SM Megamall", lat: 14.5845, lng: 121.056, area: "Mandaluyong" },
  { name: "Robinsons Galleria", lat: 14.589, lng: 121.059, area: "Mandaluyong" },
  { name: "Shaw Blvd - EDSA", lat: 14.583, lng: 121.049, area: "Mandaluyong" },
  { name: "Ortigas Center", lat: 14.586, lng: 121.061, area: "Pasig" },
  { name: "Pasig Palengke", lat: 14.559, lng: 121.078, area: "Pasig" },
  { name: "Marikina - Riverbanks", lat: 14.64, lng: 121.09, area: "Marikina" },
  { name: "Greenhills San Juan", lat: 14.606, lng: 121.047, area: "San Juan" },
  { name: "La Salle Green Hills", lat: 14.606, lng: 121.045, area: "San Juan - School" },
  { name: "Xavier School San Juan", lat: 14.61, lng: 121.04, area: "San Juan - School" },
  { name: "Rizal Technological University", lat: 14.58, lng: 121.06, area: "Mandaluyong - School" },
  { name: "Monumento Caloocan", lat: 14.657, lng: 120.984, area: "Caloocan" },
  { name: "SM Grand Central Caloocan", lat: 14.652, lng: 120.983, area: "Caloocan" },
  { name: "Malabon - Fish Market", lat: 14.66, lng: 120.954, area: "Malabon" },
  { name: "Navotas - Agora Market", lat: 14.66, lng: 120.94, area: "Navotas" },
  { name: "Valenzuela - SM Valenzuela", lat: 14.7, lng: 120.98, area: "Valenzuela" },
  { name: "University of Caloocan City", lat: 14.65, lng: 120.98, area: "Caloocan - School" },
];

const POPULAR = [
  { from: "SM North EDSA", to: "MOA - Mall of Asia", label: "SM North → MOA" },
  { from: "Cubao - Araneta", to: "Divisoria", label: "Cubao → Divisoria" },
  { from: "Quiapo Church", to: "Intramuros", label: "Quiapo → Intramuros" },
  { from: "Makati - Ayala Ave", to: "BGC - High Street", label: "Makati → BGC" },
  { from: "UST - University of Santo Tomas", to: "SM North EDSA", label: "UST → SM North" },
  { from: "UP Diliman", to: "Ateneo de Manila", label: "UP → Ateneo" },
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
      try {
        const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromPlace.lng},${fromPlace.lat};${toPlace.lng},${toPlace.lat}?overview=full&geometries=geojson`);
        const d = await r.json();
        if (d.routes?.[0]) {
          const line = d.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          L.polyline(line, { color, weight: 6 }).addTo(group);
        }
      } catch {}
      L.marker([fromPlace.lat, fromPlace.lng]).addTo(group).bindPopup(`<div style="font-family: Georgia, serif;"><b style="color:#166B4A;">Sakay Dito:</b><br/>${fromPlace.name}</div>`).openPopup();
      L.marker([toPlace.lat, toPlace.lng]).addTo(group).bindPopup(`<div style="font-family: Georgia, serif;"><b style="color:#166B4A;">Baba Dito:</b><br/>${toPlace.name}</div>`);
      mapRef.current.fitBounds([[fromPlace.lat, fromPlace.lng], [toPlace.lat, toPlace.lng]], { padding: [40, 40] });
      layerRef.current = group;
    });
  }, [from, to, routeId]);
  return (
    <>
      <style>{`.leaflet-container, .leaflet-popup-content { font-family: Georgia, 'Times New Roman', serif !important; } .leaflet-popup-content b { color: #166B4A; }`}</style>
      <div ref={ref} className="w-full h-[320px] rounded-b-[20px] z-0" style={{ fontFamily: "Georgia, serif" }} />
    </>
  );
}

export default function SakayPage() {
  const [from, setFrom] = useState("SM North EDSA");
  const [to, setTo] = useState("MOA - Mall of Asia");
  const [selected, setSelected] = useState("mura");
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const routes = [
    { id: "mura", title: "Pinakamura", price: "₱45", time: "55 min - 2 sakay", steps: ["MRT-3", "Jeep"] },
    { id: "mabilis", title: "Pinakamabilis", price: "₱65", time: "40 min - 2 sakay", steps: ["MRT-3", "Bus"] },
    { id: "konti", title: "Pinaka-konti Lipat", price: "₱80", time: "50 min - 1 sakay", steps: ["Bus Direct"] },
  ];
  const filteredFrom = PLACES.filter(p => p.name.toLowerCase().includes(from.toLowerCase()));
  const filteredTo = PLACES.filter(p => p.name.toLowerCase().includes(to.toLowerCase()));
  const serif = { fontFamily: "Georgia, 'Times New Roman', serif" } as any;
  return (
    <div className="min-h-screen bg-[#F5EFE0] p-4 pb-24 max-w-md mx-auto" style={serif}>
      <h1 className="text-[32px]" style={serif}>Saan ka pupunta?</h1>
      <p className="text-sm text-gray-600 mb-3" style={serif}>Metro Manila - Places + Schools</p>
      <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 space-y-2">
        <div className="relative">
          <label className="text-xs" style={serif}>FROM</label>
          <input value={from} onChange={e => { setFrom(e.target.value); setShowFrom(true); }} onFocus={() => setShowFrom(true)} placeholder="Type: UST, Divisoria, Ateneo..." className="w-full border border-gray-200 rounded-xl px-3 py-2" style={serif} />
          {showFrom && <div className="absolute z-20 w-full bg-white border rounded-xl mt-1 max-h-[180px] overflow-auto">{filteredFrom.map(p => <button key={p.name} onClick={() => { setFrom(p.name); setShowFrom(false); }} className="w-full text-left px-3 py-2 hover:bg-yellow-50 border-b text-sm">{p.name} <span className="text-xs text-gray-500">- {p.area}</span></button>)}</div>}
        </div>
        <button onClick={() => { setFrom(to); setTo(from); }} className="w-full bg-white border border-gray-200 rounded-full py-2 text-sm" style={serif}>Swap</button>
        <div className="relative">
          <label className="text-xs" style={serif}>TO</label>
          <input value={to} onChange={e => { setTo(e.target.value); setShowTo(true); }} onFocus={() => setShowTo(true)} placeholder="Type: MOA, BGC, DLSU..." className="w-full border border-gray-200 rounded-xl px-3 py-2" style={serif} />
          {showTo && <div className="absolute z-20 w-full bg-white border rounded-xl mt-1 max-h-[180px] overflow-auto">{filteredTo.map(p => <button key={p.name} onClick={() => { setTo(p.name); setShowTo(false); }} className="w-full text-left px-3 py-2 hover:bg-yellow-50 border-b text-sm">{p.name} <span className="text-xs text-gray-500">- {p.area}</span></button>)}</div>}
        </div>
        <button className="w-full bg-[#166B4A] text-white rounded-full py-2.5" style={serif}>Find My Route</button>
        <div className="pt-2">
          <p className="text-xs mb-2" style={serif}>PINAKA HINAHANAP SA MANILA:</p>
          <div className="flex flex-wrap gap-2">{POPULAR.map(t => <button key={t.label} onClick={() => { setFrom(t.from); setTo(t.to); }} className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs shadow-sm">{t.label}</button>)}</div>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {routes.map(r => <button key={r.id} onClick={() => setSelected(r.id)} className={`w-full text-left bg-white rounded-[20px] p-3 shadow-sm border ${selected === r.id ? "border-[#166B4A] bg-green-50" : "border-gray-100"}`}><div className="flex justify-between"><span>{r.title} {selected === r.id ? "✓" : ""}</span><span>{r.price}</span></div><div className="text-xs text-gray-600">{r.time} - {r.steps.join(" → ")}</div></button>)}
      </div>
      <div className="mt-5 rounded-[20px] overflow-hidden border border-gray-100 bg-white shadow-sm">
        <div className="px-3 py-2 flex justify-between"><span className="text-[13px]" style={serif}>Mapa</span><span className="text-[11px] text-gray-500">{from} → {to}</span></div>
        <RealMap from={from} to={to} routeId={selected} />
      </div>
    </div>
  );
}