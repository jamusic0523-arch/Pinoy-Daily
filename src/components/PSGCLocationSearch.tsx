
"use client";

import { useEffect, useState } from "react";
import {
  searchPSGCLocations,
  type PSGCResult,
} from "@/lib/psgc-api";

type Props = {
  onSelect: (location: PSGCResult) => void;
  placeholder?: string;
};

export default function PSGCLocationSearch({
  onSelect,
  placeholder = "Search a city, municipality, or barangay...",
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PSGCResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (selected || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const locations = await searchPSGCLocations(query);

        if (!cancelled) {
          setResults(locations);
        }
      } catch {
        if (!cancelled) {
          setError("Hindi ma-load ang mga lokasyon. Subukan ulit.");
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, selected]);

  function chooseLocation(location: PSGCResult) {
    setQuery(location.fullName);
    setSelected(true);
    setResults([]);
    onSelect(location);
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setSelected(false);
        }}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "15px 17px",
          borderRadius: 999,
          border: "1px solid #d1d5db",
          background: "#fff",
          color: "#111827",
          fontSize: 15,
          outlineColor: "#006747",
        }}
      />

      {loading && (
        <p style={{ fontSize: 12, color: "#64748b" }}>
          Searching Philippine locations...
        </p>
      )}

      {error && (
        <p role="alert" style={{ fontSize: 12, color: "#dc3545" }}>
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div
          style={{
            position: "absolute",
            zIndex: 1100,
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            maxHeight: 300,
            overflowY: "auto",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            background: "#fff",
            boxShadow: "0 12px 28px rgba(15,23,42,.12)",
          }}
        >
          {results.map((location) => (
            <button
              key={location.code}
              type="button"
              onClick={() => chooseLocation(location)}
              style={{
                display: "block",
                width: "100%",
                padding: "12px 14px",
                textAlign: "left",
                border: 0,
                borderBottom: "1px solid #f1f5f9",
                background: "#fff",
                cursor: "pointer",
                color: "#1f2937",
              }}
            >
              <strong style={{ display: "block", fontSize: 14 }}>
                {location.name}
              </strong>
              <span style={{ display: "block", fontSize: 11, color: "#64748b", marginTop: 3 }}>
                {location.fullName}
              </span>
              <span style={{ display: "block", fontSize: 10, color: "#006747", marginTop: 4 }}>
                {location.level.toUpperCase()} · PSGC {location.code}
              </span>
            </button>
          ))}
        </div>
      )}

      {query.trim().length >= 2 &&
        !loading &&
        !error &&
        results.length === 0 &&
        !selected && (
          <p style={{ fontSize: 12, color: "#64748b" }}>
            Walang nahanap na lokasyon.
          </p>
        )}
    </div>
  );
}
