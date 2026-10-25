import { Reveal } from "../components/Reveal";
import { Row } from "../components/Row";
import { AUTHOR, SOURCES } from "../content";
import { SHIELD_SCREENS } from "../components/Phone";
import analysis from "../sim/analysis.json";

const shield = analysis.strategies.find((s) => s.id === "shield")!;
const none = analysis.strategies.find((s) => s.id === "none")!;
const verified = analysis.strategies.find((s) => s.id === "verified")!;

/* ---------- 07 Key insights ---------- */
export function Insights() {
  const cols = [
    {
      kind: "", icon: "✓", title: "Strengths", color: "var(--ok)",
      items: ["The cheapest way across town, and riders choose it for exactly that", "Captains accept fast in the daytime", "Subscription passes attract full-time captains", "Real safety basics: SOS with a 24/7 team, masked numbers for women, ride tracking, and women-only Bike Pink in some cities"],
    },
    {
      kind: "", icon: "✕", title: "Challenges", color: "var(--bad)",
      items: ["Captains log off and head home after 9–10 PM", "Women stop riding after 8–9 PM, and rash driving keeps others away for good", "Captains also run other apps, so every incentive has competition"],
    },
    {
      kind: "is-next", icon: "→", title: "What's next", color: "var(--accent)",
      items: ["Night-verified captains, chosen by riding score", "Safety features on by default after dark", "A night pass for captains who live near night demand"],
    },
  ];
  return (
    <Row
      id="insights"
      index="07"
      title="Key insights"
      headline={<>What works, what breaks, <em>what I'd build.</em></>}
      desc={<>In my model, the fix lifts night riders served from <b>{Math.round(none.nightPct)}%</b> to <b>{Math.round(shield.nightPct)}%</b>.</>}
    >
      <div className="grid g3">
        {cols.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.06} className={`card insight ${c.kind}`}>
            <div className="insight-head">
              <span className="insight-icon" style={{ color: c.color }}>{c.icon}</span>
              <h3>{c.title}</h3>
            </div>
            <ul>{c.items.map((t) => <li key={t} style={{ color: c.color }}><span>{t}</span></li>)}</ul>
          </Reveal>
        ))}
      </div>
    </Row>
  );
}

/* ---------- 08 Recommendation ---------- */
export function Recommendation() {
  const bets = [
    {
      tag: "Trust · demand",
      title: "Night-verified captains",
      body: "A riding score for every captain, all day, built from phone sensors (harsh braking, speeding, phone use while riding) plus ratings. After 9 PM, its top band becomes night-verified: riders can choose verified-only, and captains earn a night premium for keeping the badge.",
      why: "rash driving was the top reason people refused to ride, and it happens all day. At night it's what makes people stop booking, so that's where the score becomes a requirement.",
    },
    {
      tag: "Trust · product · table stakes",
      title: "Safety on by default after dark",
      body: "Rapido already has SOS with a 24/7 team, masked numbers and ride tracking. The gap is that riders have to remember to use them. From 8 PM: trip sharing on automatically, a helmet check at pickup, and Bike Pink brought to Delhi NCR, where none of the people I spoke to had heard of it.",
      why: "all 6 women I spoke to avoid bikes after 8–9 PM. Uber already lets riders switch safety tools on automatically for late-night trips, so this is the minimum riders expect, not the differentiator.",
    },
    {
      tag: "Supply",
      title: "A night pass for captains near demand",
      body: "A cheaper 9 PM–1 AM pass plus zone bonuses in Gurgaon and CP, offered first to captains who live near those hubs.",
      why: "captains stay near home. Instead of fighting that, recruit night supply from people already close to demand.",
    },
  ];
  return (
    <Row
      id="recommendation"
      index="08"
      title="Recommendation · Night Shield"
      headline={<>Make the night trustworthy, <em>then worth staying out for.</em></>}
      desc={<>Trust is the cheapest lever: about <b>₹{verified.costPerExtraRide}</b> per extra night ride, vs <b>₹{shield.costPerExtraRide}</b> with bonuses added. It needs the bonuses to keep enough verified captains online.</>}
    >
      <div className="grid">
        <Reveal>
          <p className="sub-label" style={{ marginTop: 0 }}>What Night Shield looks like</p>
          <div className="shield">
            {SHIELD_SCREENS.map((s, i) => (
              <div className="shield-step" key={s.title}>
                {s.screen}
                <span className="step-num">{i + 1}</span>
                <span className="step-label">{s.title}</span>
                <p className="shield-body">{s.body}</p>
                <span className="shield-tag">{s.bets}</span>
              </div>
            ))}
          </div>
          <p className="journey-note"><span className="swipe-hint hl">Swipe → · </span>Concept screens recreated in code. Scores, names and prices are indicative.</p>
        </Reveal>
        <div className="grid g3">
          {bets.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.06} className="card bet">
              <span className="tag">0{i + 1} · {b.tag}</span>
              <h3>{b.title}</h3>
              <p>{b.body}</p>
              <p className="why"><b>Why:</b> <span className="muted">{b.why}</span></p>
            </Reveal>
          ))}
        </div>
        <Reveal className="card pilot">
          <div><div className="k">The pilot</div><p><b>Gurgaon, 4 weeks.</b> Zone-level A/B: Cyber City gets Night Shield, and a comparable zone acts as control.</p></div>
          <div><div className="k">The hypothesis</div><p>Night fulfilment goes up mainly from <b>riders who come back</b>, not just from more captains online.</p></div>
          <div><div className="k">Kill criteria</div><p>Cost per extra ride above the ride margin, or <b>longer waits</b> for riders who choose verified-only.</p></div>
        </Reveal>
      </div>
    </Row>
  );
}

