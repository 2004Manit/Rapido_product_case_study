// Headless balance check: average each strategy over many seeds.
import { runNight, hourAt, createSim, isOver, step, onlineCount, type Strategy, type Summary } from "../src/sim/engine.ts";

const strategies: Record<string, Strategy> = {
  "do nothing": () => {},
  "surge 1.5 from 9pm": (s) => { s.levers.surge = hourAt(s.tick) >= 21 ? 1.5 : 1; },
  "surge 1.25 from 9pm": (s) => { s.levers.surge = hourAt(s.tick) >= 21 ? 1.25 : 1; },
  "incentive GGN+CP from 9pm": (s) => { s.levers.incentives = hourAt(s.tick) >= 21 ? ["GGN", "CP"] : []; },
  "safe night from 8pm": (s) => { s.levers.safeNight = hourAt(s.tick) >= 20; },
  "safe + incentives": (s) => {
    s.levers.safeNight = hourAt(s.tick) >= 20;
    s.levers.incentives = hourAt(s.tick) >= 21 ? ["GGN", "CP"] : [];
  },
  "safe + incentives + surge 1.25": (s) => {
    const h = hourAt(s.tick);
    s.levers.safeNight = h >= 20;
    s.levers.incentives = h >= 21 ? ["GGN", "CP"] : [];
    s.levers.surge = h >= 22 ? 1.25 : 1;
  },
  "everything max all night": (s) => {
    s.levers.safeNight = true;
    s.levers.incentives = ["GGN", "CP"];
    s.levers.surge = 1.5;
  },
};

const SEEDS = 200;

// captains online by hour, doing nothing (seed-averaged)
{
  const byHour: number[] = Array(7).fill(0);
  for (let seed = 1; seed <= SEEDS; seed++) {
    const s = createSim(seed);
    while (!isOver(s)) {
      if (s.tick % 20 === 0) byHour[s.tick / 20] += onlineCount(s) / SEEDS;
      step(s);
    }
    byHour[6] += onlineCount(s) / SEEDS;
  }
  console.log("online by hour 6PM..12AM:", byHour.map((n) => n.toFixed(0)).join(" "));
}
const avg = (rows: Summary[], k: keyof Summary) => rows.reduce((a, r) => a + (r[k] as number), 0) / rows.length;

for (const [name, strat] of Object.entries(strategies)) {
  const rows = Array.from({ length: SEEDS }, (_, i) => runNight(i + 1, strat));
  console.log(
    name.padEnd(32),
    `score ${avg(rows, "score").toFixed(1).padStart(5)}`,
    `night ${(100 * avg(rows, "nightPct")).toFixed(1).padStart(5)}%`,
    `all ${(100 * avg(rows, "servedPct")).toFixed(1).padStart(5)}%`,
    `wanted ${avg(rows, "wanted").toFixed(0)}`,
    `lost ${avg(rows, "lost").toFixed(0).padStart(3)}`,
    `trustSkip ${avg(rows, "skippedTrust").toFixed(0).padStart(3)}`,
    `priceSkip ${avg(rows, "skippedPrice").toFixed(0).padStart(3)}`,
    `wait ${avg(rows, "avgWaitMin").toFixed(1)}m`,
    `₹/hr ${avg(rows, "captainPerHour").toFixed(0)}`,
    `spent ₹${avg(rows, "spent").toFixed(0)}`,
  );
}
