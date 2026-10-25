"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { peso } from "@/lib/money";

const FUELS = [
  { name: "Unleaded 91", price: 55.4 },
  { name: "Unleaded 95", price: 62.1 },
  { name: "Unleaded 97", price: 68.5 },
  { name: "Diesel", price: 52.8 },
];

const BUILDS = {
  Office: {
    parts: 28000,
    watts: 180,
  },
  "Budget gaming": {
    parts: 45000,
    watts: 450,
  },
  Midrange: {
    parts: 78000,
    watts: 550,
  },
  High: {
    parts: 145000,
    watts: 750,
  },
};

type BuildKey = keyof typeof BUILDS;

export function CalcClient() {
  const router = useRouter();
  const [fuel, setFuel] = useState(FUELS[0].name);
  const [price, setPrice] = useState(String(FUELS[0].price));
  const [km, setKm] = useState("24");
  const [kpl, setKpl] = useState("12");
  const [days, setDays] = useState("22");
  const [roundTrip, setRoundTrip] = useState(true);
  const [build, setBuild] = useState<BuildKey>("Budget gaming");
  const [parts, setParts] = useState(String(BUILDS["Budget gaming"].parts));
  const [watts, setWatts] = useState(String(BUILDS["Budget gaming"].watts));
  const [hours, setHours] = useState("5");
  const [kwh, setKwh] = useState("12.5");
  const [note, setNote] = useState("");

  const gas = useMemo(() => {
    const distance = Number(km) * (roundTrip ? 2 : 1);
    const liters = Number(kpl) > 0 ? distance / Number(kpl) : 0;
    const daily = liters * Number(price);
    const monthly = daily * Number(days);
    return { distance, liters, daily, monthly };
  }, [km, kpl, price, days, roundTrip]);

  const pc = useMemo(() => {
    const kwhUsed = (Number(watts) / 1000) * Number(hours) * Number(days);
    const powerBill = kwhUsed * Number(kwh);
    return { kwhUsed, powerBill, totalYear: Number(parts) + powerBill * 12 };
  }, [watts, hours, days, kwh, parts]);

  async function award(kind: "gas" | "pc") {
    const res = await fetch("/api/points/calc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    const data = await res.json();
    setNote(
      data.awarded
        ? "Nice — +8 points added."
        : "Calculated. Daily point cap for this tool is already reached.",
    );
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>
        Pinoy gas & computer calculator
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Prices are editable starting points in pesos. Use your current pump
        price and Meralco rate for a closer estimate.
      </p>
      {note && <p className="mt-3 font-semibold text-leaf">{note}</p>}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Gas / commute
          </h2>
          <div className="mt-4 grid gap-3">
            <select
              className="field"
              value={fuel}
              onChange={(e) => {
                const next = FUELS.find((item) => item.name === e.target.value);
                setFuel(e.target.value);
                if (next) setPrice(String(next.price));
              }}
            >
              {FUELS.map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
            <label className="text-sm text-muted">
              Pump price (₱ / liter)
              <input
                className="field mt-1"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <label className="text-sm text-muted">
              One-way distance (km)
              <input
                className="field mt-1"
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
              />
            </label>
            <label className="text-sm text-muted">
              Fuel economy (km / liter)
              <input
                className="field mt-1"
                type="number"
                value={kpl}
                onChange={(e) => setKpl(e.target.value)}
              />
            </label>
            <label className="text-sm text-muted">
              Work / school days in a month
              <input
                className="field mt-1"
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={roundTrip}
                onChange={(e) => setRoundTrip(e.target.checked)}
              />
              Round trip
            </label>
          </div>
          <div className="mt-5 rounded-2xl bg-paper p-4">
            <p>Daily: {peso(gas.daily)}</p>
            <p className="text-2xl font-semibold">
              Monthly: {peso(gas.monthly)}
            </p>
            <p className="text-sm text-muted">
              {gas.liters.toFixed(2)} L for {gas.distance} km
            </p>
          </div>
          <button className="btn btn-primary mt-4" onClick={() => award("gas")}>
            Save this estimate · +8 pts
          </button>
        </section>

        <section className="card p-6">
          <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Computer + kuryente
          </h2>
          <div className="mt-4 grid gap-3">
            <select
              className="field"
              value={build}
              onChange={(e) => {
                const key = e.target.value as BuildKey;
                setBuild(key);
                setParts(String(BUILDS[key].parts));
                setWatts(String(BUILDS[key].watts));
              }}
            >
              {Object.keys(BUILDS).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <label className="text-sm text-muted">
              PC parts budget (₱)
              <input
                className="field mt-1"
                type="number"
                value={parts}
                onChange={(e) => setParts(e.target.value)}
              />
            </label>
            <label className="text-sm text-muted">
              Typical draw (watts)
              <input
                className="field mt-1"
                type="number"
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
              />
            </label>
            <label className="text-sm text-muted">
              Hours on per day
              <input
                className="field mt-1"
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </label>
            <label className="text-sm text-muted">
              Electricity rate (₱ / kWh)
              <input
                className="field mt-1"
                type="number"
                step="0.01"
                value={kwh}
                onChange={(e) => setKwh(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-5 rounded-2xl bg-paper p-4">
            <p>Parts: {peso(Number(parts) || 0)}</p>
            <p>Monthly kuryente: {peso(pc.powerBill)}</p>
            <p className="text-2xl font-semibold">
              First year all-in: {peso(pc.totalYear)}
            </p>
            <p className="text-sm text-muted">
              {pc.kwhUsed.toFixed(1)} kWh / month
            </p>
          </div>
          <button className="btn btn-primary mt-4" onClick={() => award("pc")}>
            Save this estimate · +8 pts
          </button>
        </section>
      </div>
    </div>
  );
}
