
"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useMap } from "react-leaflet";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false }
);

type Place = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type RouteGuide = {
  from: string;
  to: string;
  mode: string;
  vehicle: string;
  signboard: string | null;
  boardingPoint: string;
  alightingPoint: string;
  stepsTl: string[];
  stepsEn: string[];
  sourceName: string;
  sourceUrl: string;
  checkedOn: string;
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);

  return null;
}

function LocationSearch({
  label,
  placeholder,
  value,
  onSelect,
}: {
  label: string;
  placeholder: string;
  value: Place | null;
  onSelect: (place: Place | null) => void;
}) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuery(value?.name ?? "");
  }, [value]);

  useEffect(() => {
    const clean = query.trim();

    if (clean.length < 3 || (value && clean === value.name)) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const url = new URL("https://photon.komoot.io/api/");
        url.searchParams.set("q", clean);
        url.searchParams.set("limit", "7");
        url.searchParams.set("lang", "en");
        url.searchParams.set("lat", "14.5995");
        url.searchParams.set("lon", "120.9842");

        const response = await fetch(url.toString(), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Search unavailable");
        }

        const data = await response.json();

        const places: Place[] = (data.features ?? [])
          .filter((item: any) => {
            const country = item.properties?.country ?? "";
            return country.toLowerCase().includes("philippines");
          })
          .map((item: any, index: number) => {
            const properties = item.properties ?? {};
            const coordinates = item.geometry?.coordinates ?? [];

            const name =
              properties.name ||
              properties.street ||
              properties.city ||
              "Unnamed location";

            const addressParts = [
              properties.street,
              properties.district,
              properties.city,
              properties.state,
              properties.country,
            ].filter(Boolean);

            return {
              id: `${properties.osm_type ?? "place"}-${properties.osm_id ?? index}`,
              name,
              address: [...new Set(addressParts)].join(", "),
              lng: Number(coordinates[0]),
              lat: Number(coordinates[1]),
            };
          })
          .filter(
            (place: Place) =>
              Number.isFinite(place.lat) &&
              Number.isFinite(place.lng)
          );

        setResults(places);
        if (places.length === 0) {
          setError("Walang nahanap. Subukan ang mas kumpletong pangalan.");
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Hindi available ang location search. Subukan ulit.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 700);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, value]);

  const inputStyle: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px 16px",
    borderRadius: 13,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#172033",
    fontSize: 15,
    outlineColor: "#006747",
  };

  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <label
        style={{
          display: "block",
          fontWeight: 800,
          marginBottom: 8,
          fontSize: 13,
          color: "#334155",
        }}
      >
        {label}
      </label>

      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          onSelect(null);
        }}
        placeholder={placeholder}
        autoComplete="off"
        style={inputStyle}
      />

      {loading && (
        <p style={{ fontSize: 12, color: "#64748b", margin: "7px 3px" }}>
          Searching locations...
        </p>
      )}

      {error && !loading && (
        <p style={{ fontSize: 12, color: "#a16207", margin: "7px 3px" }}>
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div
          style={{
            position: "absolute",
            zIndex: 1000,
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 5,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 13,
            overflow: "hidden",
            boxShadow: "0 12px 28px rgba(15,23,42,.14)",
          }}
        >
          {results.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => {
                onSelect(place);
                setQuery(place.name);
                setResults([]);
                setError("");
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "12px 14px",
                textAlign: "left",
                border: 0,
                borderBottom: "1px solid #f1f5f9",
                background: "#fff",
                cursor: "pointer",
                color: "#172033",
              }}
            >
              <strong style={{ display: "block", fontSize: 14 }}>
                📍 {place.name}
              </strong>
              <span
                style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: 11,
                  marginTop: 3,
                }}
              >
                {place.address}
              </span>
            </button>
          ))}
        </div>
      )}

      {value && (
        <p style={{ color: "#17663a", fontSize: 11, margin: "6px 3px" }}>
          ✓ Selected: {value.address || value.name}
        </p>
      )}
    </div>
  );
}

