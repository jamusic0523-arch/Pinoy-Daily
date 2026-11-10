"use client";
import { useState } from "react";

type Route = { title: string; fare: number; time: string; steps: string[]; tag: string };

const ROUTES: Route[] = [
  { title: "Pinakamura", fare: 45, time: "1 hr 25 min", tag: "💰 Tipid", steps: ["MRT-3 SM North → Taft Ave (₱30)", "Jeep Taft → MOA (₱15)", "Lakad 5 min sa Seaside"] },
  { title: "Pinakamabilis", fare: 65, time: "1 hr 5 min", tag: "⚡ Mabilis", steps: ["MRT-3 SM North → Taft Ave (₱30)", "Bus / EDSA Carousel Taft → MOA (₱35)"] },
  { title: "Pinaka-konti Lipat", fare: 80, time: "1 hr 20 min", tag: "🚌 1 Sakay", steps: ["Bus SM North → PITX / MOA (₱80)", "Baba sa MOA mismo"] },
];

export default function MapGuideShop() {
  const [from, setFrom] = useState("SM North EDSA");
  const [to, setTo] = useState("SM MOA");
  const [searched, setSearched] = useState(false);
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(from + " to " + to)}&output=embed`;
  const swap = () => { setFrom(to); setTo(from); };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Map Guide</h1>
      <p style={{ color: "#666" }}>Find the cheapest route in Metro Manila</p>

      <p style={{ fontWeight: "bold", fontSize: 12, marginTop: 20 }}>WHERE ARE YOU NOW?</p>
      <input value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 12, background: "white" }} />

      <button onClick={swap} style={{ width: "100%", padding: 8, margin: "8px 0", background: "#f0f0f0", border: "none", borderRadius: 12, fontWeight: "bold" }}>🔄 Swap</button>

      <p style={{ fontWeight: "bold", fontSize: 12 }}>WHERE ARE YOU GOING?</p>
      <input value={to} onChange={(e) => setTo(e.target.value)} style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 12, background: "white" }} />

      <button onClick={() => setSearched(true)} style={{ width: "100%", padding: 14, marginTop: 12, background: "black", color: "white", borderRadius: 12, fontWeight: "bold" }}>Find My Route</button>

      {searched && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
            {ROUTES.map((r) => (
              <div key={r.title} style={{ background: "white", padding: 16, borderRadius: 16, border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <b>{r.title} <span style={{ fontSize: 11, background: "#dcfce7", padding: "2px 8px", borderRadius: 99 }}>{r.tag}</span></b>
                  <b style={{ fontSize: 18 }}>₱{r.fare}</b>
                </div>
                <p style={{ fontSize: 12, color: "#888" }}>{r.time}</p>
                {r.steps.map((s, i) => <p key={i} style={{ fontSize: 13, margin: "4px 0" }}>• {s}</p>)}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, height: 340, borderRadius: 16, overflow: "hidden", border: "1px solid #ddd" }}>
            <iframe title="map" src={mapUrl} style={{ width: "100%", height: "100%", border: 0 }} />
          </div>
          <p style={{ fontSize: 11, color: "#999", textAlign: "center", marginTop: 8 }}>Map is for visual guide only. Fare is estimate.</p>
        </>
      )}
    </div>
  );
}