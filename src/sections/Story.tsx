import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Reveal } from "../components/Reveal";
import { Row } from "../components/Row";
import { JOURNEY, JourneyScreen, type Mode } from "../components/Phone";
import { ColumnChart, HBarChart } from "../components/Charts";
import { DayNightChart } from "../components/DayNightChart";
import { IconArrow, IconBike, IconMoon, IconMoonSm, IconRupee, IconSun, IconTrend } from "../components/Icons";
import { NEIGHBOURHOODS, QUOTES, RESEARCH, srcUrl } from "../content";
import { ZONES } from "../sim/engine";

/* ---------- 01 Big picture ---------- */
export function BigPicture() {
  const stats = [
    { icon: <IconTrend />, v: "$3B", l: "Valuation after a $240M Prosus-led round", s: "TechCrunch, May 2026", href: srcUrl("tc-2026") },
    { icon: <IconBike />, v: "56–70%", l: "Reported share of India's bike-taxi market", s: "Equentis · Inc42", href: srcUrl("equentis") },
    { icon: <IconRupee />, v: "₹100–110", l: "Per hour, what a full-time captain earns", s: "My interviews" },
    { icon: <IconMoon />, v: "58%", l: "Night riders served if nothing changes", s: "My simulation, 200 nights" },
  ];
  return (
    <Row
      id="big-picture"
      index="01"
      title="The big picture"
      headline={<>The cheapest, fastest way across town. <em>Until 9 PM.</em></>}
      desc="After dark, captains log off and riders stop trusting the ride. Two problems hit at once, and surge pricing only fixes one of them."
    >
      <div className="grid g4">
        {stats.map((s, i) => (
          <Reveal key={s.v} delay={i * 0.06} className="card stat-card">
            <span className="stat-icon">{s.icon}</span>
            <div className="v">{s.v}</div>
            <div className="l">{s.l}</div>
            <div className="s">{s.href ? <a href={s.href} target="_blank" rel="noreferrer">{s.s}</a> : s.s}</div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="thesis">
          Surge pricing can win back a captain. <em>It can't win back a rider's trust.</em>
        </p>
      </Reveal>
    </Row>
  );
}

/* ---------- 02 User journey ---------- */
export function Journey() {
  const [mode, setMode] = useState<Mode>("night");
  return (
    <Row
      id="journey"
      index="02"
      title="User journey"
      headline={<>The same ride, at 2 PM <em>and at 10 PM.</em></>}
      desc="By day every step is quick. At night each step has its own failure point, and they stack up."
      action={
        <div className="seg" role="group" aria-label="Time of day">
          <button aria-pressed={mode === "day"} onClick={() => setMode("day")}><IconSun /> 2 PM</button>
          <button aria-pressed={mode === "night"} onClick={() => setMode("night")}><IconMoonSm /> 10 PM</button>
        </div>
      }
    >
      <Reveal>
        <div className="journey">
          {JOURNEY.map((step, i) => (
            <div key={step.label} style={{ display: "contents" }}>
              {i > 0 && <span className="journey-arrow"><IconArrow /></span>}
              <div className="journey-step">
                <AnimatePresence mode="wait">
                  <motion.div key={mode} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, delay: i * 0.06 }}>
                    <JourneyScreen step={i} mode={mode} />
                  </motion.div>
                </AnimatePresence>
                <span className="step-num">{i + 1}</span>
                <span className="step-label">{step.label}</span>
                <span className={`pain ${mode === "night" ? "is-night" : "is-day"}`}>{step.pain[mode]}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="journey-note"><span className="swipe-hint hl">Swipe → · </span>Screens recreated to show what riders told me. Prices and ETAs are indicative, not Rapido's UI.</p>
      </Reveal>
    </Row>
  );
}

/* ---------- 03 Market ---------- */
export function Market() {
  return (
    <Row
      id="market"
      index="03"
      title="Market"
      headline={<>Nearly tripled in value <em>in twenty months.</em></>}
      desc="Rapido leads bike taxis, its strongest product and the one that suffers most after dark."
    >
      <div className="grid g3">
        <Reveal className="card">
          <div className="card-title">Valuation</div>
          <div className="card-sub">US$ billions</div>
          <ColumnChart
            unit="US$ B"
            data={[
              { label: "Sep '24", value: 1.1, display: "$1.1B", note: "Unicorn round" },
              { label: "Sep '25", value: 2.3, display: "$2.3B", note: "Swiggy stake sale" },
              { label: "May '26", value: 3, display: "$3.0B", note: "$240M Prosus-led round" },
            ]}
          />
          <p className="card-src">Source: <a href={srcUrl("tc-2025")} target="_blank" rel="noreferrer">TechCrunch 2025</a>, <a href={srcUrl("tc-2026")} target="_blank" rel="noreferrer">2026</a></p>
        </Reveal>

        <Reveal delay={0.06} className="card">
          <div className="card-title">Share by segment</div>
          <div className="card-sub">Third-party estimate, 2025</div>
          <HBarChart
            max={100}
            data={[
              { label: "Bike taxi", value: 56, display: "56%", note: "Rapido's CEO claims about 70% for bike taxis (Inc42)." },
              { label: "Auto", value: 31, display: "31%", color: "var(--bar-soft)", note: "Uber leads autos at an estimated 40%." },
              { label: "Cab", value: 14, display: "14%", color: "var(--bar-faint)", note: "Uber about 50% and Ola about 34% of cabs, per the same estimate." },
            ]}
            caption={<>Source: <a href={srcUrl("equentis")} target="_blank" rel="noreferrer">Equentis</a>. Hover a bar for context.</>}
          />
        </Reveal>

        <Reveal delay={0.12} className="card">
          <div className="card-title">Where I did my research</div>
          <div className="card-sub">Delhi NCR · 7 neighbourhoods</div>
          <svg viewBox="20 70 590 300" width="100%" style={{ marginTop: 14 }} aria-label="Map of Delhi NCR research locations">
            <path d="M430 40 C 405 100, 440 140, 418 190 S 400 290, 430 350 S 470 420, 455 440" fill="none" stroke="rgba(106,79,216,0.16)" strokeWidth="14" strokeLinecap="round" />
            {ZONES.map((z) => {
              const hot = z.id === "GGN";
              return (
                <g key={z.id}>
                  <circle cx={z.x} cy={z.y} r={hot ? 34 : 22} fill={hot ? "rgba(106,79,216,0.16)" : "rgba(163,117,0,0.14)"} />
                  <circle cx={z.x} cy={z.y} r="8" fill={hot ? "var(--rider)" : "var(--bar)"} />
                  <text x={z.x} y={z.y + (z.id === "KHN" ? 36 : -28)} textAnchor="middle" fill="var(--fg-2)" fontSize="22" fontFamily="Figtree, sans-serif" fontWeight="600">{z.name.split(" · ")[0]}</text>
                </g>
              );
            })}
          </svg>
          <p className="card-src"><span className="rider">●</span> Gurgaon had the most complaints about finding a bike at night.</p>
        </Reveal>
      </div>
      <Competitors />
    </Row>
  );
}

type Cell = { v: "yes" | "no-info" | "text"; t?: string; src?: Parameters<typeof srcUrl>[0] };
const yes = (t: string, src: Cell["src"]): Cell => ({ v: "yes", t, src });
const unknown: Cell = { v: "no-info", t: "Not found publicly" };
const txt = (t: string, src?: Cell["src"]): Cell => ({ v: "text", t, src });

const COMPETITORS = ["Rapido", "Uber Moto", "Ola Bike", "Namma Yatri"];
const COMPARE: { row: string; gap?: boolean; cells: Cell[] }[] = [
  {
    row: "How drivers pay",
    cells: [
      txt("Passes or commission", "dh-zero"),
      txt("Daily fee for autos since Feb 2025; bikes not confirmed", "uber-auto-fee"),
      txt("Zero-commission pass, all vehicles, since Jun 2025", "ola-zero"),
      txt("Zero commission, daily fee", "namma-yatri"),
    ],
  },
  {
    row: "SOS with a safety team",
    cells: [yes("24/7 team + emergency contacts", "rapido-safety"), yes("SOS in the app", "uber-safety-prefs"), yes("SOS to safety team (confirmed for cabs)", "ola-safety"), yes("SOS + safety team callback", "namma-yatri")],
  },
  {
    row: "Safety tools switch on automatically at night",
    cells: [unknown, yes("Safety Preferences, e.g. late-night trips", "uber-safety-prefs"), unknown, unknown],
  },
  {
    row: "Women-only matching",
    cells: [yes("Bike Pink, select cities (not seen in Delhi NCR)", "bike-pink"), yes("Women Rider Preference for female drivers", "uber-moto-safety"), unknown, unknown],
  },
  {
    row: "Helmet check before the ride",
    cells: [unknown, yes("AI helmet selfie for drivers", "uber-moto-safety"), unknown, unknown],
  },
  {
    row: "Riding score decides who gets night rides",
    gap: true,
    cells: [unknown, unknown, unknown, unknown],
  },
];

function Competitors() {
  return (
    <Reveal className="card compare-card">
      <div className="compare-head">
        <div>
          <div className="card-title">How competitors handle the night</div>
          <div className="card-sub">Public announcements and app listings, checked Oct 2026</div>
        </div>
      </div>
      <div className="table-scroll">
        <table className="table compare">
          <thead>
            <tr><th></th>{COMPETITORS.map((c) => <th key={c} className={c === "Rapido" ? "hl-col" : ""}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {COMPARE.map((r) => (
              <tr key={r.row} className={r.gap ? "is-gap" : ""}>
                <td>{r.row}{r.gap && <span className="gap-tag">The gap Night Shield fills</span>}</td>
                {r.cells.map((c, i) => (
                  <td key={i} className={c.v === "no-info" ? "is-unknown" : ""} data-label={COMPETITORS[i]}>
                    <span>
                      {c.v === "yes" && <span className="tick" aria-label="Yes">✓</span>}
                      {c.src ? <a href={srcUrl(c.src)} target="_blank" rel="noreferrer">{c.t}</a> : c.t}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="card-src">
        "Not found publicly" means I found no public evidence, not proof it doesn't exist. Namma Yatri runs autos and cabs; its bike taxis are on the sister app <a href={srcUrl("mana-yatri")} target="_blank" rel="noreferrer">Mana Yatri</a>, in Hyderabad and Warangal. Every competitor has moved drivers off per-ride commission, so none of them can tell captains where to be at night either.
      </p>
    </Reveal>
  );
}

/* ---------- 04 Business model ---------- */
export function BusinessModel() {
  return (
    <Row
      id="business-model"
      index="04"
      title="Business model"
      headline={<>Captains pay for access, <em>not per ride.</em></>}
      desc="Great for captains' earnings and Rapido's margins. It also means Rapido can't tell anyone where to be at 10 PM."
    >
      <div className="grid">
        <div className="grid g2">
          <Reveal className="card">
            <div className="card-title">Two ways captains pay</div>
            <div className="card-sub">From my interviews, plus public reporting</div>
            <div className="table-scroll">
              <table className="table">
                <thead><tr><th></th><th>Commission</th><th className="hl-col">Subscription pass</th></tr></thead>
                <tbody>
                  <tr><td>Who uses it</td><td>Part-timers, mostly students</td><td>Full-timers (most on a 3-day pass)</td></tr>
                  <tr><td>Captain pays</td><td>A cut of every ride</td><td>A fixed fee for access</td></tr>
                  <tr><td>Captain keeps</td><td>Fare minus the cut</td><td>Close to the whole fare</td></tr>
                  <tr><td>Rapido earns per</td><td>Ride</td><td>Captain-day</td></tr>
                  <tr><td>Control over supply</td><td>Some</td><td className="hl-col">Very little</td></tr>
                </tbody>
              </table>
            </div>
            <p className="card-src">Rapido moved auto captains to zero commission with a daily fee: <a href={srcUrl("dh-zero")} target="_blank" rel="noreferrer">Deccan Herald</a>.</p>
          </Reveal>

          <Reveal delay={0.06} className="card">
            <div className="card-title">A full-time captain's day</div>
            <div className="card-sub">One captain's numbers, from an interview</div>
            <table className="table">
              <tbody>
                <tr><td>Hours online</td><td style={{ textAlign: "right" }}>8 hrs/day</td></tr>
                <tr><td>Days a week</td><td style={{ textAlign: "right" }}>6</td></tr>
                <tr><td>Earnings</td><td style={{ textAlign: "right" }}>₹800–900/day</td></tr>
                <tr><td>Effective rate</td><td className="hl-col" style={{ textAlign: "right" }}>≈ ₹100–110/hr</td></tr>
              </tbody>
            </table>
            <figure className="quote-card" style={{ margin: "22px 0 0" }}>
              <blockquote style={{ fontSize: 22 }}>{QUOTES.pass.text}</blockquote>
              <figcaption>{QUOTES.pass.who}</figcaption>
            </figure>
          </Reveal>
        </div>

        <Reveal className="card highlight-card">
          <h3>The trade-off</h3>
          <p>
            Subscriptions help Rapido add supply fast, but they give up control over it. In the daytime, demand is everywhere, so it doesn't matter. At night every captain is an independent business owner, and home is the best offer on the table. <b>Any night fix has to beat ₹100–110/hr.</b>
          </p>
        </Reveal>
      </div>
    </Row>
  );
}

/* ---------- 05 What I heard ---------- */
type CountRow = { label: string; n: number; of: number; display: string; night?: boolean; note?: string };

function CountCard({ title, sub, rows }: { title: string; sub: string; rows: CountRow[] }) {
  return (
    <Reveal className="card">
      <div className="card-title">{title}</div>
      <div className="card-sub">{sub}</div>
      <ul className="counts">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="counts-top">
              <span>{r.label}</span>
              <b>{r.display}</b>
            </div>
            <div className="counts-track" role="img" aria-label={`${r.display}`}>
              <div className="counts-fill" style={{ width: `${(r.n / r.of) * 100}%`, background: r.night ? "var(--rider)" : "var(--bar)" }} />
            </div>
            {r.note && <div className="counts-note">{r.note}</div>}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export function Heard() {
  const quotes = [QUOTES.cheap, QUOTES.night, QUOTES.never];
  return (
    <Row
      id="research"
      index="05"
      title="What I heard"
      headline={<>Seventy conversations. <em>Not a survey form.</em></>}
      desc="Captains, riders, and people who refuse to ride, across Delhi NCR in Aug–Sep 2026. Quotes are word for word."
      action={<div className="chips">{NEIGHBOURHOODS.map((n) => <span className="chip" key={n}>{n}</span>)}</div>}
    >
      <div className="grid" style={{ gap: 20 }}>
        <Reveal className="mini-stats">
          <div><div className="v">{RESEARCH.captains}</div><div className="l">Captains, full- and part-time</div></div>
          <div><div className="v">{RESEARCH.riders + RESEARCH.nonRiders}</div><div className="l">{RESEARCH.riders} riders and {RESEARCH.nonRiders} non-riders</div></div>
          <div><div className="v">7</div><div className="l">Neighbourhoods</div></div>
          <div><div className="v">2 mo</div><div className="l">Aug–Sep 2026</div></div>
        </Reveal>

        <div className="grid g2">
          <CountCard title="Riders & non-riders" sub={`${RESEARCH.riders} riders · ${RESEARCH.nonRiders} non-riders · ${RESEARCH.women} women`} rows={RESEARCH.riderRows} />
          <CountCard title="Captains" sub={`${RESEARCH.captains} captains`} rows={RESEARCH.captainRows} />
        </div>
        <p className="card-src" style={{ marginTop: -4, textAlign: "center" }}>Small samples, especially the 6 women. Read these as direction, not statistics.</p>

        <div className="grid g3">
          {quotes.map((q, i) => (
            <Reveal key={q.text} delay={i * 0.06} className="card quote-card">
              <blockquote>{q.text}</blockquote>
              <figcaption>{q.who}</figcaption>
            </Reveal>
          ))}
        </div>

        <div className="grid g3">
          {[
            { t: "By day: hard to beat", c: "var(--accent)", p: "The cheapest option, and captains accept fast. That's why riders choose bikes over autos and cabs." },
            { t: "Night: supply leaves", c: "var(--rider)", p: "Bikes are hard to find after 9–10 PM. Idle captains wait near home, and many also drive for Uber, Ola, Swiggy or Zomato." },
            { t: "Night: trust leaves", c: "var(--rider)", p: "All 6 women I spoke to avoid bikes after 8–9 PM. All 3 non-riders refuse over rash driving and personal safety. One rider had a serious leg injury." },
          ].map((x, i) => (
            <Reveal key={x.t} delay={i * 0.06} className="card" >
              <div className="card-title" style={{ borderLeft: `3px solid ${x.c}`, paddingLeft: 12 }}>{x.t}</div>
              <p className="muted" style={{ fontSize: 15, marginTop: 12 }}>{x.p}</p>
            </Reveal>
          ))}
        </div>

        <Reveal><DayNightChart /></Reveal>
      </div>
    </Row>
  );
}
