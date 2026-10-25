import type { ReactNode } from "react";

// Original, generic ride-hailing UI recreated in code (no Rapido assets).
// Prices and ETAs are indicative, chosen to illustrate the interview findings.

export function Phone({ dark, time, children, className = "" }: { dark?: boolean; time: string; children: ReactNode; className?: string }) {
  return (
    <div className={`phone ${className}`}>
      <div className={`phone-screen ${dark ? "is-dark" : ""}`}>
        <div className="phone-notch" />
        <div className="phone-status"><span>{time}</span><span>▮▮▮ ◔</span></div>
        {children}
      </div>
    </div>
  );
}

function MiniMap({ dark, route = true, bikes = 4, moving = false }: { dark?: boolean; route?: boolean; bikes?: number; moving?: boolean }) {
  const road = dark ? "#3a352c" : "#ffffff";
  const block = dark ? "#24211a" : "#e4dfc8";
  const bikeSpots = [[22, 30], [70, 24], [80, 70], [30, 78], [55, 52], [15, 60]].slice(0, bikes);
  return (
    <div className="ps-map">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="100" height="100" fill={block} />
        <path d="M0 35 H100 M0 72 H100 M38 0 V100 M74 0 V100" stroke={road} strokeWidth="6" />
        <path d="M0 10 L100 95" stroke={road} strokeWidth="3.5" />
        {route && <path d="M24 82 L38 72 L38 35 L74 35 L74 18" fill="none" stroke="#6a4fd8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />}
        {route && <circle cx="74" cy="18" r="4" fill="#e5484d" stroke="#fff" strokeWidth="1.2" />}
        <circle cx="24" cy="82" r="3.6" fill="#6a4fd8" stroke="#fff" strokeWidth="1.2" />
        {bikeSpots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.6" fill="#ffc83d" stroke={dark ? "#17150f" : "#fff"} strokeWidth="0.8" />
        ))}
        {moving && (
          <circle r="3.4" fill="#ffc83d" stroke="#15120a" strokeWidth="0.8">
            <animateMotion dur="5s" repeatCount="indefinite" path="M24 82 L38 72 L38 35 L74 35 L74 18" />
          </circle>
        )}
      </svg>
    </div>
  );
}

export type Mode = "day" | "night";

export const JOURNEY: { label: string; pain: Record<Mode, string> }[] = [
  { label: "Set pickup & drop", pain: { day: "Bikes everywhere on the map.", night: "The map empties out. Few captains nearby." } },
  { label: "See price & ETA", pain: { day: "Cheapest option and the fastest pickup.", night: "Bike ETA jumps. Cheap stops meaning fast." } },
  { label: "Match a captain", pain: { day: "Captain accepts in seconds.", night: "Captains decline trips that take them away from home." } },
  { label: "Ride", pain: { day: "Quick hop through traffic.", night: "Fast, rash riding. Tools like SOS only help once something goes wrong." } },
  { label: "Reach & pay", pain: { day: "Rated 5★, will book again.", night: "Riders who feel unsafe don't complain. They just stop booking." } },
];

export function JourneyScreen({ step, mode }: { step: number; mode: Mode }) {
  const dark = mode === "night";
  const time = dark ? "10:14" : "2:14";
  switch (step) {
    case 0:
      return (
        <Phone dark={dark} time={time}>
          <div className="ps-title">Where to?</div>
          <MiniMap dark={dark} bikes={dark ? 1 : 6} />
          <div className="ps-sheet">
            <div className="ps-row"><span>● Cyber Hub</span></div>
            <div className="ps-row"><span>● Sector 56</span></div>
          </div>
        </Phone>
      );
    case 1:
      return (
        <Phone dark={dark} time={time}>
          <div className="ps-title">Choose a ride</div>
          <MiniMap dark={dark} bikes={dark ? 1 : 5} />
          <div className="ps-sheet">
            <div className="ps-row is-sel"><span><b>Bike</b> · {dark ? "11 min" : "2 min"}</span><b>₹62</b></div>
            <div className="ps-row"><span>Auto · {dark ? "8 min" : "4 min"}</span><b>₹118</b></div>
            <div className="ps-row"><span>Cab · {dark ? "9 min" : "5 min"}</span><b>₹196</b></div>
          </div>
        </Phone>
      );
    case 2:
      return dark ? (
        <Phone dark time={time}>
          <div className="ps-title">Finding your captain</div>
          <div className="ps-center">
            <div className="ps-pulse">🏍</div>
            <div className="ps-big">Still searching…</div>
            <div className="ps-small">2 captains declined</div>
          </div>
          <div className="ps-sheet"><div className="ps-cta is-muted">Cancel search</div></div>
        </Phone>
      ) : (
        <Phone time={time}>
          <div className="ps-title">Captain found</div>
          <div className="ps-center">
            <div className="ps-avatar">R</div>
            <div className="ps-big">Arriving in 2 min</div>
            <div className="ps-small">4.8★ · DL 3S XX 1234</div>
          </div>
          <div className="ps-sheet"><div className="ps-cta">Share PIN: 4821</div></div>
        </Phone>
      );
    case 3:
      return (
        <Phone dark={dark} time={time}>
          <div className="ps-title">On the way</div>
          <MiniMap dark={dark} bikes={0} moving />
          <div className="ps-sheet">
            {dark ? <div className="ps-warn">⚠ Speeding, sharp braking</div> : <div className="ps-row"><span>Drop in 12 min</span><b>₹62</b></div>}
            <div className="ps-note">{dark ? "SOS · Share trip" : "Share trip"}</div>
          </div>
        </Phone>
      );
    default:
      return dark ? (
        <Phone dark time={time}>
          <div className="ps-title">Rate your ride</div>
          <div className="ps-center">
            <div className="ps-stars">★★<span style={{ opacity: 0.25 }}>★★★</span></div>
            <div className="ps-big">"Unsafe driving"</div>
            <div className="ps-small">Next time: a cab, or not going out</div>
          </div>
          <div className="ps-sheet"><div className="ps-cta is-muted">Submit</div></div>
        </Phone>
      ) : (
        <Phone time={time}>
          <div className="ps-title">You've arrived</div>
          <div className="ps-center">
            <div className="ps-check">✓</div>
            <div className="ps-big">₹62 paid</div>
            <div className="ps-stars">★★★★★</div>
          </div>
          <div className="ps-sheet"><div className="ps-cta">Book again</div></div>
        </Phone>
      );
  }
}

