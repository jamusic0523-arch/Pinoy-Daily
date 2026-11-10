"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(m => m.Polyline), { ssr: false });

const PLACES = [
    // --- SCHOOLS ---
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
    // --- MALLS / PLACES ---
    { name: "SM North EDSA", lat: 14.6567, lng: 121.0297 },
    { name: "Mall of Asia (MOA)", lat: 14.5350, lng: 120.9820 },
    { name: "SM Manila", lat: 14.5890, lng: 120.9810 },
    { name: "Robinsons Manila", lat: 14.5820, lng: 120.9810 },
    { name: "SM Megamall", lat: 14.5840, lng: 121.0570 },
    { name: "Greenbelt / Ayala", lat: 14.5540, lng: 121.0240 },
    // --- COMMUTE HUBS ---
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

  const jeepSign = () => {
    if (f.includes("quiapo") || t.includes("quiapo")) return "Jeep: Quiapo - Sampaloc";
    if (f.includes("divisoria") || t.includes("divisoria")) return "Jeep: Divisoria - Baclaran";
    if (f.includes("cubao") || t.includes("cubao")) return "Jeep: Cubao - Quiapo";
    if (f.includes("sampaloc") || t.includes("sampaloc")) return "Jeep: Sampaloc - Quiapo";
    if (f.includes("intramuros") || t.includes("intramuros")) return "Jeep: Quiapo - Pier / Intramuros";
    if (f.includes("recto") || t.includes("recto")) return "Jeep: Recto - Divisoria";
    if (f.includes("baclaran") || t.includes("baclaran")) return "Jeep: Baclaran - Divisoria";
    if (f.includes("pasay") || t.includes("pasay")) return "Jeep: Pasay - Quiapo";
    return `Jeep: ${fromName} - ${toName}`;
  };

  const trainLine = () => {
    if (f.includes("recto") || t.includes("recto") || f.includes("cubao") || f.includes("sampaloc")) return "LRT-2 (Recto - Antipolo)";
    if (f.includes("baclaran") || t.includes("baclaran") || f.includes("pasay") || f.includes("quiapo") || f.includes("manila")) return "LRT-1 (Baclaran - Roosevelt)";
    return "MRT-3 (North Ave - Taft Ave)";
  };

  const busSign = () => {
    if (distKm >= 8) return "Bus: EDSA Carousel - PITX / Monumento";
    if (f.includes("quiapo") || t.includes("quiapo")) return "Bus: Quiapo - Fairview / Lagro";
    if (f.includes("cubao")) return "Bus: Cubao - Divisoria";
    return `Bus: ${fromName} - ${toName}`;
  };

  return { jeepSign: jeepSign(), trainLine: trainLine(), busSign: busSign() };
}

// FIX 1: Ni-rename ko - getDirectionText na, hindi na directionLabel
function getDirectionText(fromLat: number, toLat: number) {
  return toLat > fromLat ? "Pa-north • Pauwi" : "Pa-south • Paalis";
}

