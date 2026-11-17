"use client";
import { useState, useMemo, useEffect, type CSSProperties } from "react";
import { useMap } from "react-leaflet";
import dynamic from "next/dynamic";
import PSGCLocationSearch from "@/components/PSGCLocationSearch";
import type { PSGCResult } from "@/lib/psgc-api";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((m) => m.Polyline), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((m) => m.CircleMarker), { ssr: false });

// Keeps the map centered on the latest GPS position (or selected route center).
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

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
  { name: "TriNoma", lat: 14.6619, lng: 121.0335 },
  { name: "Vertis North", lat: 14.6507, lng: 121.0346 },
  { name: "SM Mall of Asia", lat: 14.5350, lng: 120.9820 },
  { name: "Ayala Malls Manila Bay", lat: 14.5295, lng: 120.9825 },
  { name: "SM Manila", lat: 14.5890, lng: 120.9810 },
  { name: "Robinsons Manila", lat: 14.5820, lng: 120.9810 },
  { name: "SM Megamall", lat: 14.5840, lng: 121.0570 },
  { name: "Greenbelt / Ayala Center", lat: 14.5540, lng: 121.0240 },
  { name: "One Ayala", lat: 14.5502, lng: 121.0275 },
  { name: "Market! Market!", lat: 14.5494, lng: 121.0566 },
  { name: "Araneta City / Cubao", lat: 14.6208, lng: 121.0514 },
  { name: "Cubao", lat: 14.6190, lng: 121.0530 },
  { name: "Quiapo", lat: 14.5995, lng: 120.9842 },
  { name: "Sampaloc", lat: 14.6075, lng: 120.9968 },
  { name: "Divisoria", lat: 14.6050, lng: 120.9730 },
  { name: "Intramuros", lat: 14.5890, lng: 120.9740 },
  { name: "Recto", lat: 14.6030, lng: 120.9820 },
  { name: "Baclaran", lat: 14.5340, lng: 120.9920 },
  { name: "Ortigas", lat: 14.5860, lng: 121.0610 },
  { name: "Ayala / Makati", lat: 14.5540, lng: 121.0240 },
  { name: "Pasay", lat: 14.5370, lng: 121.0010 },
  { name: "Manila City Hall", lat: 14.5900, lng: 120.9810 },
  { name: "Espana", lat: 14.6090, lng: 120.9910 },
  { name: "Mendiola", lat: 14.5995, lng: 120.9895 },
];

type VerifiedRoute = {
  id: string;
  from: string;
  to: string;
  mode: "Jeepney" | "Modern jeepney" | "Bus" | "UV Express" | "LRT-1" | "LRT-2" | "MRT-3" | "Train transfer" | "EDSA Busway" | "Walking / local connection";
  vehicle: string;
  signboard?: string;
  boardingPoint: string;
  alightingPoint: string;
  instructionsTl: string[];
  instructionsEn: string[];
  sourceName: string;
  sourceUrl: string;
  checkedOn: string;
  confidence: "verified" | "possible";
};

