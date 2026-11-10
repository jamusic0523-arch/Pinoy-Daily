"use client";
import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(m => m.Polyline), { ssr: false });

const PLACES = [
  { name: "FEU Manila", lat: 14.6038, lng: 120.9866 },
  { name: "UE Manila - Recto", lat: 14.6045, lng: 120.9860 },
  { name: "NU Manila - Sampaloc", lat: 14.6058, lng: 120.9875 },
  { name: "San Beda University - Mendiola", lat: 14.5990, lng: 120.9890 },
  { name: "Mapua University - Intramuros", lat: 14.5905, lng: 120.9755 },
  { name: "Adamson University", lat: 14.5875, lng: 120.9835 },
  { name: "UST - Espana", lat: 14.6095, lng: 120.9895 },
  { name: "UP Diliman", lat: 14.6530, lng: 121.0620 },
  { name: "Ateneo de Manila", lat: 14.6390, lng: 121.0780 },
  { name: "PUP Manila - Sta. Mesa", lat: 14.6000, lng: 121.0100 },
  { name: "TUP Manila", lat: 14.5870, lng: 120.9840 },
  { name: "PLM - Intramuros", lat: 14.5880, lng: 120.9720 },
  { name: "SM North EDSA", lat: 14.6567, lng: 121.0297 },
  { name: "Mall of Asia (MOA)", lat: 14.5350, lng: 120.9820 },
  { name: "SM Manila", lat: 14.5890, lng: 120.9810 },
  { name: "Robinsons Manila", lat: 14.5820, lng: 120.9810 },
  { name: "SM Megamall", lat: 14.5840, lng: 121.0570 },
  { name: "Greenbelt / Ayala", lat: 14.5540, lng: 121.0240 },
  { name: "Quiapo", lat: 14.5995, lng: 120.9842 },
  { name: "Sampaloc", lat: 14.6075, lng: 120.9968 },
  { name: "Divisoria", lat: 14.6050, lng: 120.9730 },
  { name: "Intramuros", lat: 14.5890, lng: 120.9740 },
  { name: "Cubao", lat: 14.6190, lng: 121.0530 },
  { name: "Recto", lat: 14.6030, lng: 120.9820 },
  { name: "Baclaran", lat: 14.5340, lng: 120.9920 },
  { name: "Ortigas", lat: 14.5860, lng: 121.0610 },
  { name: "Ayala / Makati", lat: 14.5540, lng: 121.0240 },
  { name: "Pasay", lat: 14.5370, lng: 121.0010 },
  { name: "Manila City Hall", lat: 14.59, lng: 120.981 },
  { name: "Espana", lat: 14.6090, lng: 120.9910 },
  { name: "Mendiola", lat: 14.5995, lng: 120.9895 },
];

function calcFare(km: number, type: "jeep" | "mrt" | "bus") {
  if (type === "jeep") return 15 + Math.max(0, km - 4) * 2;
  if (type === "mrt") return 16 + km * 1.2;
  return 15 + km * 1.5;
}

