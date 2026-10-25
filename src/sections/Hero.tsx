import { motion } from "framer-motion";
import { HeroPhone } from "../components/Phone";
import { Underline } from "../components/Row";
import { IconDown, IconPlay } from "../components/Icons";
import { AUTHOR, QUOTES } from "../content";

const rise = (d: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay: d, ease: [0.22, 1, 0.36, 1] as const },
});

// rider and captain voices drifting along a curve, like a spoken line
const RIBBON = [QUOTES.night, QUOTES.cheap, QUOTES.never, QUOTES.pass].map((q) => q.text).join("  ·  ");

function Ribbon() {
  return (
    <svg className="hero-curve" viewBox="0 0 1440 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path id="ribbon-path" d="M -200 120 C 120 40, 260 420, 560 470 S 1100 260, 1700 420" fill="none" />
      <text>
        <textPath href="#ribbon-path" startOffset="0%">
          {RIBBON}  ·  {RIBBON}
          <animate attributeName="startOffset" from="0%" to="-100%" dur="90s" repeatCount="indefinite" />
        </textPath>
      </text>
    </svg>
  );
}

/** A bike in motion: spinning wheels and flickering speed lines. */
function RideIcon() {
  const wheel = (cx: number) => (
    <g className="ride-wheel" style={{ transformOrigin: `${cx}px 14px` }}>
      <circle cx={cx} cy="14" r="4" />
      <path d={`M${cx - 4} 14h8M${cx} 10v8`} strokeWidth="1" />
    </g>
  );
  return (
    <svg className="ride-icon" width="34" height="20" viewBox="0 0 34 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path className="ride-speed" d="M1 8h4M0 12h3M2 16h3" />
      {wheel(12)}
      {wheel(28)}
      <path d="M12 14l4-6h6l4 6M16 8l-1-3h-2M22 8l2-4h3" />
      <circle cx="21" cy="3" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Hero() {
  return (
    <header className="hero" id="top">
      <Ribbon />
      <div className="container">
        <motion.span className="eyebrow" {...rise(0.05)}>A product teardown · Rapido · Delhi NCR</motion.span>
        <motion.h1 className="display" {...rise(0.15)}>
          Rapido wins the day.
          <span className="line2"><em>It loses the <Underline>night.</Underline></em></span>
        </motion.h1>
        <motion.p className="hero-sub" {...rise(0.3)}>
          After 9 PM, captains drift home and riders stop trusting the ride. I spoke to multiple riders and captains, then built a simulation so you can try to fix it.
        </motion.p>
        <motion.div className="hero-cta" {...rise(0.42)}>
          <a className="btn btn-primary" href="#simulation"><IconPlay /> Play the 2-min simulation</a>
          <a className="btn-link" href="#big-picture">Read the teardown <IconDown /></a>
        </motion.div>
        <motion.p className="hero-meta" {...rise(0.5)}>By {AUTHOR.name}</motion.p>

        <motion.div style={{ position: "relative", marginBottom: 170 }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}>
          <div className="hero-frame">
            <img src="/hero-night.jpg" alt="Light trails on a city road at night" />
          </div>
          <div className="night-pill">
            <RideIcon />
            10:42 PM · No bikes nearby
          </div>
          <div className="hero-phone"><HeroPhone /></div>
          <div className="annotation" style={{ left: "calc(50% + 150px)", bottom: 40 }}>
            same city,<br />different night ↙
          </div>
        </motion.div>
      </div>
    </header>
  );
}
