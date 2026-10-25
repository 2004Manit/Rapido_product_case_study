import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { CityMap } from "../components/CityMap";
import { Row } from "../components/Row";
import { Reveal } from "../components/Reveal";
import { HBarChart, LineChart } from "../components/Charts";
import { IconPlay } from "../components/Icons";
import {
  CAPTAIN_COUNT, INCENTIVE_PER_RIDE, MAX_INCENTIVE_ZONES, NIGHT_HOUR, SAFE_PREMIUM_PER_RIDE, START_BUDGET,
  SURGE_OPTIONS, TOTAL_TICKS, ZONES, clockLabel, hourAt, runNight, summarize, type SimState, type Summary, type ZoneId,
} from "../sim/engine";
import { useSim } from "../sim/useSim";
import analysis from "../sim/analysis.json";

type Phase = "intro" | "running" | "paused" | "over";

const BASE_TICK_MS = 850;

const BEATS: { tick: number; text: string }[] = [
  { tick: 0, text: "6 PM · Evening rush. Plenty of captains online." },
  { tick: 14, text: "Tip: tap a zone on the map to add a ₹30/ride bonus there." },
  { tick: 40, text: "8 PM · Women riders start dropping off. Bikes feel unsafe after dark." },
  { tick: 60, text: "9 PM · Captains start logging off and heading home." },
  { tick: 80, text: "10 PM · Late office crowds in Gurgaon can't find a bike." },
  { tick: 100, text: "11 PM · Last hour. Who's still online?" },
];

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const pct = (n: number) => `${Math.round(n * 100)}%`;

function insight(you: Summary, s: SimState) {
  const st = s.stats;
  const usedSafe = st.safeTicks > 0;
  const usedIncent = st.incentiveTicks > 0;
  const lines: string[] = [];
  if (!usedSafe) {
    lines.push(`<strong>${you.skippedTrust} riders wanted a ride but didn't trust a bike after dark.</strong> Surge and bonuses never reach them. They needed a reason to feel safe.`);
  } else if (usedIncent) {
    lines.push(`<strong>That's the play.</strong> Night-verified captains brought back riders who had stopped booking, and zone bonuses kept enough of those captains online to serve them.`);
  } else {
    lines.push(`<strong>Trust came back, but supply couldn't keep up:</strong> ${you.lost} riders gave up waiting. Only 30% of captains qualify, so pair the tier with zone bonuses to keep them out late.`);
  }
  if (st.surgeTicks > 30) lines.push(`Surge kept captains online, but <strong>${you.skippedPrice} riders were priced out</strong>. They chose bikes because they're cheap.`);
  if (you.spent > START_BUDGET * 0.8) lines.push(`You spent ${inr(you.spent)} of ${inr(START_BUDGET)}. Watch the cost per extra ride.`);
  return lines;
}

function grade(score: number) {
  if (score >= 76) return { label: "Night won", color: "var(--ok)" };
  if (score >= 70) return { label: "Holding on", color: "var(--accent)" };
  return { label: "Night lost", color: "var(--bad)" };
}