/* ---------- Night Shield concept screens ---------- */

function ShieldBadge({ small }: { small?: boolean }) {
  return (
    <span className={`ps-badge ${small ? "is-small" : ""}`}>
      <svg width="10" height="11" viewBox="0 0 10 11" aria-hidden="true"><path d="M5 0.5 9 2v3.2c0 2.5-1.7 4.4-4 5.3C2.7 9.6 1 7.7 1 5.2V2z" fill="currentColor" /><path d="M3.2 5.4 4.5 6.7 6.9 4.2" stroke="#17150f" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      Night-verified
    </span>
  );
}

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2e2a22" strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#b9a6ff" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(c * score) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="#fffdeb" fontSize={size * 0.3} fontFamily="EB Garamond, serif">{score}</text>
    </svg>
  );
}

/** Rider at 10 PM: chooses verified-only. */
function ShieldBooking() {
  return (
    <Phone dark time="10:12">
      <div className="ps-title">Choose a ride</div>
      <MiniMap dark bikes={3} />
      <div className="ps-sheet">
        <div className="ps-row"><span><b>Any bike</b> · 11 min</span><b>₹62</b></div>
        <div className="ps-row is-sel is-shield"><span><ShieldBadge small /> · 13 min</span><b>₹62</b></div>
        <div className="ps-toggle"><span>Night-verified only</span><span className="ps-switch is-on" /></div>
        <div className="ps-note">Top-rated, safe-riding captains · may take a little longer</div>
      </div>
    </Phone>
  );
}

/** Rider after matching: trust visible before boarding. */
function ShieldMatched() {
  return (
    <Phone dark time="10:15">
      <div className="ps-title">Captain on the way</div>
      <div className="ps-center" style={{ gap: 6 }}>
        <div className="ps-avatar">A</div>
        <div className="ps-big">Arjun · 4 min away</div>
        <ShieldBadge />
        <div className="ps-score-line"><span>Riding score</span><b>94</b><span className="dim">· 4.9★</span></div>
        <div className="ps-plate">DL 3S XX 1234</div>
      </div>
      <div className="ps-sheet">
        <div className="ps-chip-row"><span className="ps-chip">● Trip sharing on</span><span className="ps-chip">✓ Helmet check</span></div>
        <div className="ps-note">Turned on automatically after 9 PM · SOS ready</div>
      </div>
    </Phone>
  );
}

/** Captain app: what earns night rides. */
function ShieldCaptain() {
  return (
    <Phone dark time="8:55">
      <div className="ps-title">Captain · Tonight</div>
      <div className="ps-captain">
        <ScoreRing score={92} />
        <div>
          <div className="ps-big">Riding score</div>
          <ShieldBadge small />
          <div className="ps-small" style={{ marginTop: 3 }}>2 harsh brakes this week</div>
        </div>
      </div>
      <div className="ps-sheet">
        <div className="ps-row is-sel"><span><b>Night pass</b> · 9 PM–1 AM</span><b>Active</b></div>
        <div className="ps-row"><span>Bonus · Cyber City</span><b>+₹30</b></div>
        <div className="ps-row"><span>Home · 3 km away</span><b>Near</b></div>
        <div className="ps-cta">Go online for the night</div>
      </div>
    </Phone>
  );
}

export const SHIELD_SCREENS = [
  { title: "Riders choose verified-only", body: "After 9 PM, riders can ask for a night-verified captain. The app is honest that it may take a little longer.", bets: "Bet 01", screen: <ShieldBooking /> },
  { title: "Trust you can see before boarding", body: "The riding score and badge sit on the captain card. Trip sharing and a helmet check are on by default.", bets: "Bets 01 + 02", screen: <ShieldMatched /> },
  { title: "Captains see what earns night rides", body: "Their own riding score, the night pass, and bonus zones close to home, all in one place.", bets: "Bets 01 + 03", screen: <ShieldCaptain /> },
];

/** Hero phone: the moment the night fails. */
export function HeroPhone() {
  return (
    <Phone dark time="10:42" className="phone-hero">
      <div className="ps-title">Finding a bike near you</div>
      <MiniMap dark bikes={0} route={false} />
      <div className="ps-sheet">
        <div className="ps-row"><span><b>No bikes nearby</b></span><span style={{ color: "#ff8a70" }}>14 min</span></div>
        <div className="ps-row"><span>Auto · 9 min</span><b>₹140</b></div>
        <div className="ps-cta is-muted">Keep searching</div>
        <div className="ps-note">Gurgaon · Cyber City</div>
      </div>
    </Phone>
  );
}