// Existing station and transfer reference data retained; not used to invent routes.
const RAIL_LINES: { id: string; mode: "LRT-1" | "LRT-2" | "MRT-3" | "EDSA Busway"; stations: string[] }[] = [
  { id: "MRT-3", mode: "MRT-3", stations: ["North Avenue", "Quezon Avenue", "GMA Kamuning", "Araneta Center-Cubao", "Santolan-Annapolis", "Ortigas", "Shaw Boulevard", "Boni", "Guadalupe", "Buendia", "Ayala", "Magallanes", "Taft Avenue"] },
  { id: "LRT-2", mode: "LRT-2", stations: ["Recto", "Legarda", "Pureza", "V. Mapa", "J. Ruiz", "Gilmore", "Betty Go-Belmonte", "Araneta Center-Cubao", "Anonas", "Katipunan", "Santolan", "Marikina-Pasig", "Antipolo"] },
  { id: "LRT-1", mode: "LRT-1", stations: ["Fernando Poe Jr.", "Balintawak", "Monumento", "5th Avenue", "R. Papa", "Abad Santos", "Blumentritt", "Tayuman", "Bambang", "Doroteo Jose", "Carriedo", "Central Terminal", "United Nations", "Pedro Gil", "Quirino", "Vito Cruz", "Gil Puyat", "Libertad", "EDSA", "Baclaran", "Redemptorist-Aseana", "MIA Road", "PITX", "Ninoy Aquino", "Dr. Santos"] },
  { id: "EDSA Busway", mode: "EDSA Busway", stations: ["Monumento", "Bagong Barrio", "Balintawak", "Kaingin", "Roosevelt", "SM North EDSA", "North Avenue", "Philam", "Quezon Avenue", "Kamuning", "Nepa Q-Mart", "Main Avenue", "Santolan", "Ortigas", "Guadalupe", "Buendia", "Ayala", "Tramo", "Taft Avenue", "Roxas Boulevard", "SM Mall of Asia", "BVA", "Macapagal-Aseana", "PITX"] },
];

const PLACE_STATION: Record<string, string> = {
  "FEU Manila": "LRT-2:Legarda",
  "UE Manila - Recto": "LRT-2:Recto",
  "NU Manila - Sampaloc": "LRT-2:Legarda",
  "San Beda University - Mendiola": "LRT-2:Legarda",
  "Mapua University - Intramuros": "LRT-1:Central Terminal",
  "Adamson University": "LRT-1:United Nations",
  "UST - Espana": "LRT-2:Legarda",
  "UP Diliman": "LRT-2:Katipunan",
  "Ateneo de Manila": "LRT-2:Katipunan",
  "PUP Manila - Sta. Mesa": "LRT-2:Pureza",
  "TUP Manila": "LRT-1:United Nations",
  "PLM - Intramuros": "LRT-1:Central Terminal",
  "SM North EDSA": "MRT-3:North Avenue",
  "Mall of Asia (MOA)": "EDSA Busway:SM Mall of Asia",
  "SM Manila": "LRT-1:Central Terminal",
  "Robinsons Manila": "LRT-1:Pedro Gil",
  "SM Megamall": "MRT-3:Ortigas",
  "Greenbelt / Ayala": "MRT-3:Ayala",
  "Quiapo": "LRT-1:Carriedo",
  "Sampaloc": "LRT-2:Legarda",
  "Divisoria": "LRT-2:Recto",
  "Intramuros": "LRT-1:Central Terminal",
  "Cubao": "MRT-3:Araneta Center-Cubao",
  "Recto": "LRT-2:Recto",
  "Baclaran": "LRT-1:Baclaran",
  "Ortigas": "MRT-3:Ortigas",
  "Ayala / Makati": "MRT-3:Ayala",
  "Pasay": "MRT-3:Taft Avenue",
  "Manila City Hall": "LRT-1:Central Terminal",
  "Espana": "LRT-2:Legarda",
  "Mendiola": "LRT-2:Legarda",
};

const TRANSFERS: [string, string][] = [
  ["MRT-3:Araneta Center-Cubao", "LRT-2:Araneta Center-Cubao"],
  ["MRT-3:Taft Avenue", "LRT-1:EDSA"],
  ["LRT-1:Doroteo Jose", "LRT-2:Recto"],
  ["EDSA Busway:North Avenue", "MRT-3:North Avenue"],
  ["EDSA Busway:Taft Avenue", "MRT-3:Taft Avenue"],
  ["EDSA Busway:Ortigas", "MRT-3:Ortigas"],
  ["EDSA Busway:Guadalupe", "MRT-3:Guadalupe"],
  ["EDSA Busway:Ayala", "MRT-3:Ayala"],
  ["EDSA Busway:PITX", "LRT-1:PITX"],
];