export function Simulation() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 10000));
  const [result, setResult] = useState<{ you: Summary; base: Summary; lines: string[] } | null>(null);
  const debriefRef = useRef<HTMLDivElement>(null);

  const tickMs = BASE_TICK_MS / speed;
  const { frame, reset, mutate } = useSim({
    seed,
    tickMs,
    running: phase === "running",
    onEnd: (s) => {
      const you = summarize(s);
      setResult({ you, base: runNight(seed), lines: insight(you, s) });
      setPhase("over");
    },
  });

  useEffect(() => {
    if (phase === "over") debriefRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [phase]);

  const night = hourAt(frame.tick) >= NIGHT_HOUR;
  const beat = [...BEATS].reverse().find((b) => frame.tick >= b.tick)!;
  const live = useMemo(() => summarize({ stats: frame.stats } as SimState), [frame.stats]);
  const disabled = phase === "over";

  const toggleZone = (id: ZoneId) => {
    if (disabled) return;
    mutate((s) => {
      const cur = s.levers.incentives;
      s.levers.incentives = cur.includes(id) ? cur.filter((z) => z !== id) : [...cur, id].slice(-MAX_INCENTIVE_ZONES);
    });
  };

  const restart = () => {
    const next = 1 + Math.floor(Math.random() * 10000);
    setSeed(next);
    reset(next);
    setResult(null);
    setPhase("running");
  };

  return (
    <Row
      id="simulation"
      index="06"
      title="Simulation & analysis"
      headline={<>You run Delhi NCR tonight. <em>Six PM to midnight.</em></>}
      desc="Keep riders served after 9 PM. You can't dispatch captains, only persuade them."
      action={
        <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
          <button className="btn-link" style={{ background: "none", border: 0, borderBottom: "1.5px solid currentColor", cursor: "pointer", color: "var(--fg-2)" }} onClick={() => setShowAssumptions((v) => !v)} aria-expanded={showAssumptions}>
            {showAssumptions ? "Hide" : "View"} assumptions
          </button>
          <AnimatePresence>
            {showAssumptions && (
              <motion.div className="assumptions" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <b style={{ color: "var(--fg)" }}>An illustrative agent model:</b>
                <ul>
                  <li>50 captains; idle ones drift home, and more log off after 9 PM.</li>
                  <li>Up to 45% of late riders are safety-sensitive; without trust, most don't book.</li>
                  <li>Riders are price-sensitive: surge loses bookings.</li>
                  <li>Fare shape follows public bike-taxi rate cards: base + per km + per minute.</li>
                  <li>Shows direction, not a forecast.</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
    >
      <div className="sim-shell">
        <div className={`sim-map ${night ? "is-night" : ""}`}>
          <CityMap frame={frame} night={night} tickMs={tickMs} onZoneClick={disabled ? undefined : toggleZone} />
          <div className="sim-clock">
            <span className="time">{clockLabel(frame.tick)}</span>
            <span className={`phase ${night ? "is-night" : ""}`}>{night ? "☾ Night" : "Evening"}</span>
          </div>
          {phase !== "intro" && (
            <div className="sim-ticker" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.span key={beat.tick} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>{beat.text}</motion.span>
              </AnimatePresence>
            </div>
          )}
          <AnimatePresence>
            {phase === "intro" && (
              <motion.div className="sim-overlay" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <div className="sim-overlay-card">
                  <span className="eyebrow">About 2 minutes</span>
                  <h3>Keep the city moving <em>after dark.</em></h3>
                  <p className="muted sim-overlay-desc" style={{ fontSize: 14, marginBottom: 18 }}>
                    Three levers: zone bonuses, surge, and night-verified captains. Score = night riders served, captain earnings, and money spent.
                  </p>
                  <button className="btn btn-primary" onClick={() => setPhase("running")}><IconPlay /> Start at 6 PM</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="sim-panel">
          <div className="panel-block">
            <div className="panel-title">
              <span>Tonight</span>
              <span className="sim-controls">
                {(phase === "running" || phase === "paused") && (
                  <>
                    <button className="icon-btn" onClick={() => setPhase(phase === "running" ? "paused" : "running")} aria-label={phase === "running" ? "Pause" : "Resume"}>{phase === "running" ? "❚❚" : "▶"}</button>
                    <button className="icon-btn" onClick={() => setSpeed(speed === 1 ? 2 : 1)} aria-label="Toggle speed">{speed}×</button>
                  </>
                )}
              </span>
            </div>
            <div className="timeline" aria-hidden="true"><div className="timeline-fill" style={{ width: `${(frame.tick / TOTAL_TICKS) * 100}%` }} /></div>
            <div className="timeline-marks"><span>6 PM</span><span>9 PM</span><span>12 AM</span></div>
            <div className="metrics">
              <div className="metric is-key">
                <div className="l">{night ? "Night riders served (after 9 PM)" : "Riders served so far"}</div>
                <div className="v">{night ? (frame.stats.nightWanted ? pct(live.nightPct) : "—") : frame.stats.wanted ? pct(live.servedPct) : "—"}</div>
              </div>
              <div className="metric"><div className="v">{frame.online}<span style={{ fontSize: 14, color: "var(--ink-3)" }}>/{CAPTAIN_COUNT}</span></div><div className="l">Captains online</div></div>
              <div className="metric"><div className="v" style={{ color: "var(--bad)" }}>{frame.stats.lost}</div><div className="l">Gave up waiting</div></div>
              <div className="metric"><div className="v rider">{frame.stats.skippedTrust}</div><div className="l">Didn't book: unsafe</div></div>
              <div className="metric"><div className="v">{frame.stats.skippedPrice}</div><div className="l">Didn't book: too pricey</div></div>
            </div>
          </div>

          <div className="panel-block">
            <div className="panel-title"><span>Your levers</span><span>Budget {inr(frame.budget)}</span></div>
            <div className="lever">
              <div className="lever-head"><span className="lever-name">Zone bonus</span><span className="lever-cost">+₹{INCENTIVE_PER_RIDE}/ride · max {MAX_INCENTIVE_ZONES}</span></div>
              <div className="zone-pills">
                {ZONES.map((z) => (
                  <button key={z.id} className="zone-pill" aria-pressed={frame.incentives.includes(z.id)} onClick={() => toggleZone(z.id)} disabled={disabled}>{z.name}</button>
                ))}
              </div>
              <p className="lever-hint">Pulls idle captains in and keeps them online longer.</p>
            </div>
            <div className="lever">
              <div className="lever-head"><span className="lever-name">Surge</span><span className="lever-cost">riders pay more</span></div>
              <div className="seg full" role="group" aria-label="Surge multiplier">
                {SURGE_OPTIONS.map((m) => (
                  <button key={m} aria-pressed={frame.surge === m} className={m > 1 ? "is-surge" : ""} disabled={disabled} onClick={() => mutate((s) => { s.levers.surge = m; })}>
                    {m.toFixed(m === 1 ? 1 : 2)}×
                  </button>
                ))}
              </div>
              <p className="lever-hint">Captains stay out longer, but riders chose bikes because they're the cheapest option.</p>
            </div>
            <div className="lever">
              <button className="toggle" role="switch" aria-checked={frame.safeNight} disabled={disabled} onClick={() => mutate((s) => { s.levers.safeNight = !s.levers.safeNight; })}>
                <span>
                  <span className="lever-name" style={{ display: "block" }}>Night-verified captains</span>
                  <span className="lever-cost">+₹{SAFE_PREMIUM_PER_RIDE}/ride · from 8 PM</span>
                </span>
                <span className="switch" aria-hidden="true" />
              </button>
              <p className="lever-hint">Riders who feel unsafe are matched only with top-rated captains (30% of the fleet). Trust builds over time.</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {phase === "over" && result && (
            <motion.div ref={debriefRef} className="panel-block" style={{ gridColumn: "1 / -1", padding: 24 }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <Debrief result={result} onRestart={restart} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Analysis />
    </Row>
  );
}

function Debrief({ result, onRestart }: { result: { you: Summary; base: Summary; lines: string[] }; onRestart: () => void }) {
  const { you, base, lines } = result;
  const g = grade(you.score);
  const delta = Math.round((you.nightPct - base.nightPct) * 100);
  return (
    <div className="debrief-grid">
      <div>
        <div className="panel-title" style={{ marginBottom: 4 }}><span>Midnight · your night</span></div>
        <div className="score-row">
          <span className="score">{you.score}</span>
          <span className="grade" style={{ color: g.color }}>{g.label}</span>
        </div>
        <div className="debrief-insight">
          {lines.map((l, i) => <p key={i} style={{ marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: l }} />)}
        </div>
        <div className="debrief-actions">
          <button className="btn btn-primary" onClick={onRestart}>↻ Play again</button>
          <a className="btn" href="#insights">See key insights ↓</a>
        </div>
      </div>
      <div>
        <div className="metrics" style={{ marginTop: 0 }}>
          <div className="metric"><div className="v hl">{pct(you.nightPct)}</div><div className="l">Night riders served, you</div></div>
          <div className="metric"><div className="v dim">{pct(base.nightPct)}</div><div className="l">Same night if you'd done nothing</div></div>
          <div className="metric"><div className="v">{inr(you.captainPerHour)}</div><div className="l">Captain earnings / hr (bar ≈ ₹110)</div></div>
          <div className="metric"><div className="v">{inr(you.spent)}</div><div className="l">Incentives spent</div></div>
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
          {delta > 0 ? `You served ${delta} percentage points more night riders than doing nothing.` : delta < 0 ? `You served ${-delta} points fewer night riders than doing nothing.` : "You matched doing nothing."}{" "}
          Across 200 simulated nights, the best combination was night-verified captains plus bonuses in Gurgaon and CP, with no surge.
        </p>
      </div>
    </div>
  );
}

function Analysis() {
  const s = analysis.strategies;
  const by = (id: string) => s.find((x) => x.id === id)!;
  const color = (id: string) => (id === "shield" ? "var(--bar)" : id === "surge" || id === "max" ? "var(--bad)" : id === "none" ? "var(--fg-3)" : "var(--bar-soft)");
  const costIds = ["verified", "shield", "bonus", "max"];
  const SHORT: Record<string, string> = {
    none: "Do nothing", surge: "Surge 1.5×", bonus: "Zone bonuses", verified: "Night-verified", shield: "Verified + bonuses", max: "Everything",
  };
  return (
    <div style={{ marginTop: 14 }}>
      <p className="sub-label">Analysis · {analysis.seeds} simulated nights per strategy</p>
      <div className="grid g3" style={{ marginTop: 10 }}>
        <Reveal className="card">
          <div className="card-title">Night riders served, by strategy</div>
          <div className="card-sub">% of riders who wanted a ride after 9 PM</div>
          <HBarChart
            max={100}
            data={s.map((x) => ({
              label: SHORT[x.id], value: x.nightPct, display: `${Math.round(x.nightPct)}%`, color: color(x.id),
              note: `${x.label}: ${x.lost} gave up waiting, ${x.skippedTrust} didn't book (unsafe), ${x.skippedPrice} priced out.`,
            }))}
            caption="Surge alone does worse than doing nothing. Hover a bar to see why."
          />
        </Reveal>
        <Reveal delay={0.06} className="card">
          <div className="card-title">Captains online by hour</div>
          <div className="card-sub">Average of 50 captains</div>
          <LineChart
            labels={analysis.hours.map((h) => h.replace(" ", ""))}
            yMax={50}
            series={[
              { name: "Verified + bonuses", short: "Shield", color: "var(--bar)", values: by("shield").onlineByHour },
              { name: "Do nothing", short: "Nothing", color: "var(--fg-3)", values: by("none").onlineByHour },
            ]}
          />
        </Reveal>
        <Reveal delay={0.12} className="card">
          <div className="card-title">Cost per extra night ride</div>
          <div className="card-sub">Incentive ₹ ÷ rides gained vs doing nothing</div>
          <HBarChart
            data={costIds.map((id) => {
              const x = by(id);
              return { label: SHORT[id], value: x.costPerExtraRide ?? 0, display: x.costPerExtraRide ? inr(x.costPerExtraRide) : "—", color: color(id), note: `${x.label}: +${Math.round(x.extraNightRides)} night rides for ${inr(x.spent)}.` };
            })}
            caption="Building trust is the cheapest lever. Surge isn't shown because it loses rides."
          />
        </Reveal>
      </div>
    </div>
  );
}