// Only routes with reviewed transport information belong here.
// Do not add guessed jeepney or bus signboards.
const VERIFIED_ROUTES: RouteGuide[] = [
  {
    from: "SM North EDSA",
    to: "SM Megamall",
    mode: "MRT-3",
    vehicle: "MRT-3 Train",
    signboard: null,
    boardingPoint: "MRT-3 North Avenue Station",
    alightingPoint: "MRT-3 Ortigas Station",
    stepsTl: [
      "Mula sa SM North EDSA, pumunta sa MRT-3 North Avenue Station.",
      "Pumasok sa station at sundin ang southbound platform papuntang Taft Avenue.",
      "Sumakay ng MRT-3 train na southbound.",
      "Bumaba sa Ortigas Station.",
      "Sundin ang pedestrian signs papuntang SM Megamall. Magtanong sa station staff kung hindi sigurado sa exit.",
    ],
    stepsEn: [
      "From SM North EDSA, go to MRT-3 North Avenue Station.",
      "Enter the station and follow signs to the southbound platform toward Taft Avenue.",
      "Board the southbound MRT-3 train.",
      "Get off at Ortigas Station.",
      "Follow pedestrian signs toward SM Megamall. Ask station staff if unsure about the exit.",
    ],
    sourceName: "DOTr-MRT3",
    sourceUrl: "https://www.dotrmrt3.gov.ph/",
    checkedOn: "17 Nov 2026",
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export default function SakayPage() {
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [currentLocation, setCurrentLocation] =
    useState<[number, number] | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [guideLanguage, setGuideLanguage] = useState<"tl" | "en">("tl");
  const [beginnerMode, setBeginnerMode] = useState(true);

  useEffect(() => {
    import("leaflet/dist/leaflet.css");

    import("leaflet").then((L) => {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("Hindi supported ng browser ang GPS.");
      return;
    }

    setGettingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);
        setGettingLocation(false);
      },
      (error) => {
        setLocationError(
          error.code === 1
            ? "Hindi pinayagan ang location access. I-check ang browser permissions."
            : "Hindi makuha ang location. Subukan ulit."
        );
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );
  }

  const route = useMemo(() => {
    if (!from || !to) return null;

    return (
      VERIFIED_ROUTES.find(
        (item) =>
          normalize(from.name).includes(normalize(item.from)) &&
          normalize(to.name).includes(normalize(item.to))
      ) ?? null
    );
  }, [from, to]);

  const center: [number, number] = from && to
    ? [(from.lat + to.lat) / 2, (from.lng + to.lng) / 2]
    : from
      ? [from.lat, from.lng]
      : to
        ? [to.lat, to.lng]
        : currentLocation ?? [14.5995, 120.9842];

  const showMap = Boolean(from || to || currentLocation);

  return (
    <main
      style={{
        width: "100%",
        maxWidth: 850,
        margin: "0 auto",
        padding: "clamp(14px, 3vw, 28px)",
        boxSizing: "border-box",
        color: "#172033",
      }}
    >
      <header style={{ marginBottom: 22 }}>
        <div
          style={{
            color: "#006747",
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: 1.4,
          }}
        >
          PINOY DAILY • COMMUTE COMPANION
        </div>

        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(30px, 4vw, 40px)",
            fontWeight: 500,
            margin: "8px 0",
          }}
        >
          🗺️ Sakay Maps
        </h1>

        <p style={{ color: "#64748b", lineHeight: 1.65, margin: 0 }}>
          Alamin kung saan sasakay, anong sasakyan ang hahanapin,
          at saan bababa. May gabay para sa first-time commuters.
        </p>
      </header>

      <section
        style={{
          background: "#f8fbff",
          border: "1px solid #dbeafe",
          borderRadius: 17,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: 0,
            background: "#1685ff",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {gettingLocation
            ? "📍 Getting your location..."
            : "📍 Use My Current Location"}
        </button>

        {locationError && (
          <p role="alert" style={{ color: "#dc3545", fontSize: 13 }}>
            {locationError}
          </p>
        )}

        {currentLocation && (
          <p style={{ color: "#17663a", fontSize: 13 }}>
            ✓ Ipinapakita ang iyong exact location sa mapa.
          </p>
        )}

        <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>
          GPS permission ay hihingin lamang kapag pinindot mo ang button.
          Blue dot lang ang ipapakita. Walang live tracking at hindi
          sine-save ang GPS coordinates sa route database.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: 14,
          background: "#fff",
          border: "1px solid #e7e5df",
          borderRadius: 18,
          padding: 18,
          marginBottom: 16,
          boxShadow: "0 2px 5px rgba(20,30,25,.05)",
        }}
      >
        <LocationSearch
          label="📍 SAAN KA GALING?"
          placeholder="Hal. SM North EDSA, Quezon City"
          value={from}
          onSelect={setFrom}
        />

        <LocationSearch
          label="🏁 SAAN KA PUPUNTA?"
          placeholder="Hal. SM Megamall, Mandaluyong"
          value={to}
          onSelect={setTo}
        />
      </section>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <span style={{ color: "#64748b", fontSize: 12 }}>
          {from && to
            ? "Suriin ang mapa at available na commute guide."
            : "Maghanap ng pinanggalingan at destination."}
        </span>

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
            fontSize: 12,
          }}
        >
          {beginnerMode ? "✓ Beginner Guide ON" : "Beginner Guide OFF"}
        </button>
      </div>

      {showMap && (
        <section style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 500,
              fontSize: 23,
            }}
          >
            🧭 Map Guide
          </h2>

          <div
            style={{
              height: "clamp(290px, 48vw, 460px)",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            <MapContainer
              center={center}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <MapUpdater center={center} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {currentLocation && (
                <CircleMarker
                  center={currentLocation}
                  radius={9}
                  pathOptions={{
                    color: "#fff",
                    weight: 3,
                    fillColor: "#1685ff",
                    fillOpacity: 1,
                  }}
                >
                  <Popup>📍 Nandito ka ngayon</Popup>
                </CircleMarker>
              )}

              {from && (
                <Marker position={[from.lat, from.lng]}>
                  <Popup>📍 Origin: {from.name}</Popup>
                </Marker>
              )}

              {to && (
                <Marker position={[to.lat, to.lng]}>
                  <Popup>🏁 Destination: {to.name}</Popup>
                </Marker>
              )}

              {from && to && (
                <Polyline
                  positions={[
                    [from.lat, from.lng],
                    [to.lat, to.lng],
                  ]}
                  pathOptions={{
                    color: "#198754",
                    weight: 4,
                    dashArray: "8 8",
                  }}
                />
              )}
            </MapContainer>
          </div>

          {from && to && (
            <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>
              Ang dashed line ay visual connection lamang ng dalawang lugar.
              Hindi ito verified walking path o aktuwal na ruta ng sasakyan.
            </p>
          )}
        </section>
      )}

      {from && to && (
        <section>
          {from.id === to.id ? (
            <p style={{ color: "#a16207" }}>
              Magkaiba dapat ang origin at destination.
            </p>
          ) : route ? (
            <article
              style={{
                background: "#fff",
                border: "1px solid #dce8df",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <span
                style={{
                  background: "#e7f6ed",
                  color: "#17663a",
                  padding: "5px 10px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                VERIFIED ROUTE
              </span>

              <h2
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 22,
                  fontWeight: 500,
                  marginBottom: 8,
                }}
              >
                {route.from} → {route.to}
              </h2>

              <p style={{ color: "#64748b", fontSize: 12 }}>
                Source: {route.sourceName} · Checked: {route.checkedOn}
              </p>

              <div
                style={{
                  background: "#111827",
                  color: "#fff",
                  borderRadius: 13,
                  padding: 15,
                  margin: "16px 0",
                }}
              >
                <div
                  style={{
                    color: "#cbd5e1",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1,
                  }}
                >
                  {route.signboard
                    ? "FRONT SIGNBOARD / KARATULA"
                    : "VEHICLE IDENTIFICATION"}
                </div>

                <div
                  style={{
                    fontSize: 21,
                    fontWeight: 900,
                    marginTop: 7,
                    overflowWrap: "anywhere",
                  }}
                >
                  {route.signboard ?? route.vehicle}
                </div>

                <p style={{ color: "#cbd5e1", fontSize: 12, marginBottom: 0 }}>
                  {route.signboard
                    ? "Hanapin ang eksaktong nakasulat sa harap ng sasakyan."
                    : "Train ito, kaya walang jeepney o bus front signboard."}
                </p>
              </div>

              <p style={{ lineHeight: 1.7, fontSize: 13 }}>
                <strong>Sakayan:</strong> {route.boardingPoint}
                <br />
                <strong>Babaan:</strong> {route.alightingPoint}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 7,
                  margin: "14px 0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setGuideLanguage("tl")}
                  style={{
                    padding: "8px 13px",
                    border: 0,
                    borderRadius: 999,
                    background: guideLanguage === "tl" ? "#006747" : "#f1f5f9",
                    color: guideLanguage === "tl" ? "#fff" : "#334155",
                  }}
                >
                  Tagalog
                </button>
                <button
                  type="button"
                  onClick={() => setGuideLanguage("en")}
                  style={{
                    padding: "8px 13px",
                    border: 0,
                    borderRadius: 999,
                    background: guideLanguage === "en" ? "#006747" : "#f1f5f9",
                    color: guideLanguage === "en" ? "#fff" : "#334155",
                  }}
                >
                  English
                </button>
              </div>

              <ol
                style={{
                  paddingLeft: 21,
                  display: "grid",
                  gap: 10,
                  fontSize: 14,
                  lineHeight: 1.65,
                }}
              >
                {(guideLanguage === "tl"
                  ? route.stepsTl
                  : route.stepsEn
                ).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>

              <a
                href={route.sourceUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  color: "#006747",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                View official source ↗
              </a>
            </article>
          ) : (
            <article
              style={{
                background: "#fff9e9",
                border: "1px solid #eadfbd",
                color: "#735b2d",
                borderRadius: 16,
                padding: 18,
                lineHeight: 1.7,
              }}
            >
              <strong style={{ display: "block", marginBottom: 8 }}>
                Wala pang verified commute guide para sa biyahe na ito.
              </strong>

              Nakita natin ang origin at destination sa mapa, pero wala pang
              kumpirmadong impormasyon tungkol sa sasakyan, eksaktong sakayan,
              babaan at front signboard.

              Hindi kami mag-iimbento ng jeepney o bus route. Kailangan munang
              ma-verify ang karatula sa harap ng sasakyan at kumpirmahin sa
              driver o dispatcher bago idagdag ang guide.
            </article>
          )}
        </section>
      )}

      {!from && !to && !currentLocation && (
        <section
          style={{
            border: "1px dashed #d8d5ca",
            borderRadius: 18,
            padding: 30,
            textAlign: "center",
            background: "#fff",
          }}
        >
          <div style={{ fontSize: 38 }}>🚌</div>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            First time mag-commute?
          </h2>
          <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: 14 }}>
            Ilagay kung saan ka manggagaling at saan ka pupunta.
            Tutulungan ka naming malaman kung anong sasakyan ang sasakyan
            at anong karatula ang hahanapin.
          </p>
        </section>
      )}
    </main>
  );
}