function getSakayDetails(fromName: string, toName: string, distKm: number) {
  const f = fromName.toLowerCase();
  const t = toName.toLowerCase();
  if (f.includes("feu") && t.includes("ue")) return { jeep: "Morayta - Recto", train: "Lakad lang, 5 min", bus: "Morayta - Recto" };
  if (f.includes("ue") && t.includes("feu")) return { jeep: "Recto - Morayta", train: "Lakad lang, 5 min", bus: "Recto - Morayta" };
  if ((f.includes("feu") || f.includes("morayta")) && t.includes("north")) return { jeep: "Morayta - SM North via Espana", train: "LRT-2 (Recto - Cubao) → MRT-3 (Cubao - North Ave)", bus: "Morayta - SM North via Quezon Ave" };
  if ((f.includes("feu") || f.includes("morayta")) && t.includes("quiapo")) return { jeep: "Morayta - Quiapo", train: "Jeep lang", bus: "Morayta - Quiapo" };
  if ((f.includes("feu") || f.includes("morayta")) && t.includes("sampaloc")) return { jeep: "Morayta - Sampaloc / UST", train: "Jeep lang", bus: "Morayta - Sampaloc" };
  if ((f.includes("feu") || f.includes("morayta")) && t.includes("cubao")) return { jeep: "Morayta - Cubao via Espana", train: "LRT-2 (Recto - Cubao)", bus: "Quiapo - Cubao" };
  if (f.includes("sampaloc") && t.includes("quiapo")) return { jeep: "Sampaloc - Quiapo via Espana", train: "Jeep lang", bus: "Sampaloc - Quiapo" };
  if (f.includes("quiapo") && t.includes("sampaloc")) return { jeep: "Quiapo - Sampaloc", train: "Jeep lang", bus: "Quiapo - Sampaloc" };
  if (f.includes("quiapo") && t.includes("divisoria")) return { jeep: "Quiapo - Divisoria", train: "Jeep lang", bus: "Quiapo - Divisoria" };
  if (f.includes("quiapo") && t.includes("intramuros")) return { jeep: "Quiapo - Pier / Intramuros", train: "LRT-1 (Carriedo - Central)", bus: "Quiapo - Pier" };
  if (f.includes("divisoria") && t.includes("baclaran")) return { jeep: "Divisoria - Baclaran", train: "LRT-1 (Doroteo Jose - Baclaran)", bus: "Divisoria - Baclaran" };
  const jeep = () => {
    if (f.includes("quiapo") || t.includes("quiapo")) return "Quiapo - Sampaloc";
    if (f.includes("divisoria") || t.includes("divisoria")) return "Divisoria - Baclaran";
    if (f.includes("cubao") || t.includes("cubao")) return "Cubao - Quiapo";
    if (f.includes("sampaloc") || t.includes("sampaloc")) return "Sampaloc - Quiapo";
    if (f.includes("intramuros")) return "Quiapo - Pier / Intramuros";
    if (f.includes("recto") || t.includes("recto")) return "Recto - Divisoria";
    if (f.includes("baclaran")) return "Baclaran - Divisoria";
    return `${fromName} - ${toName}`;
  };
  const train = () => {
    if (f.includes("recto") || t.includes("recto") || f.includes("cubao")) return "LRT-2 (Recto - Antipolo)";
    if (f.includes("baclaran") || f.includes("quiapo")) return "LRT-1 (Baclaran - Roosevelt)";
    return "MRT-3 (North Ave - Taft Ave)";
  };
  const bus = () => {
    if (distKm >= 8) return "EDSA Carousel - PITX / Monumento";
    if (f.includes("quiapo")) return "Quiapo - Fairview / Lagro";
    return `${fromName} - ${toName}`;
  };
  return { jeep: jeep(), train: train(), bus: bus() };
}

