"use client";
import { useState, useMemo, useEffect, type CSSProperties } from "react";
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
  const [beginnerMode, setBeginnerMode] = useState(true);

  // Load Leaflet styles and marker icons on the client.
  useEffect(() => {
    import("leaflet/dist/leaflet.css");
    import("leaflet").then((L) => {
      // @ts-ignore - Leaflet's default icon URL typing is incomplete here.
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

    const d = getSakayDetails(from, to, distKm);
    const isNorth = toPlace.lat > fromPlace.lat;
    const dirText = isNorth ? "Pa-north • Pauwi" : "Pa-south • Paalis";
    const traffic = isNorth ? 1.12 : 0.95;

    if (distKm < 3) {
      return [
        {
          id: "mura",
          title: "💰 Tipid Mode",
          price: 15,
          time: Math.round(baseMin * 1.4 + 5),
          rides: "1 sakay",
          tag: "JEEP",
          vehicle: "Jeepney",
          sign: d.jeep,
          note: dirText,
          steps: [
            "Pumunta sa loading area na malapit sa pinanggalingan mo.",
            `Hanapin ang jeep na may karatulang "${d.jeep}".`,
            "Bago sumakay, itanong sa driver kung dadaan ito sa iyong bababaan.",
            `Sabihin ang destination mo: ${to}. Magtanong kung saan pinakamainam bumaba.`,
          ],
        },
        {
          id: "mabilis",
          title: "⚡ Express Mode",
          price: 30,
          time: Math.round(baseMin * 0.9 + 2),
          rides: "1 sakay",
          tag: "TRICYCLE",
          vehicle: "Tricycle / E-trike",
          sign: "Walang standard na karatula",
          note: "Diretso, walang hintay",
          steps: [
            "Humanap ng legal na tricycle terminal o pila.",
            "Sabihin ang eksaktong destination at itanong muna ang pamasahe.",
            "Kumpirmahin kung ihahatid ka mismo sa destination.",
          ],
        },
        {
          id: "konti",
          title: "🚌 Isang Sakay Lang",
          price: 15,
          time: Math.round(baseMin * 1.2 + 3),
          rides: "1 sakay",
          tag: "JEEP",
          vehicle: "Jeepney",
          sign: d.jeep,
          note: `Isang jeep lang • ${dirText}`,
          steps: [
            "Pumunta sa sakayan at tingnan ang karatula sa harap ng jeep.",
            `Hanapin ang "${d.jeep}" at kumpirmahin sa driver ang bababaan.`,
            `Sabihin na papunta ka sa ${to} at itanong kung saan ka dapat bumaba.`,
          ],
        },
      ];
    }

    if (distKm < 8) {
      return [
        {
          id: "mura",
          title: "💰 Tipid Mode",
          price: Math.round(calcFare(distKm, "jeep")),
          time: Math.round(baseMin * 1.3 + 8),
          rides: "1 sakay",
          tag: "JEEP",
          vehicle: "Jeepney",
          sign: d.jeep,
          note: dirText,
          steps: [
            "Pumunta sa loading area ng jeep sa direksyong kailangan mo.",
            `Hanapin ang karatulang "${d.jeep}" sa harap o windshield ng jeep.`,
            "Itanong sa driver kung dadaan sa destination bago sumakay.",
            `Sabihin na bababa ka sa ${to}; magtanong kung anong landmark ang dapat bantayan.`,
          ],
        },
        {
          id: "mabilis",
          title: "⚡ Express Mode",
          price: Math.round(calcFare(distKm, "bus")),
          time: Math.round(baseMin * 0.9 + 4),
          rides: "1 sakay",
          tag: "BUS",
          vehicle: "Bus",
          sign: d.bus,
          note: "Isang bus lang",
          steps: [
            "Pumunta sa tamang bus stop o terminal; huwag sumakay sa gitna ng kalsada.",
            `Basahin ang destination sign sa harap ng bus: "${d.bus}".`,
            "Kumpirmahin sa konduktor o driver kung daraan sa destination mo.",
            `Sabihin na bababa ka malapit sa ${to} at humingi ng paalala bago ang stop.`,
          ],
        },
        {
          id: "konti",
          title: "🚌 Isang Sakay Lang",
          price: Math.round(calcFare(distKm, "bus") + 5),
          time: Math.round(baseMin * 1.1 + 3),
          rides: "1 sakay",
          tag: "BUS",
          vehicle: "Bus",
          sign: d.bus,
          note: `Walang lipat • ${dirText}`,
          steps: [
            "Pumunta sa bus stop na may sakayan papunta sa direksyon mo.",
            `Hanapin ang bus na may karatulang "${d.bus}".`,
            "I-confirm sa konduktor ang bababaan at kung kailangan ng beep card o cash.",
          ],
        },
      ];
    }

    return [
      {
        id: "mura",
        title: "💰 Tipid Mode",
        price: Math.round(calcFare(distKm * 0.6, "jeep") + calcFare(distKm * 0.4, "mrt")),
        time: Math.round((baseMin * 1.35 + 12) * traffic),
        rides: "2 sakay",
        tag: "JEEP + TRAIN",
        vehicle: "Jeepney + Train",
        sign: `${d.jeep} → ${d.train}`,
        note: dirText,
        steps: [
          `Unang sakay: hanapin ang jeep na may karatulang "${d.jeep}".`,
          "Kumpirmahin sa driver kung saan pinakamalapit na babaan para sa transfer.",
          `Sumunod na sakay: ${d.train}. Sundin ang station signs at huwag magmadali sa paglipat.`,
          `Pagdating sa huling bahagi ng biyahe, sundin ang directions papuntang ${to}.`,
        ],
      },
      {
        id: "mabilis",
        title: "⚡ Express Mode",
        price: Math.round(calcFare(distKm * 0.5, "mrt") + calcFare(distKm * 0.5, "bus")),
        time: Math.round((baseMin * 0.85 + 5) * traffic),
        rides: "2 sakay",
        tag: "TRAIN + BUS",
        vehicle: "Train + Bus",
        sign: `${d.train} → ${d.bus}`,
        note: "Via EDSA",
        steps: [
          `Unang sakay: sundin ang station directions para sa ${d.train}.`,
          "Bumaba sa tamang transfer station at sundin ang exit/transfer signs.",
          `Ikalawang sakay: hanapin ang bus na may karatulang "${d.bus}".`,
          `Kumpirmahin sa konduktor kung saan bababa para sa ${to}.`,
        ],
      },
      {
        id: "konti",
        title: "🚌 Isang Sakay Lang",
        price: Math.round(calcFare(distKm, "bus") + 10),
        time: Math.round((baseMin * 1.1 + 3) * traffic),
        rides: "1 sakay",
        tag: "BUS",
        vehicle: "Bus",
        sign: d.bus,
        note: dirText,
        steps: [
          "Pumunta sa tamang bus stop o terminal.",
          `Hanapin ang bus na may karatulang "${d.bus}".`,
          "Kumpirmahin muna sa konduktor kung diretso ito sa destination mo.",
          `Sabihin na bababa ka sa ${to} at humingi ng landmark o stop reminder.`,
        ],
      },
    ];
  }, [distKm, baseMin, from, to, fromPlace, toPlace]);

  const center: [number, number] = [
    (fromPlace.lat + toPlace.lat) / 2,
    (fromPlace.lng + toPlace.lng) / 2,
  ];

  const inputStyle: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px 17px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontSize: 15,
    outlineColor: "#006747",
  };

  const suggestionStyle: CSSProperties = {
    padding: "12px 14px",
    background: "#fff",
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer",
    color: "#1f2937",
    fontSize: 14,
  };

  return (
    <main
      style={{
        width: "100%",
        maxWidth: 780,
        margin: "0 auto",
        padding: "clamp(14px, 3vw, 28px)",
        boxSizing: "border-box",
        color: "#172033",
      }}
    >
      <header style={{ marginBottom: 22 }}>
        <div style={{ color: "#006747", fontWeight: 800, fontSize: 12, letterSpacing: 1.4 }}>
          PINOY DAILY • COMMUTE COMPANION
        </div>
        <h1 style={{ fontFamily: "Georgia, Times New Roman, serif", fontSize: "clamp(30px, 4vw, 40px)", lineHeight: 1.1, margin: "8px 0", color: "#172033", fontWeight: 500 }}>
          🗺️ Sakay Maps
        </h1>
        <p style={{ color: "#778092", margin: 0, lineHeight: 1.65, maxWidth: 680 }}>
          Hindi sigurado kung anong sasakyan? Hanapin ang ruta at alamin kung anong
          karatula ang dapat mong tingnan sa harap ng jeep o bus.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 12,
          background: "#fff",
          border: "1px solid #e7e5df",
          borderRadius: 20,
          padding: "clamp(18px, 3vw, 26px)",
          boxShadow: "0 2px 5px rgba(20, 30, 25, .06)",
          marginBottom: 18,
        }}
      >
        <div style={{ position: "relative", minWidth: 0 }}>
          <label htmlFor="sakay-from" style={{ display: "block", fontWeight: 700, marginBottom: 7, fontSize: 13 }}>
            📍 SAAN KA GALING?
          </label>
          <input
            id="sakay-from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Hal. FEU Manila"
            autoComplete="off"
            style={inputStyle}
          />
          {from && PLACES.filter((p) => p.name.toLowerCase().includes(from.toLowerCase()) && p.name !== from).slice(0, 5).length > 0 && (
            <div style={{ position: "absolute", zIndex: 1000, top: "100%", left: 0, right: 0, marginTop: 4, border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 28px rgba(15,23,42,.12)" }}>
              {PLACES.filter((p) => p.name.toLowerCase().includes(from.toLowerCase()) && p.name !== from).slice(0, 5).map((p) => (
                <button key={p.name} type="button" onClick={() => setFrom(p.name)} style={{ ...suggestionStyle, width: "100%", textAlign: "left" }}>
                  📍 {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: "relative", minWidth: 0 }}>
          <label htmlFor="sakay-to" style={{ display: "block", fontWeight: 700, marginBottom: 7, fontSize: 13 }}>
            🏁 SAAN KA PUPUNTA?
          </label>
          <input
            id="sakay-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Hal. UE Manila - Recto"
            autoComplete="off"
            style={inputStyle}
          />
          {to && PLACES.filter((p) => p.name.toLowerCase().includes(to.toLowerCase()) && p.name !== to).slice(0, 5).length > 0 && (
            <div style={{ position: "absolute", zIndex: 1000, top: "100%", left: 0, right: 0, marginTop: 4, border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 28px rgba(15,23,42,.12)" }}>
              {PLACES.filter((p) => p.name.toLowerCase().includes(to.toLowerCase()) && p.name !== to).slice(0, 5).map((p) => (
                <button key={p.name} type="button" onClick={() => setTo(p.name)} style={{ ...suggestionStyle, width: "100%", textAlign: "left" }}>
                  🏁 {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#64748b" }}>
          {from && to ? `📏 Tinatayang tuwid na distansya: ${distKm.toFixed(1)} km` : "Pumili ng pinanggalingan at pupuntahan para makita ang gabay."}
        </div>
        <button
          type="button"
          onClick={() => setBeginnerMode((value) => !value)}
          aria-pressed={beginnerMode}
          style={{
            border: "1px solid #006747",
            background: beginnerMode ? "#006747" : "#fff",
            color: beginnerMode ? "#fff" : "#006747",
            borderRadius: 999,
            padding: "9px 13px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {beginnerMode ? "✓ Beginner Guide ON" : "Beginner Guide OFF"}
        </button>
      </div>

      {from && to && (
        <>
          {from === to ? (
            <div style={{ padding: 16, borderRadius: 14, background: "#fff8e8", color: "#8a4b12", marginBottom: 16 }}>
              Magkaiba dapat ang pinanggalingan at destination mo.
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                  gap: 18,
                  alignItems: "start",
                }}
              >
                <section style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 9, alignItems: "center" }}>
                    <h2 style={{ fontFamily: "Georgia, Times New Roman, serif", fontSize: 22, fontWeight: 500, color: "#172033", margin: 0 }}>🧭 Route Map</h2>
                    <span style={{ color: "#64748b", fontSize: 12 }}>Origin → Destination</span>
                  </div>
                  <div style={{ height: "clamp(280px, 42vw, 430px)", borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0", background: "#e2e8f0" }}>
                    <MapContainer key={`${from}-${to}`} center={center} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[fromPlace.lat, fromPlace.lng]}><Popup>📍 {from}</Popup></Marker>
                      <Marker position={[toPlace.lat, toPlace.lng]}><Popup>🏁 {to}</Popup></Marker>
                      <Polyline positions={[[fromPlace.lat, fromPlace.lng], [toPlace.lat, toPlace.lng]]} color="#198754" weight={4} />
                    </MapContainer>
                  </div>
                  <p style={{ fontSize: 12, lineHeight: 1.5, color: "#64748b", marginTop: 8 }}>
                    Paalala: tuwid na linya lamang ang ipinapakita sa mapa, hindi aktuwal na daan o eksaktong sakayan.
                  </p>
                </section>

                <section style={{ minWidth: 0 }}>
                  <h2 style={{ fontFamily: "Georgia, Times New Roman, serif", fontSize: 22, fontWeight: 500, color: "#172033", margin: "0 0 12px" }}>🚍 Mga posibleng biyahe</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    {routes.map((r) => (
                      <article key={r.id} style={{ border: "1px solid #e9e6df", borderRadius: 18, padding: 18, background: "#fff", boxShadow: "0 2px 6px rgba(20,30,25,.05)", minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                          <div>
                            <h3 style={{ fontFamily: "Georgia, Times New Roman, serif", fontSize: 20, fontWeight: 500, color: "#172033", margin: "0 0 8px" }}>{r.title}</h3>
                            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: .5, color: "#006747", background: "#e8f3ee", padding: "5px 8px", borderRadius: 999 }}>
                              {r.tag}
                            </span>
                          </div>
                          <div style={{ textAlign: "right", fontSize: 13, color: "#475569" }}>
                            <strong style={{ display: "block", color: "#111827", fontSize: 17 }}>₱{r.price}</strong>
                            ~{r.time} min • {r.rides}
                          </div>
                        </div>

                        <div style={{ marginTop: 14, borderRadius: 12, padding: 12, background: "#111827", color: "#fff" }}>
                          <div style={{ color: "#cbd5e1", fontSize: 10, fontWeight: 800, letterSpacing: 1.1, marginBottom: 7 }}>
                            HANAPIN SA HARAP NG {r.vehicle.toUpperCase()}
                          </div>
                          <div style={{ fontSize: "clamp(17px, 3vw, 23px)", lineHeight: 1.3, fontWeight: 900, overflowWrap: "anywhere" }}>
                            {r.sign}
                          </div>
                          <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 8 }}>
                            Sample text reference • i-confirm ang ruta sa driver o konduktor.
                          </div>
                        </div>

                        <div style={{ marginTop: 12, fontSize: 13, color: "#475569" }}>
                          <strong style={{ color: "#111827" }}>Direksyon:</strong> {r.note}
                        </div>

                        {beginnerMode && (
                          <div style={{ marginTop: 13, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8, color: "#006747" }}>
                              👣 Paano ito sakyan?
                            </div>
                            <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 7, color: "#334155", fontSize: 13, lineHeight: 1.5 }}>
                              {r.steps.map((step, index) => <li key={index}>{step}</li>)}
                            </ol>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <aside style={{ marginTop: 18, border: "1px solid #eadfbd", background: "#fff9e9", borderRadius: 14, padding: 14, color: "#735b2d", fontSize: 12, lineHeight: 1.6 }}>
                <strong>Importanteng paalala:</strong> Ang mga ruta, karatula, pamasahe, at oras dito ay generated estimates mula sa kasalukuyang sample logic ng app. Hindi pa ito verified na live route information. Bago sumakay, basahin ang karatula sa harap ng sasakyan at kumpirmahin sa driver o konduktor kung dadaan ito sa iyong destination.
              </aside>
            </>
          )}
        </>
      )}

      {!from && !to && (
        <section style={{ border: "1px dashed #d8d5ca", borderRadius: 20, padding: "clamp(24px, 5vw, 40px)", textAlign: "center", background: "#fff" }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>🚌</div>
          <h2 style={{ fontFamily: "Georgia, Times New Roman, serif", margin: "0 0 8px", fontSize: 25, fontWeight: 500, color: "#172033" }}>First time mag-commute?</h2>
          <p style={{ margin: "0 auto", maxWidth: 460, color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
            Ilagay ang pinanggalingan at pupuntahan mo. Ipapakita namin ang mga posibleng sasakyan at ang karatulang dapat mong hanapin.
          </p>
        </section>
      )}
    </main>
  );
}
