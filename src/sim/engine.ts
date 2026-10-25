// Night-shift supply simulation for Delhi NCR, 6 PM -> midnight.
// Pure logic, no DOM: the UI renders snapshots, scripts/sim-check.ts runs it headless.

export type ZoneId = "GGN" | "SRJ" | "KHN" | "CP" | "IPX" | "NOI";

export interface Zone {
  id: ZoneId;
  name: string;
  x: number;
  y: number;
  /** share of captains who live here */
  homeShare: number;
  /** share of rider demand before / after 9 PM */
  eveningShare: number;
  nightShare: number;
  neighbors: ZoneId[];
}

export const ZONES: Zone[] = [
  { id: "CP", name: "Connaught Place", x: 330, y: 118, homeShare: 0.05, eveningShare: 0.22, nightShare: 0.24, neighbors: ["KHN", "SRJ", "IPX"] },
  { id: "KHN", name: "Khan Market", x: 352, y: 208, homeShare: 0.05, eveningShare: 0.12, nightShare: 0.16, neighbors: ["CP", "SRJ", "NOI"] },
  { id: "SRJ", name: "Sarojini Nagar", x: 238, y: 236, homeShare: 0.15, eveningShare: 0.11, nightShare: 0.1, neighbors: ["CP", "KHN", "GGN"] },
  { id: "GGN", name: "Gurgaon", x: 112, y: 300, homeShare: 0.2, eveningShare: 0.25, nightShare: 0.28, neighbors: ["SRJ"] },
  { id: "IPX", name: "IP Ext · Vaishali", x: 508, y: 140, homeShare: 0.3, eveningShare: 0.12, nightShare: 0.08, neighbors: ["CP", "NOI"] },
  { id: "NOI", name: "Noida", x: 486, y: 300, homeShare: 0.25, eveningShare: 0.18, nightShare: 0.14, neighbors: ["IPX", "KHN"] },
];

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z])) as Record<ZoneId, Zone>;

export const START_HOUR = 18;
export const END_HOUR = 24;
export const MIN_PER_TICK = 3;
export const TOTAL_TICKS = ((END_HOUR - START_HOUR) * 60) / MIN_PER_TICK;
export const NIGHT_HOUR = 21;

export const CAPTAIN_COUNT = 50;
export const SAFE_SHARE = 0.3;
export const START_BUDGET = 12000;
export const INCENTIVE_PER_RIDE = 30;
export const SAFE_PREMIUM_PER_RIDE = 25;
export const MAX_INCENTIVE_ZONES = 2;
export const PATIENCE_TICKS = 4;
export const SURGE_OPTIONS = [1, 1.25, 1.5] as const;

export type CaptainStatus = "idle" | "moving" | "busy" | "offline";

export interface Captain {
  id: number;
  home: ZoneId;
  zone: ZoneId;
  status: CaptainStatus;
  until: number;
  /** top-rated, eligible for the Safe Night tier */
  safe: boolean;
  onlineFrom: number;
  onlineTicks: number;
  earned: number;
}

export interface Request {
  id: number;
  zone: ZoneId;
  born: number;
  /** a safety-sensitive rider (e.g. a woman travelling late) */
  sensitive: boolean;
}

export interface Levers {
  surge: number;
  incentives: ZoneId[];
  safeNight: boolean;
}

export interface Stats {
  wanted: number;
  nightWanted: number;
  nightServed: number;
  booked: number;
  served: number;
  lost: number;
  skippedPrice: number;
  skippedTrust: number;
  waitTicks: number;
  captainEarnings: number;
  captainOnlineTicks: number;
  spent: number;
  safeTicks: number;
  surgeTicks: number;
  incentiveTicks: number;
}

export interface SimEvent {
  kind: "lost" | "served" | "skipped";
  zone: ZoneId;
  tick: number;
}

export interface SimState {
  tick: number;
  captains: Captain[];
  queue: Request[];
  levers: Levers;
  budget: number;
  trust: number;
  stats: Stats;
  events: SimEvent[];
  nextRequestId: number;
  rng: () => number;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function poisson(lambda: number, rng: () => number) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}

function pickWeighted<T>(items: T[], weights: number[], rng: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));

export const hourAt = (tick: number) => START_HOUR + (tick * MIN_PER_TICK) / 60;