const VERIFIED_ROUTES: VerifiedRoute[] = [
  {
    id: "sm-north-to-sm-megamall",
    from: "SM North EDSA",
    to: "SM Megamall",
    mode: "MRT-3",
    vehicle: "MRT-3 Train",
    boardingPoint: "MRT-3 North Avenue Station",
    alightingPoint: "MRT-3 Ortigas Station",
    instructionsTl: [
      "Pumunta sa MRT-3 North Avenue Station.",
      "Sumakay ng southbound train na papuntang Taft Avenue.",
      "Bumaba sa MRT-3 Ortigas Station.",
      "Mula sa Ortigas Station, sundan ang pedestrian signs papuntang SM Megamall.",
      "Magtanong sa station staff o guard para makumpirma ang tamang exit at walking direction.",
    ],
    instructionsEn: [
      "Go to MRT-3 North Avenue Station.",
      "Board the southbound train bound for Taft Avenue.",
      "Get off at MRT-3 Ortigas Station.",
      "From Ortigas Station, follow pedestrian signs toward SM Megamall.",
      "Ask station staff or security to confirm the correct exit and walking direction.",
    ],
    sourceName: "DOTr-MRT3",
    sourceUrl: "https://www.dotrmrt3.gov.ph/",
    checkedOn: "17 Nov 2026",
    confidence: "verified",
  },
];

