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
    <main className="sakay-page">
      <style jsx>{`
        .sakay-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(16px, 3vw, 32px);
          color: #17211b;
          box-sizing: border-box;
        }
        .page-heading { margin-bottom: 22px; }
        .page-heading h1 { margin: 0; font-size: clamp(25px, 3vw, 34px); font-weight: 800; letter-spacing: -0.04em; }
        .page-heading p { margin: 7px 0 0; color: #647067; font-size: 14px; }
        .search-panel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          gap: 14px;
          padding: 18px;
          margin-bottom: 18px;
          border: 1px solid #e5ebe6;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 8px 24px rgba(20, 50, 30, .05);
        }
        .field { min-width: 0; position: relative; }
        .field label { display: block; margin: 0 0 7px; font-size: 12px; font-weight: 700; color: #526057; }
        .field input {
          display: block; width: 100%; min-height: 48px; box-sizing: border-box;
          padding: 12px 14px; border: 1px solid #dce5de; border-radius: 11px;
          background: #fbfdfb; color: #17211b; font: inherit; outline: none;
        }
        .field input:focus { border-color: #198754; box-shadow: 0 0 0 3px rgba(25,135,84,.12); }
        .suggestions {
          position: absolute; z-index: 1000; top: calc(100% + 5px); left: 0; right: 0;
          overflow: hidden; border: 1px solid #e2e9e3; border-radius: 12px;
          background: white; box-shadow: 0 12px 28px rgba(0,0,0,.12);
        }
        .suggestion {
          width: 100%; display: block; padding: 12px 14px; border: 0;
          border-bottom: 1px solid #f0f2f0; background: #fff; color: #26332a;
          text-align: left; cursor: pointer; font: inherit;
        }
        .suggestion:last-child { border-bottom: 0; }
        .suggestion:hover { background: #f2f8f3; }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
          gap: 18px;
          align-items: start;
        }
        .map-panel {
          height: clamp(320px, 43vw, 520px);
          min-width: 0; overflow: hidden; border: 1px solid #e3e9e4;
          border-radius: 18px; background: #eef3ef;
        }
        .route-list { display: grid; gap: 12px; min-width: 0; }
        .route-card {
          padding: 16px; border: 1px solid #e5ebe6; border-radius: 16px;
          background: #fff; box-shadow: 0 5px 18px rgba(20,50,30,.04);
        }
        .route-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .route-title { font-size: 15px; font-weight: 750; }
        .route-tag { flex: 0 0 auto; font-size: 10px; font-weight: 800; letter-spacing: .04em;
          color: #246b43; background: #eaf5ed; padding: 5px 9px; border-radius: 99px; }
        .route-meta { margin-top: 10px; font-size: 14px; font-weight: 700; color: #26332a; }
        .route-sign { margin-top: 9px; font-size: 13px; line-height: 1.5; overflow-wrap: anywhere; }
        .route-note { margin-top: 5px; color: #748078; font-size: 12px; line-height: 1.5; }
        .distance-note { margin: 0 0 12px; color: #4c5c51; font-size: 13px; font-weight: 650; }
        .empty-state {
          padding: 24px; border: 1px dashed #cbd8ce; border-radius: 16px;
          background: #f8fbf8; color: #647067; text-align: center; font-size: 14px;
        }
        @media (max-width: 600px) {
          .sakay-page { padding: 14px; }
          .search-panel { padding: 14px; gap: 12px; border-radius: 15px; }
          .map-panel { height: 360px; }
          .route-card { padding: 14px; }
        }
      `}</style>

      <header className="page-heading">
        <h1>🗺️ Sakay Maps</h1>
        <p>Hanapin ang biyahe mo sa Metro Manila.</p>
      </header>

      <section className="search-panel" aria-label="Route search">
        <div className="field">
          <label htmlFor="sakay-from">📍 GALING SA</label>
          <input
            id="sakay-from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Saan ka manggagaling? Hal. FEU Manila"
            autoComplete="off"
          />
          {from && PLACES.filter(p => p.name.toLowerCase().includes(from.toLowerCase()) && p.name !== from).slice(0, 5).length > 0 && (
            <div className="suggestions">
              {PLACES.filter(p => p.name.toLowerCase().includes(from.toLowerCase()) && p.name !== from).slice(0, 5).map(p => (
                <button type="button" className="suggestion" key={p.name} onClick={() => setFrom(p.name)}>
                  📍 {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="sakay-to">🏁 PAPUNTA SA</label>
          <input
            id="sakay-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Saan ka pupunta? Hal. UE Manila - Recto"
            autoComplete="off"
          />
          {to && PLACES.filter(p => p.name.toLowerCase().includes(to.toLowerCase()) && p.name !== to).slice(0, 5).length > 0 && (
            <div className="suggestions">
              {PLACES.filter(p => p.name.toLowerCase().includes(to.toLowerCase()) && p.name !== to).slice(0, 5).map(p => (
                <button type="button" className="suggestion" key={p.name} onClick={() => setTo(p.name)}>
                  🏁 {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {from && to ? (
        <>
          <p className="distance-note">
            📏 Tinatayang tuwid na distansya: {distKm.toFixed(1)} km
            {" • "}
            {toPlace.lat > fromPlace.lat ? "Pa-north" : "Pa-south"}
          </p>

          <section className="results-grid" aria-label="Route results">
            <div className="map-panel">
              <MapContainer
                key={`${from}-${to}`}
                center={center}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[fromPlace.lat, fromPlace.lng]}>
                  <Popup>📍 {from}</Popup>
                </Marker>
                <Marker position={[toPlace.lat, toPlace.lng]}>
                  <Popup>🏁 {to}</Popup>
                </Marker>
                <Polyline
                  positions={[[fromPlace.lat, fromPlace.lng], [toPlace.lat, toPlace.lng]]}
                  color="#198754"
                  weight={4}
                />
              </MapContainer>
            </div>

            <div className="route-list">
              {routes.map((r) => (
                <article className="route-card" key={r.id}>
                  <div className="route-top">
                    <span className="route-title">{r.title}</span>
                    <span className="route-tag">{r.tag}</span>
                  </div>
                  <div className="route-meta">₱{r.price} • {r.time} min • {r.rides}</div>
                  <div className="route-sign">🪧 Karatula / ruta: <b>{r.sign}</b></div>
                  <div className="route-note">{r.note}</div>
                </article>
              ))}
              <p className="route-note">
                Paalala: mga paunang estimate lamang ang pamasahe at oras. I-verify ang aktuwal na ruta at sakayan bago bumiyahe.
              </p>
            </div>
          </section>
        </>
      ) : (
        <div className="empty-state">
          Piliin ang pinanggalingan at destination para makita ang mapa at mga posibleng sakay.
        </div>
      )}
    </main>
  );
}