export function clockLabel(tick: number) {
  const total = START_HOUR * 60 + tick * MIN_PER_TICK;
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`;
}

/** latent riders who want a ride, citywide, per tick */
function cityDemand(h: number) {
  if (h < 19) return lerp(6.5, 7, h - 18);
  if (h < 21) return lerp(7, 6, (h - 19) / 2);
  if (h < 23) return lerp(6, 4.6, (h - 21) / 2);
  return lerp(4.6, 3.6, h - 23);
}

/** share of riders who are safety-sensitive at this hour */
function sensitiveShare(h: number) {
  return h < 20 ? 0.15 : lerp(0.15, 0.45, (h - 20) / 2);
}

/** chance a safety-sensitive rider books a bike without Safe Night */
function sensitiveBaseTrust(h: number) {
  return h < 20 ? 1 : lerp(1, 0.2, (h - 20) / 1.5);
}

/** per-tick chance an idle online captain logs off and heads home */
function leaveChance(h: number) {
  if (h < 20) return 0.003;
  if (h < 21) return 0.015;
  if (h < 22) return 0.06;
  if (h < 23) return 0.08;
  return 0.1;
}

export const priceFactor = (surge: number) => 1 - 0.55 * (surge - 1);

export function createSim(seed = 7): SimState {
  const rng = mulberry32(seed);
  const homes = ZONES.map((z) => z.id);
  const homeWeights = ZONES.map((z) => z.homeShare);
  const workWeights = ZONES.map((z) => z.eveningShare);
  const captains: Captain[] = [];
  for (let i = 0; i < CAPTAIN_COUNT; i++) {
    const home = pickWeighted(homes, homeWeights, rng);
    // most captains start the evening where the work is; some still near home
    const zone = rng() < 0.65 ? pickWeighted(homes, workWeights, rng) : home;
    const lateStart = i >= CAPTAIN_COUNT - 8;
    captains.push({
      id: i,
      home,
      zone,
      status: lateStart ? "offline" : "idle",
      until: lateStart ? 4 + Math.floor(rng() * 16) : 0,
      safe: rng() < SAFE_SHARE,
      onlineFrom: 0,
      onlineTicks: 0,
      earned: 0,
    });
  }
  return {
    tick: 0,
    captains,
    queue: [],
    levers: { surge: 1, incentives: [], safeNight: false },
    budget: START_BUDGET,
    trust: 0,
    stats: {
      wanted: 0, nightWanted: 0, nightServed: 0, booked: 0, served: 0, lost: 0, skippedPrice: 0, skippedTrust: 0,
      waitTicks: 0, captainEarnings: 0, captainOnlineTicks: 0, spent: 0,
      safeTicks: 0, surgeTicks: 0, incentiveTicks: 0,
    },
    events: [],
    nextRequestId: 0,
    rng,
  };
}

export const isOver = (s: SimState) => s.tick >= TOTAL_TICKS;

/** Advance one tick (3 game minutes). Mutates and returns the state. */
export function step(s: SimState): SimState {
  if (isOver(s)) return s;
  const { rng, levers, stats } = s;
  const h = hourAt(s.tick);
  const night = h >= NIGHT_HOUR;
  const funded = s.budget > 0;
  const incentives = funded ? levers.incentives : [];
  const safeActive = levers.safeNight && funded && h >= 20;
  s.events = [];

  // trust builds slowly while Safe Night runs, and decays if switched off
  s.trust = safeActive ? Math.min(1, s.trust + 0.05) : Math.max(0, s.trust - 0.03);

  if (levers.surge > 1) stats.surgeTicks++;
  if (incentives.length) stats.incentiveTicks++;
  if (safeActive) stats.safeTicks++;

  // 1. captains finish rides, arrive, log in, or log off
  for (const c of s.captains) {
    if (c.status === "offline") {
      if (c.until > 0 && s.tick >= c.until) {
        c.status = "idle";
        c.until = 0;
      }
      continue;
    }
    c.onlineTicks++;
    stats.captainOnlineTicks++;
    if ((c.status === "busy" || c.status === "moving") && s.tick >= c.until) c.status = "idle";
    if (c.status !== "idle") continue;

    const keep =
      1 +
      2.2 * (levers.surge - 1) +
      (incentives.includes(c.zone) ? 1.5 : 0) +
      (safeActive && c.safe ? 0.6 : 0);
    const homeBias = c.zone === c.home ? 1.5 : 1;
    if (rng() < (leaveChance(h) * homeBias) / keep) {
      c.status = "offline";
      c.zone = c.home;
      c.until = 0;
      continue;
    }

    // idle captains drift: stay, head home, or chase an incentive
    if (rng() < 0.15) {
      const targets: ZoneId[] = [c.zone, c.home, ...incentives];
      const weights = [3, night ? 2.5 : 0.8, ...incentives.map(() => 4)];
      const target = pickWeighted(targets, weights, rng);
      if (target !== c.zone) {
        c.zone = target;
        c.status = "moving";
        c.until = s.tick + 2;
      }
    }
  }

  // 2. riders decide whether to book
  const share = sensitiveShare(h);
  const sensTrust = safeActive || s.trust > 0
    ? lerp(sensitiveBaseTrust(h), 0.85, s.trust)
    : sensitiveBaseTrust(h);
  const price = priceFactor(levers.surge);
  for (const z of ZONES) {
    const lambda = cityDemand(h) * (night ? z.nightShare : z.eveningShare);
    const wanting = poisson(lambda, rng);
    for (let i = 0; i < wanting; i++) {
      stats.wanted++;
      if (night) stats.nightWanted++;
      const sensitive = rng() < share;
      if (sensitive && rng() > sensTrust) {
        stats.skippedTrust++;
        s.events.push({ kind: "skipped", zone: z.id, tick: s.tick });
        continue;
      }
      if (rng() > price) {
        stats.skippedPrice++;
        s.events.push({ kind: "skipped", zone: z.id, tick: s.tick });
        continue;
      }
      stats.booked++;
      s.queue.push({ id: s.nextRequestId++, zone: z.id, born: s.tick, sensitive });
    }
  }

  // 3. match the queue, oldest first: same zone, then a neighbour (longer pickup)
  const remaining: Request[] = [];
  for (const r of s.queue) {
    const eligible = (c: Captain) =>
      c.status === "idle" && (!(safeActive && r.sensitive) || c.safe);
    let captain = s.captains.find((c) => c.zone === r.zone && eligible(c));
    let pickup = 1;
    if (!captain) {
      const near = ZONE_BY_ID[r.zone].neighbors;
      captain = s.captains.find((c) => near.includes(c.zone) && eligible(c));
      pickup = 3;
    }
    if (captain) {
      const rideTicks = 3 + Math.floor(rng() * 4);
      // fare shape follows public Rapido bike-taxi rate cards: base + per km + per min
      const km = 2 + rng() * 5;
      let fare = (10 + 5.5 * km + 0.25 * rideTicks * MIN_PER_TICK) * levers.surge;
      // bonuses are only paid while the budget can cover them
      let cost = 0;
      if (incentives.includes(r.zone) && s.budget - cost >= INCENTIVE_PER_RIDE) {
        fare += INCENTIVE_PER_RIDE;
        cost += INCENTIVE_PER_RIDE;
      }
      if (safeActive && captain.safe && s.budget - cost >= SAFE_PREMIUM_PER_RIDE) {
        fare += SAFE_PREMIUM_PER_RIDE;
        cost += SAFE_PREMIUM_PER_RIDE;
      }
      s.budget -= cost;
      stats.spent += cost;
      captain.earned += fare;
      stats.captainEarnings += fare;
      stats.served++;
      if (hourAt(r.born) >= NIGHT_HOUR) stats.nightServed++;
      stats.waitTicks += s.tick - r.born + pickup;
      // drop-offs skew residential late at night
      const destWeights = ZONES.map((z) => (night ? 0.5 * z.homeShare + 0.5 * z.nightShare : z.eveningShare));
      captain.zone = pickWeighted(ZONES.map((z) => z.id), destWeights, rng);
      captain.status = "busy";
      captain.until = s.tick + pickup + rideTicks;
      s.events.push({ kind: "served", zone: r.zone, tick: s.tick });
    } else if (s.tick - r.born >= PATIENCE_TICKS) {
      stats.lost++;
      s.events.push({ kind: "lost", zone: r.zone, tick: s.tick });
    } else {
      remaining.push(r);
    }
  }
  s.queue = remaining;
  s.tick++;
  return s;
}

export interface Summary {
  servedPct: number;
  nightPct: number;
  nightWanted: number;
  nightServed: number;
  served: number;
  wanted: number;
  lost: number;
  skippedTrust: number;
  skippedPrice: number;
  avgWaitMin: number;
  captainPerHour: number;
  spent: number;
  score: number;
}

export function summarize(s: SimState): Summary {
  const st = s.stats;
  const servedPct = st.wanted ? st.served / st.wanted : 0;
  const nightPct = st.nightWanted ? st.nightServed / st.nightWanted : 0;
  const captainPerHour = st.captainOnlineTicks
    ? st.captainEarnings / ((st.captainOnlineTicks * MIN_PER_TICK) / 60)
    : 0;
  const avgWaitMin = st.served ? (st.waitTicks * MIN_PER_TICK) / st.served : 0;
  // night riders served matter most; captains must clear ~₹110/hr; spend is a drag
  const earnScore = Math.min(1, captainPerHour / 110);
  const spendScore = 1 - st.spent / START_BUDGET;
  const score = Math.round(100 * (0.7 * nightPct + 0.2 * earnScore + 0.1 * spendScore));
  return {
    servedPct, nightPct, nightWanted: st.nightWanted, nightServed: st.nightServed, served: st.served, wanted: st.wanted, lost: st.lost,
    skippedTrust: st.skippedTrust, skippedPrice: st.skippedPrice,
    avgWaitMin, captainPerHour, spent: st.spent, score,
  };
}

export type Strategy = (s: SimState) => void;

/** Run a whole night headless with a strategy that may change levers each tick. */
export function runNight(seed: number, strategy: Strategy = () => {}) {
  const s = createSim(seed);
  while (!isOver(s)) {
    strategy(s);
    step(s);
  }
  return summarize(s);
}

export const onlineCount = (s: SimState) => s.captains.filter((c) => c.status !== "offline").length;