/* ---------- 09 Measure ---------- */
export function Measure() {
  const branches = [
    { name: "Demand", color: "var(--rider)", items: [["Night booking rate", "App opens → bookings, 9 PM–1 AM"], ["Women riders' night bookings", "The segment most likely to stop riding at night"], ["Night repeat rate (D30)", "Did trust stick?"]] },
    { name: "Supply", color: "var(--hl)", items: [["Captains online after 9 PM", "In the Gurgaon and CP hotspots"], ["Verified pool size", "Share of captains who qualify"], ["Night pass uptake", "Among captains living near demand"]] },
    { name: "Guardrails", color: "var(--ok)", items: [["Captain earnings ≥ ₹110/hr", "The daytime bar from interviews"], ["₹ per extra ride", "Below the ride margin"], ["Incidents per 10k night rides", "And daytime fulfilment must hold"]] },
  ];
  const risks = [
    { t: "A smaller night pool means longer waits", p: `With night-verified alone, riders giving up rise from ~${none.lost} to ~${verified.lost} a night in my model.`, f: "Launch with the night pass and bonuses, and only restrict riders who choose verified-only." },
    { t: "A sensor score can feel like surveillance", p: "Captains are independent owners. A score they don't understand will be resented or gamed.", f: "A transparent score with coaching and appeals that affects night eligibility and coaching only, never deactivation." },
    { t: "\"Safe\" is a promise, with legal exposure", p: "Calling it safe creates liability the first time something goes wrong.", f: "Call it \"night-verified\", publish the criteria, and never market it as a guarantee." },
    { t: "Delhi's bike-taxi rules keep shifting", p: "Delhi bike taxis faced an operating halt in 2023, and state rules still vary.", f: "Verified, tracked night rides give Rapido a stronger case to make to regulators." },
  ];
  return (
    <Row id="measure" index="09" title="How I'd measure it" headline={<>One number to move. <em>Three that can't break.</em></>}>
      <div className="grid" style={{ gap: 20 }}>
        <Reveal className="tree-root">
          <div className="k">North-star metric</div>
          <div className="v">Night rides completed, 9 PM–1 AM, per week</div>
        </Reveal>
        <div className="grid g3">
          {branches.map((br, i) => (
            <Reveal key={br.name} delay={i * 0.06} className="branch">
              <h4 style={{ color: br.color }}><span className="swatch" style={{ background: br.color, borderRadius: "50%" }} />{br.name}</h4>
              <ul>{br.items.map(([b, d]) => <li key={b}><b>{b}</b>{d}</li>)}</ul>
            </Reveal>
          ))}
        </div>
        <p className="sub-label">Risks & trade-offs</p>
        <div className="grid g2">
          {risks.map((r, i) => (
            <Reveal key={r.t} delay={(i % 2) * 0.06} className="card risk">
              <h4>{r.t}</h4>
              <p>{r.p}</p>
              <p className="fix">{r.f}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Row>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="about">
            <span className="eyebrow">About</span>
            <h3>Hi, I'm {AUTHOR.name.split(" ")[0]}. <em>Let's talk.</em></h3>
            <p>I’m drawn to problems that only surface when you get close to the users. For this teardown, that meant analyzing multiple conversations across Delhi NCR, building a model to evaluate potential solutions, and identifying the risks and trade-offs involved. If you’re building products that people rely on every day, I’d love to exchange insights and perspectives.</p>
            <div className="about-links">
              <a className="btn btn-primary" href={AUTHOR.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <a className="btn" href={`mailto:${AUTHOR.email}`}>Email</a>
            </div>
          </div>
          <div className="sources">
            <h4>Sources</h4>
            <ol>{SOURCES.map((s) => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ol>
            <p className="method">
              <b style={{ color: "var(--fg-2)" }}>Method.</b> Primary research: 25 captains, 42 riders and 3 non-riders, Delhi NCR, Aug–Sep 2026. The simulation is an illustrative agent model built from those interviews; fares follow the shape of publicly shared bike-taxi rate cards. App screens are original recreations. Its numbers show direction, not forecasts.
            </p>
          </div>
        </div>
        <div className="disclaimer">
          <span>An independent product teardown. Not affiliated with, or endorsed by, Rapido.</span>
          <span>{AUTHOR.name}</span>
        </div>
      </div>
    </footer>
  );
}