export default function SakayPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [guideLanguage, setGuideLanguage] = useState<"tl" | "en">("tl");
  const [fromPSGC, setFromPSGC] = useState<PSGCResult | null>(null);
  const [toPSGC, setToPSGC] = useState<PSGCResult | null>(null);

  // GPS is requested only after the commuter presses the location button.
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [trackingLocation, setTrackingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (!trackingLocation) return;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Hindi supported ng browser ang GPS location.");
      setTrackingLocation(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        setLocationError("");
      },
      (error) => {
        setLocationError(
          error.code === 1
            ? "Hindi pinayagan ang location access. I-check ang browser permissions at subukan ulit."
            : "Hindi makuha ang iyong location. Siguraduhing naka-on ang location service at subukan ulit."
        );
        setTrackingLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [trackingLocation]);

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

  const fromPlace = PLACES.find((p) => p.name === from) ?? null;
  const toPlace = PLACES.find((p) => p.name === to) ?? null;

  const distKm = useMemo(() => {
    if (!fromPlace || !toPlace) return 0;
    const R = 6371;
    const dLat = ((toPlace.lat - fromPlace.lat) * Math.PI) / 180;
    const dLng = ((toPlace.lng - fromPlace.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((fromPlace.lat * Math.PI) / 180) *
        Math.cos((toPlace.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, [fromPlace, toPlace]);

  // Keep the existing exact-match verified route lookup unchanged.
  const routes = useMemo(() => {
    if (!from || !to || from === to) return [];
    return VERIFIED_ROUTES.filter(
      (route) =>
        route.from.toLowerCase() === from.toLowerCase() &&
        route.to.toLowerCase() === to.toLowerCase()
    );
  }, [from, to]);

  const center: [number, number] = fromPlace && toPlace
    ? [(fromPlace.lat + toPlace.lat) / 2, (fromPlace.lng + toPlace.lng) / 2]
    : currentLocation ?? [14.5995, 120.9842];

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

  const showMap = Boolean(currentLocation || (fromPlace && toPlace));

  return (
    <main style={{ width: "100%", maxWidth: 780, margin: "0 auto", padding: "clamp(14px, 3vw, 28px)", boxSizing: "border-box", color: "#172033" }}>
      <header style={{ marginBottom: 22 }}>
        <div style={{ color: "#006747", fontWeight: 800, fontSize: 12, letterSpacing: 1.4 }}>PINOY DAILY • COMMUTE COMPANION</div>
        <h1 style={{ fontFamily: "Georgia, Times New Roman, serif", fontSize: "clamp(30px, 4vw, 40px)", lineHeight: 1.1, margin: "8px 0", color: "#172033", fontWeight: 500 }}>🗺️ Sakay Maps</h1>
        <p style={{ color: "#778092", margin: 0, lineHeight: 1.65, maxWidth: 680 }}>Hindi sigurado kung anong sasakyan? Tingnan ang commute guide at kumpirmahin ang karatula sa harap ng jeep o bus.</p>
      </header>

      <section style={{ border: "1px solid #dbeafe", background: "#f8fbff", borderRadius: 18, padding: 16, marginBottom: 18 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => { setLocationError(""); setTrackingLocation(true); }}
            disabled={trackingLocation}
            style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid #1685ff", background: trackingLocation ? "#64748b" : "#1685ff", color: "white", cursor: trackingLocation ? "default" : "pointer", fontWeight: 700 }}
          >
            {trackingLocation ? "📍 Finding your location…" : "📍 Use My Current Location"}
          </button>
          {trackingLocation && (
            <button type="button" onClick={() => setTrackingLocation(false)} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", cursor: "pointer", fontWeight: 700 }}>
              Stop sharing location
            </button>
          )}
        </div>
        {locationError && <p role="alert" style={{ color: "#dc3545", fontSize: 13, margin: "10px 0 0" }}>{locationError}</p>}
        {currentLocation && !locationError && <p style={{ color: "#17663a", fontSize: 13, margin: "10px 0 0" }}>✓ Nakuha ang current location mo. Gumagalaw ang blue dot habang naka-on ang tracking.</p>}
        <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5, margin: "8px 0 0" }}>
          Hihingi lang ng GPS permission kapag pinindot mo ang button. Ang location ay ginagamit lang para ipakita ang blue dot sa mapang ito; hindi ito ise-save sa route database. Hindi pa ginagamit ang GPS coordinates bilang automatic commute origin.
        </p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12, background: "#fff", border: "1px solid #e7e5df", borderRadius: 20, padding: "clamp(18px, 3vw, 26px)", boxShadow: "0 2px 5px rgba(20, 30, 25, .06)", marginBottom: 18 }}>
        <div style={{ position: "relative", minWidth: 0 }}>
          <label htmlFor="sakay-from" style={{ display: "block", fontWeight: 700, marginBottom: 7, fontSize: 13 }}>📍 SAAN KA GALING?</label>
          <input id="sakay-from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Hal. FEU Manila" autoComplete="off" style={inputStyle} />
          {from && PLACES.filter((p) => p.name.toLowerCase().includes(from.toLowerCase()) && p.name !== from).slice(0, 5).length > 0 && (
            <div style={{ position: "absolute", zIndex: 1000, top: "100%", left: 0, right: 0, marginTop: 4, border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 28px rgba(15,23,42,.12)" }}>
              {PLACES.filter((p) => p.name.toLowerCase().includes(from.toLowerCase()) && p.name !== from).slice(0, 5).map((p) => <button key={p.name} type="button" onClick={() => setFrom(p.name)} style={{ ...suggestionStyle, width: "100%", textAlign: "left" }}>📍 {p.name}</button>)}
            </div>
          )}
        </div>
        <div style={{ position: "relative", minWidth: 0 }}>
          <label htmlFor="sakay-to" style={{ display: "block", fontWeight: 700, marginBottom: 7, fontSize: 13 }}>🏁 SAAN KA PUPUNTA?</label>
          <input id="sakay-to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Hal. UE Manila - Recto" autoComplete="off" style={inputStyle} />
          {to && PLACES.filter((p) => p.name.toLowerCase().includes(to.toLowerCase()) && p.name !== to).slice(0, 5).length > 0 && (
            <div style={{ position: "absolute", zIndex: 1000, top: "100%", left: 0, right: 0, marginTop: 4, border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 28px rgba(15,23,42,.12)" }}>
              {PLACES.filter((p) => p.name.toLowerCase().includes(to.toLowerCase()) && p.name !== to).slice(0, 5).map((p) => <button key={p.name} type="button" onClick={() => setTo(p.name)} style={{ ...suggestionStyle, width: "100%", textAlign: "left" }}>🏁 {p.name}</button>)}
            </div>
          )}
        </div>
      </section>

      <section style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: 16,
  padding: 18,
  border: "1px solid #dbeafe",
  borderRadius: 18,
  background: "#f8fbff",
  marginBottom: 18
}}>
  <div>
    <label style={{ display: "block", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>
      🇵🇭 SEARCH PHILIPPINE ORIGIN
    </label>
    <PSGCLocationSearch
      placeholder="Search city, municipality, barangay..."
      onSelect={(location) => setFromPSGC(location)}
    />
    {fromPSGC && (
      <p style={{ fontSize: 12, color: "#006747" }}>
        Selected: {fromPSGC.fullName}
      </p>
    )}
  </div>

  <div>
    <label style={{ display: "block", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>
      🇵🇭 SEARCH PHILIPPINE DESTINATION
    </label>
    <PSGCLocationSearch
      placeholder="Search city, municipality, barangay..."
      onSelect={(location) => setToPSGC(location)}
    />
    {toPSGC && (
      <p style={{ fontSize: 12, color: "#006747" }}>
        Selected: {toPSGC.fullName}
      </p>
    )}
  </div>
</section>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#64748b" }}>
          {fromPlace && toPlace ? `📏 Tinatayang tuwid na distansya: ${distKm.toFixed(1)} km` : "Pumili ng eksaktong lugar mula sa suggestions para makita ang gabay."}
        </div>
        <button type="button" onClick={() => setBeginnerMode((value) => !value)} aria-pressed={beginnerMode} style={{ border: "1px solid #006747", background: beginnerMode ? "#006747" : "#fff", color: beginnerMode ? "#fff" : "#006747", borderRadius: 999, padding: "9px 13px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
          {beginnerMode ? "✓ Beginner Guide ON" : "Beginner Guide OFF"}
        </button>
      </div>

      {showMap && (
        <section style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 9, alignItems: "center" }}>
            <h2 style={{ fontFamily: "Georgia, Times New Roman, serif", fontSize: 22, fontWeight: 500, color: "#172033", margin: 0 }}>🧭 {fromPlace && toPlace ? "Map Guide" : "Your Current Location"}</h2>
            <span style={{ color: "#64748b", fontSize: 12 }}>{currentLocation ? "Blue dot = ikaw" : "Origin → Destination"}</span>
          </div>
          <div style={{ height: "clamp(280px, 42vw, 430px)", borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0", background: "#e2e8f0" }}>
            <MapContainer key={`${from}-${to}`} center={center} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
              <MapUpdater center={center} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {currentLocation && (
                <CircleMarker center={currentLocation} radius={9} pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#1685ff", fillOpacity: 1 }}>
                  <Popup>📍 Nandito ka ngayon</Popup>
                </CircleMarker>
              )}
              {fromPlace && toPlace && <>
                <Marker position={[fromPlace.lat, fromPlace.lng]}><Popup>📍 {from}</Popup></Marker>
                <Marker position={[toPlace.lat, toPlace.lng]}><Popup>🏁 {to}</Popup></Marker>
                <Polyline positions={[[fromPlace.lat, fromPlace.lng], [toPlace.lat, toPlace.lng]]} pathOptions={{ color: "#198754", weight: 4, dashArray: "8 8", opacity: 0.85 }} />
              </>}
            </MapContainer>
          </div>
          {fromPlace && toPlace && <p style={{ fontSize: 12, lineHeight: 1.5, color: "#64748b", marginTop: 8 }}>The dashed line is a visual guide connecting your selected places. It is not a verified road path or jeepney/bus route, and it does not identify an exact boarding point.</p>}
        </section>
      )}

      {from && to && (
        <>
          {from === to ? (
            <div style={{ padding: 16, borderRadius: 14, background: "#fff8e8", color: "#8a4b12", marginBottom: 16 }}>Magkaiba dapat ang pinanggalingan at destination mo.</div>
          ) : fromPlace && toPlace ? (
            <>
              <section style={{ minWidth: 0 }}>
                <h2 style={{ fontFamily: "Georgia, Times New Roman, serif", fontSize: 22, fontWeight: 500, color: "#172033", margin: "0 0 12px" }}>🚍 Mga posibleng biyahe</h2>
                <div role="group" aria-label="Guide language" style={{ display: "inline-flex", padding: 3, gap: 3, borderRadius: 999, background: "#f2f1eb", border: "1px solid #e7e5df", marginBottom: 12 }}>
                  <button type="button" onClick={() => setGuideLanguage("tl")} aria-pressed={guideLanguage === "tl"} style={{ border: 0, borderRadius: 999, padding: "7px 13px", background: guideLanguage === "tl" ? "#006747" : "transparent", color: guideLanguage === "tl" ? "#fff" : "#53605b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Tagalog</button>
                  <button type="button" onClick={() => setGuideLanguage("en")} aria-pressed={guideLanguage === "en"} style={{ border: 0, borderRadius: 999, padding: "7px 13px", background: guideLanguage === "en" ? "#006747" : "transparent", color: guideLanguage === "en" ? "#fff" : "#53605b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>English</button>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {routes.length === 0 ? (
                    <article style={{ border: "1px solid #eadfbd", borderRadius: 18, padding: 18, background: "#fff9e9", color: "#735b2d", lineHeight: 1.65 }}>
                      <strong style={{ display: "block", color: "#60491f", marginBottom: 8 }}>{guideLanguage === "tl" ? "Wala pang verified na commute route para sa eksaktong biyahe na ito." : "There is no verified commute route for this exact trip yet."}</strong>
                      {guideLanguage === "tl" ? "Wala pang sapat na impormasyon para magbigay ng ligtas na station-based route sa eksaktong biyahe na ito. Posibleng kailangan ng jeep, bus o UV Express, pero hindi kami mag-iimbento ng karatula. Itanong sa dispatcher kung anong sasakyan ang dadaan mismo sa destination at kumpirmahin ang karatula sa harap bago sumakay." : "There is not enough information yet to suggest a safe station-based route for this exact trip. A jeepney, bus, or UV Express may be needed, but we will not invent a signboard. Ask the dispatcher which vehicle passes your destination and confirm the front signboard before boarding."}
                    </article>
                  ) : routes.map((r) => (
                    <article key={r.id} style={{ border: "1px solid #e9e6df", borderRadius: 18, padding: 18, background: "#fff", minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <h3 style={{ fontFamily: "Georgia, Times New Roman, serif", fontSize: 20, fontWeight: 500, color: "#172033", margin: 0 }}>{r.mode}: {r.from} → {r.to}</h3>
                        <span style={{ borderRadius: 999, padding: "4px 9px", fontSize: 10, fontWeight: 800, background: r.confidence === "verified" ? "#e7f6ed" : "#fff3d6", color: r.confidence === "verified" ? "#17663a" : "#855b0a" }}>{r.confidence === "verified" ? (guideLanguage === "tl" ? "KUMPIRMADO" : "VERIFIED") : (guideLanguage === "tl" ? "POSIBLENG RUTA" : "POSSIBLE ROUTE")}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Source: {r.sourceName} · {guideLanguage === "tl" ? "Sinuri:" : "Checked:"} {r.checkedOn}</div>
                      <div style={{ marginTop: 12, borderRadius: 12, padding: 12, background: "#111827", color: "#fff" }}>
                        <div style={{ color: "#cbd5e1", fontSize: 10, fontWeight: 800, letterSpacing: 1.1, marginBottom: 7 }}>{r.signboard ? (guideLanguage === "tl" ? "KARATULA SA HARAP NG SASAKYAN" : "FRONT SIGNBOARD") : (guideLanguage === "tl" ? "PAALALA SA KARATULA" : "SIGNBOARD NOTE")}</div>
                        <div style={{ fontSize: "clamp(17px, 3vw, 23px)", lineHeight: 1.3, fontWeight: 900, overflowWrap: "anywhere" }}>{r.signboard || (guideLanguage === "tl" ? "Walang karatulang na-verify" : "No verified signboard")}</div>
                      </div>
                      <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}><strong>{guideLanguage === "tl" ? "Sakayan:" : "Boarding point:"}</strong> {r.boardingPoint}<br /><strong>{guideLanguage === "tl" ? "Babaan:" : "Drop-off point:"}</strong> {r.alightingPoint}</p>
                      <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 7, color: "#334155", fontSize: 13, lineHeight: 1.5 }}>{(guideLanguage === "tl" ? r.instructionsTl : r.instructionsEn).map((step, index) => <li key={index}>{step}</li>)}</ol>
                      <a href={r.sourceUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 12, color: "#006747", fontWeight: 700, fontSize: 12 }}>{guideLanguage === "tl" ? "Tingnan ang source" : "View source"} ↗</a>
                    </article>
                  ))}
                </div>
              </section>
              <aside style={{ marginTop: 18, border: "1px solid #eadfbd", background: "#fff9e9", borderRadius: 14, padding: 14, color: "#735b2d", fontSize: 12, lineHeight: 1.6 }}>
                <strong>{guideLanguage === "tl" ? "Paalala sa accuracy:" : "Accuracy notice:"}</strong> {guideLanguage === "tl" ? "Ang KUMPIRMADO ay may source para sa route/station sequence. Ang POSIBLENG RUTA ay mungkahing station-based connection; hindi pa kumpirmado ang eksaktong lakad, entrance/exit, o last-mile na jeep/bus. Para sa jeep at bus, huwag sumakay hangga't hindi tugma ang karatula sa harap at hindi kinukumpirma ng driver/dispatcher na dadaan sa destination." : "VERIFIED means the route/station sequence has a source. POSSIBLE ROUTE is a suggested station-based connection; exact walking access, entrances/exits, and last-mile jeep/bus details are not confirmed. For jeepneys and buses, board only after the front signboard matches and the driver/dispatcher confirms the destination."}
              </aside>
            </>
          ) : (
            <div style={{ padding: 16, borderRadius: 14, background: "#fff8e8", color: "#8a4b12", marginBottom: 16 }}>{guideLanguage === "tl" ? "Piliin ang eksaktong pinanggalingan at destination mula sa dropdown suggestions. Hindi kami magpapakita ng route para sa hindi kilalang lokasyon." : "Choose the exact origin and destination from the suggestions. We will not show a route for an unrecognized location."}</div>
          )}
        </>
      )}

      {!from && !to && !currentLocation && (
        <section style={{ border: "1px dashed #d8d5ca", borderRadius: 20, padding: "clamp(24px, 5vw, 40px)", textAlign: "center", background: "#fff" }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>🚌</div>
          <h2 style={{ fontFamily: "Georgia, Times New Roman, serif", margin: "0 0 8px", fontSize: 25, fontWeight: 500, color: "#172033" }}>First time mag-commute?</h2>
          <p style={{ margin: "0 auto", maxWidth: 460, color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>Ilagay ang pinanggalingan at pupuntahan mo. Ipapakita lang namin ang rutang may sapat na kumpirmasyon. Kung wala pa, sasabihin namin iyon kaysa manghula.</p>
        </section>
      )}
    </main>
  );
}