export default function SakayPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // FIX MAPA: i-load yung Leaflet CSS, kaya putol-putol kanina
  useEffect(() => {
    import("leaflet/dist/leaflet.css");
    import("leaflet").then((L) => {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  const fromPlace = PLACES.find((p) => p.name === from) ?? PLACES[0];
  const toPlace = PLACES.find((p) => p.name === to) ?? PLACES[1];

  const distKm = useMemo(() => {
    if (!from || !to) return 0;
    const R = 6371;
    const dLat = ((toPlace.lat - fromPlace.lat) * Math.PI) / 180;
    const dLng = ((toPlace.lng - fromPlace.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((fromPlace.lat * Math.PI) / 180) * Math.cos((toPlace.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, [from, to, fromPlace, toPlace]);

  const baseMin = Math.round(distKm * 3.5 + 8);

  const routes = useMemo(() => {
    if (!from || !to) return [];
    const d = getSakayDetails(from, to, distKm);
    const isNorth = toPlace.lat > fromPlace.lat;
    const dirText = isNorth ? "Pa-north • Pauwi" : "Pa-south • Paalis";
    const traffic = isNorth ? 1.12 : 0.95;
    if (distKm < 3) {
      return [
        { id: "mura", title: "💰 Tipid Mode", price: 15, time: Math.round(baseMin * 1.4 + 5), rides: "1 sakay", tag: "JEEP", sign: d.jeep, note: dirText },
        { id: "mabilis", title: "⚡ Express Mode", price: 30, time: Math.round(baseMin * 0.9 + 2), rides: "1 sakay", tag: "TRICYCLE", sign: "Tricycle / E-trike", note: "Diretso, walang hintay" },
        { id: "konti", title: "🚌 Isang Sakay Lang", price: 15, time: Math.round(baseMin * 1.2 + 3), rides: "1 sakay", tag: "JEEP", sign: d.jeep, note: `Isang jeep lang • ${dirText}` },
      ];
    }
    if (distKm < 8) {
      return [
        { id: "mura", title: "💰 Tipid Mode", price: Math.round(calcFare(distKm, "jeep")), time: Math.round(baseMin * 1.3 + 8), rides: "1 sakay", tag: "JEEP", sign: d.jeep, note: dirText },
        { id: "mabilis", title: "⚡ Express Mode", price: Math.round(calcFare(distKm, "bus")), time: Math.round(baseMin * 0.9 + 4), rides: "1 sakay", tag: "BUS", sign: d.bus, note: "Isang bus lang" },
        { id: "konti", title: "🚌 Isang Sakay Lang", price: Math.round(calcFare(distKm, "bus") + 5), time: Math.round(baseMin * 1.1 + 3), rides: "1 sakay", tag: "BUS", sign: d.bus, note: `Walang lipat • ${dirText}` },
      ];
    }
    return [
      { id: "mura", title: "💰 Tipid Mode", price: Math.round(calcFare(distKm * 0.6, "jeep") + calcFare(distKm * 0.4, "mrt")), time: Math.round((baseMin * 1.35 + 12) * traffic), rides: "2 sakay", tag: "JEEP + TRAIN", sign: `${d.jeep} → ${d.train}`, note: dirText },
      { id: "mabilis", title: "⚡ Express Mode", price: Math.round(calcFare(distKm * 0.5, "mrt") + calcFare(distKm * 0.5, "bus")), time: Math.round((baseMin * 0.85 + 5) * traffic), rides: "2 sakay", tag: "TRAIN + BUS", sign: `${d.train} → ${d.bus}`, note: "Via EDSA" },
      { id: "konti", title: "🚌 Isang Sakay Lang", price: Math.round(calcFare(distKm, "bus") + 10), time: Math.round((baseMin * 1.1 + 3) * traffic), rides: "1 sakay", tag: "BUS", sign: d.bus, note: dirText },
    ];
  }, [distKm, baseMin, from, to, fromPlace, toPlace]);

  const center: [number, number] = [(fromPlace.lat + toPlace.lat) / 2, (fromPlace.lng + toPlace.lng) / 2];

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: "bold" }}>🗺️ Sakay</h1>

      {/* FROM - may sariling choices pang-phone */}
<div style={{ position: "relative", marginBottom: 8 }}>
  <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Saan ka manggagaling? Ex: FEU Manila" style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd" }} />
  {from && PLACES.filter(p => p.name.toLowerCase().includes(from.toLowerCase()) && p.name !== from).slice(0, 5).map(p => (
    <div key={p.name} onClick={() => setFrom(p.name)} style={{ padding: 12, background: "#fff", borderBottom: "1px solid #eee", cursor: "pointer" }}>
      📍 {p.name}
    </div>
  ))}
</div>

{/* TO - may sariling choices pang-phone */}
<div style={{ position: "relative", marginBottom: 12 }}>
  <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Saan ka pupunta? Ex: UE Manila - Recto" style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd" }} />
  {to && PLACES.filter(p => p.name.toLowerCase().includes(to.toLowerCase()) && p.name !== to).slice(0, 5).map(p => (
    <div key={p.name} onClick={() => setTo(p.name)} style={{ padding: 12, background: "#fff", borderBottom: "1px solid #eee", cursor: "pointer" }}>
      🏁 {p.name}
    </div>
  ))}
</div>

      {from && to && (
        <>
          <p style={{ fontWeight: 600 }}>📏 {distKm.toFixed(1)} km • {toPlace.lat > fromPlace.lat ? "Pa-north • Pauwi" : "Pa-south • Paalis"}</p>

          {/* MAPA - AYOS NA, BUO NA */}
          <div style={{ height: 300, borderRadius: 12, overflow: "hidden", marginBottom: 14, border: "1px solid #e5e5e5" }}>
            <MapContainer key={`${from}-${to}`} center={center} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[fromPlace.lat, fromPlace.lng]}><Popup>📍 {from}</Popup></Marker>
              <Marker position={[toPlace.lat, toPlace.lng]}><Popup>🏁 {to}</Popup></Marker>
              <Polyline positions={[[fromPlace.lat, fromPlace.lng], [toPlace.lat, toPlace.lng]]} color="#2563eb" weight={4} />
            </MapContainer>
          </div>

          {/* CARDS - PARANG LUMA, WALANG DILAW NA BOX */}
          {routes.map((r) => (
            <div key={r.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, marginBottom: 10, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b>{r.title}</b>
                <span style={{ fontSize: 11, background: "#f0f0f0", padding: "3px 8px", borderRadius: 20 }}>{r.tag}</span>
              </div>
              <div style={{ fontSize: 14, marginTop: 4 }}>₱{r.price} • {r.time} min • {r.rides}</div>
              <div style={{ fontSize: 13, marginTop: 6, color: "#333" }}>🪧 Karatula: <b>{r.sign}</b></div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{r.note}</div>
            </div>
          ))}
        </>
      )}


    </div>
  );
}