export default function SakayPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fromPlace = PLACES.find((p) => p.name === from) ?? PLACES[0];
  const toPlace = PLACES.find((p) => p.name === to) ?? PLACES[1];

  const distKm = useMemo(() => {
    if (!from || !to) return 0;
    const R = 6371;
    const dLat = ((toPlace.lat - fromPlace.lat) * Math.PI) / 180;
    const dLng = ((toPlace.lng - fromPlace.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((fromPlace.lat * Math.PI) / 180) *
        Math.cos((toPlace.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, [from, to, fromPlace, toPlace]);

  const baseMin = Math.round(distKm * 3.5 + 8);

  const routes = useMemo(() => {
    if (!from || !to) return [];
    const details = getSakayDetails(from, to, distKm);
    const isNorthbound = toPlace.lat > fromPlace.lat;
    const dirTraffic = isNorthbound ? 1.12 : 0.95;
    const dirFareAdjust = isNorthbound ? 2 : 0;
    // FIX 1: dirText na, hindi directionLabel
    const dirText = isNorthbound ? "Pa-north • Pauwi" : "Pa-south • Paalis";

    const isShort = distKm < 3;
    const isMedium = distKm >= 3 && distKm < 8;

    if (isShort) {
      return [
        { id: "mura", title: "💰 Tipid Mode", price: 15, time: Math.round(baseMin * 1.4 + 5), rides: "1 sakay", steps: [details.jeepSign], note: `${dirText}` },
        { id: "mabilis", title: "⚡ Express Mode", price: 30, time: Math.round(baseMin * 0.9 + 2), rides: "1 sakay", steps: ["Tricycle / E-trike"], note: `Diretso, walang hintay` },
        { id: "konti", title: "🚌 Isang Sakay Lang", price: 15, time: Math.round(baseMin * 1.2 + 3), rides: "1 sakay", steps: [details.jeepSign], note: `Isang jeep lang • ${dirText}` },
      ];
    }

    if (isMedium) {
      return [
        { id: "mura", title: "💰 Tipid Mode", price: Math.round(calcFare(distKm, "jeep")), time: Math.round(baseMin * 1.3 + 8), rides: "1 sakay", steps: [details.jeepSign], note: `${dirText}` },
        { id: "mabilis", title: "⚡ Express Mode", price: Math.round(calcFare(distKm, "bus")), time: Math.round(baseMin * 0.9 + 4), rides: "1 sakay", steps: [details.busSign], note: `Isang bus lang` },
        { id: "konti", title: "🚌 Isang Sakay Lang", price: Math.round(calcFare(distKm, "bus") + 5), time: Math.round(baseMin * 1.1 + 3), rides: "1 sakay", steps: [details.busSign], note: `Walang lipat • ${dirText}` },
      ];
    }

    return [
      { id: "mura", title: "💰 Tipid Mode", price: Math.round(calcFare(distKm * 0.6, "jeep") + calcFare(distKm * 0.4, "mrt") + dirFareAdjust), time: Math.round((baseMin * 1.35 + 12) * dirTraffic), rides: "2 sakay", steps: isNorthbound ? [details.jeepSign, details.trainLine] : [details.trainLine, details.jeepSign], note: `${dirText}` },
      { id: "mabilis", title: "⚡ Express Mode", price: Math.round(calcFare(distKm * 0.5, "mrt") + calcFare(distKm * 0.5, "bus") + dirFareAdjust), time: Math.round((baseMin * 0.85 + 5) * dirTraffic), rides: "2 sakay", steps: isNorthbound ? [details.busSign, details.trainLine] : [details.trainLine, details.busSign], note: `Via EDSA` },
      { id: "konti", title: "🚌 Isang Sakay Lang", price: Math.round(calcFare(distKm, "bus") + 10 + dirFareAdjust), time: Math.round((baseMin * 1.1 + 3) * dirTraffic), rides: "1 sakay", steps: [details.busSign], note: `${dirText}` },
    ];
  }, [distKm, baseMin, from, to, fromPlace, toPlace]);

  // FIX 2: center dapat tuple na [number, number]
  const center: [number, number] = [(fromPlace.lat + toPlace.lat) / 2, (fromPlace.lng + toPlace.lng) / 2];

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: "0 auto" }}>
      <h1>🗺️ Sakay</h1>

      <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Saan ka manggagaling? Ex: Quiapo" list="places" style={{ width: "100%", padding: 12, marginBottom: 8, borderRadius: 10 }} />
      <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Saan ka pupunta? Ex: Sampaloc" list="places" style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 10 }} />
      <datalist id="places">
        {PLACES.map((p) => (
          <option key={p.name} value={p.name} />
        ))}
      </datalist>

      {from && to && (
        <>
          <p>📏 {distKm.toFixed(1)} km • {getDirectionText(fromPlace.lat, toPlace.lat)}</p>

          <div style={{ height: 280, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
            <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[fromPlace.lat, fromPlace.lng]}>
                <Popup>📍 Simula: {from}</Popup>
              </Marker>
              <Marker position={[toPlace.lat, toPlace.lng]}>
                <Popup>🏁 Punta: {to}</Popup>
              </Marker>
              <Polyline positions={[[fromPlace.lat, fromPlace.lng], [toPlace.lat, toPlace.lng]]} color="blue" />
            </MapContainer>
          </div>

          {routes.map((r) => (
            <div key={r.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <b>{r.title}</b> — ₱{r.price} • {r.time} min • {r.rides}
              <div style={{ fontSize: 13, marginTop: 4 }}>{r.steps.join(" → ")}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{r.note}</div>
            </div>
          ))}
        </>
      )}

      {(!from || !to) && <p style={{ color: "#888", textAlign: "center", marginTop: 20 }}>👆 Pili ka muna ng simula at pupuntahan mo</p>}
    </div>
  );
}