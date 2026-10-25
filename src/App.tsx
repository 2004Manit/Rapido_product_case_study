import { MotionConfig, motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { Hero } from "./sections/Hero";
import { BigPicture, BusinessModel, Heard, Journey, Market } from "./sections/Story";
import { Simulation } from "./sections/Simulation";
import { Footer, Insights, Measure, Recommendation } from "./sections/Recommendation";
import { IconPlay } from "./components/Icons";

const LINKS = [
  ["big-picture", "Overview"],
  ["journey", "Journey"],
  ["market", "Market"],
  ["business-model", "Model"],
  ["simulation", "Simulation"],
  ["insights", "Insights"],
] as const;

function Nav() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    document.querySelectorAll("section.row").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-inner" style={{ position: "relative" }}>
        <a className="brand" href="#top" aria-label="Rapido after dark, back to top">
          <img className="brand-logo" src="/rapido-logo.svg" alt="Rapido" width="66" height="28" />
          <span className="brand-name"><em>after dark</em></span>
        </a>
        <div className="nav-links">
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "is-active" : ""}>{label}</a>
          ))}
        </div>
        <a className="btn btn-primary btn-sm" href="#simulation"><IconPlay /> Play</a>
        <motion.div className="progress" style={{ scaleX }} />
      </div>
    </nav>
  );
}

/** A full-bleed surface. Consecutive slabs overlap with rounded tops. */
function Slab({ theme, children }: { theme: "day" | "night"; children: ReactNode }) {
  return <div className={`slab theme-${theme}`}>{children}</div>;
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Slab theme="day">
          <Hero />
          <BigPicture />
        </Slab>
        <Slab theme="night">
          <Journey />
        </Slab>
        <Slab theme="day">
          <Market />
          <BusinessModel />
        </Slab>
        <Slab theme="night">
          <Heard />
          <Simulation />
        </Slab>
        <Slab theme="day">
          <Insights />
          <Recommendation />
          <Measure />
        </Slab>
        <Slab theme="night">
          <Footer />
        </Slab>
      </main>
    </MotionConfig>
  );
}
