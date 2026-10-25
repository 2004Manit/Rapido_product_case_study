// Runs every strategy over 200 seeded nights and writes the numbers the
// "Simulation & Analysis" charts show, so the page never hand-types results.
import { writeFileSync } from "node:fs";
import {
  createSim, hourAt, isOver, onlineCount, step, summarize, MIN_PER_TICK, type SimState, type Strategy,
} from "../src/sim/engine.ts";

const SEEDS = 200;
const TICKS_PER_HOUR = 60 / MIN_PER_TICK;

const strategies: { id: string; label: string; run: Strategy }[] = [
  { id: "none", label: "Do nothing", run: () => {} },
  { id: "surge", label: "Surge 1.5× after 9 PM", run: (s) => { s.levers.surge = hourAt(s.tick) >= 21 ? 1.5 : 1; } },
  { id: "bonus", label: "Zone bonuses (Gurgaon + CP)", run: (s) => { s.levers.incentives = hourAt(s.tick) >= 21 ? ["GGN", "CP"] : []; } },
  { id: "verified", label: "Night-verified captains", run: (s) => { s.levers.safeNight = hourAt(s.tick) >= 20; } },
  {
    id: "shield", label: "Verified + zone bonuses", run: (s) => {
      s.levers.safeNight = hourAt(s.tick) >= 20;
      s.levers.incentives = hourAt(s.tick) >= 21 ? ["GGN", "CP"] : [];
    },
  },
  { id: "max", label: "Everything, all night", run: (s) => { s.levers.safeNight = true; s.levers.incentives = ["GGN", "CP"]; s.levers.surge = 1.5; } },
];

function runOne(seed: number, strat: Strategy) {
  const s: SimState = createSim(seed);
  const online: number[] = [];
  while (!isOver(s)) {
    if (s.tick % TICKS_PER_HOUR === 0) online.push(onlineCount(s));
    strat(s);
    step(s);
  }
  online.push(onlineCount(s));
  return { sum: summarize(s), online };
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

const results = strategies.map((st) => {
  const runs = Array.from({ length: SEEDS }, (_, i) => runOne(i + 1, st.run));
  return {
    id: st.id,
    label: st.label,
    nightPct: mean(runs.map((r) => r.sum.nightPct)),
    nightServed: mean(runs.map((r) => r.sum.nightServed)),
    spent: mean(runs.map((r) => r.sum.spent)),
    captainPerHour: mean(runs.map((r) => r.sum.captainPerHour)),
    lost: mean(runs.map((r) => r.sum.lost)),
    skippedTrust: mean(runs.map((r) => r.sum.skippedTrust)),
    skippedPrice: mean(runs.map((r) => r.sum.skippedPrice)),
    onlineByHour: runs[0].online.map((_, h) => mean(runs.map((r) => r.online[h]))),
  };
});

const base = results.find((r) => r.id === "none")!;
const out = {
  seeds: SEEDS,
  hours: ["6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM"],
  strategies: results.map((r) => {
    const extra = r.nightServed - base.nightServed;
    return {
      id: r.id,
      label: r.label,
      nightPct: +(r.nightPct * 100).toFixed(1),
      spent: Math.round(r.spent),
      captainPerHour: Math.round(r.captainPerHour),
      lost: Math.round(r.lost),
      skippedTrust: Math.round(r.skippedTrust),
      skippedPrice: Math.round(r.skippedPrice),
      extraNightRides: +extra.toFixed(1),
      costPerExtraRide: extra > 0.5 && r.spent > 0 ? Math.round(r.spent / extra) : null,
      onlineByHour: r.onlineByHour.map((n) => +n.toFixed(1)),
    };
  }),
};

writeFileSync(new URL("../src/sim/analysis.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
for (const s of out.strategies) {
  console.log(s.label.padEnd(30), `${s.nightPct}%`, `extra ${s.extraNightRides}`, `₹/extra ${s.costPerExtraRide}`, `online ${s.onlineByHour.join(" ")}`);
}
