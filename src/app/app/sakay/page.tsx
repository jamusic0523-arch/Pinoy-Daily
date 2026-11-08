"use client";
import { useState } from "react";

export default function MapGuidePage() {
  const [from, setFrom] = useState("SM North EDSA");
  const [to, setTo] = useState("SM MOA");
  const [searched, setSearched] = useState(false);
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(from + " to " + to)}&output=embed`;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Map Guide</h1>
      <p style={{ color: "#666" }}>Find the cheapest route in Metro Manila</p>
      <p style={{ fontWeight: "bold", fontSize: 12, marginTop: 20 }}>WHERE ARE YOU NOW?</p>
      <input value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 12, background: "white" }} />
      <p style={{ fontWeight: "bold", fontSize: 12, marginTop: 12 }}>WHERE ARE YOU GOING?</p>
      <input value={to} onChange={(e) => setTo(e.target.value)} style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 12, background: "white" }} />
      <button onClick={() => setSearched(true)} style={{ width: "100%", padding: 14, marginTop: 12, background: "black", color: "white", borderRadius: 12, fontWeight: "bold" }}>Find My Route</button>
      <div style={{ marginTop: 20, height: 350, borderRadius: 16, overflow: "hidden", border: "1px solid #ddd" }}>
        <iframe title="map" src={mapUrl} style={{ width: "100%", height: "100%", border: 0 }} />
      </div>
      {searched && <div style={{ marginTop: 16, padding: 16, background: "white", borderRadius: 16 }}><p style={{ fontWeight: "bold" }}>Vehicle: MRT + Bus / Jeep</p><p>{from} → {to}</p></div>}
    </div>
  );
}