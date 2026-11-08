"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then(m => m.Circle), { ssr: false });

export default function SakayPage() {
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [speed, setSpeed] = useState(0);
  const [status, setStatus] = useState("Finding your location...");

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("This device has no GPS");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setPos([p.coords.latitude, p.coords.longitude]);
        setSpeed(p.coords.speed ? Math.round(p.coords.speed * 3.6) : 0);
        setStatus("You are live! Your marker is moving with you!");
      },
      () => setStatus("Please allow Location so your marker can move!"),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return (
    <div style={{ padding: 12 }}>
      <h1 style={{ fontSize: 22 }}>🗺️ MAP GUIDE - LIVE</h1>
      <p style={{ fontSize: 13, color: "#666" }}>{status}</p>
      <div style={{ background: "#fff", padding: 12, borderRadius: 14, display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div><b>📍 Your Location</b><br/><span style={{ fontSize: 12 }}>{pos ? `${pos[0].toFixed(5)}, ${pos[1].toFixed(5)}` : "Loading..."}</span></div>
        <div style={{ textAlign: "right" }}><b>🚶 {speed} km/h</b><br/><span style={{ fontSize: 12, color: "green" }}>● LIVE</span></div>
      </div>
      <div style={{ height: 420, borderRadius: 16, overflow: "hidden", border: "2px solid #ddd" }}>
        {pos ? (
          <MapContainer center={pos} zoom={17} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={pos}><Popup>🧍 This is you! You are moving!</Popup></Marker>
            <Circle center={pos} radius={30} pathOptions={{ color: "#1877f2", fillColor: "#1877f2", fillOpacity: 0.2 }} />
          </MapContainer>
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#eee" }}>⏳ Finding your location... Please allow Location!</div>
        )}
      </div>
      <div style={{ background: "#fff7e6", padding: 12, borderRadius: 12, marginTop: 10, fontSize: 13 }}>
        <b>How to test:</b><br/>1. Open this on your <b>phone</b> - PC has no GPS<br/>2. When it asks "Allow Location?" - Click <b>Allow</b><br/>3. Walk around - your blue dot will move too!
      </div>
    </div>
  );
}