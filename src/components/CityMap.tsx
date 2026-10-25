import { memo, useMemo } from "react";
import { ZONES, ZONE_BY_ID, type Captain, type Request, type SimEvent, type ZoneId } from "../sim/engine";

export interface MapFrame {
  tick: number;
  captains: Captain[];
  queue: Request[];
  events: SimEvent[];
  incentives: ZoneId[];
  safeNight: boolean;
}

interface Props {
  frame: MapFrame;
  night: boolean;
  /** ms one tick lasts on screen, used to pace captain movement */
  tickMs: number;
  onZoneClick?: (id: ZoneId) => void;
  showLabels?: boolean;
}

const VIEW_W = 600;
const VIEW_H = 440;

// roads drawn once from the zone neighbour graph
const ROADS = (() => {
  const seen = new Set<string>();
  const out: [ZoneId, ZoneId][] = [];
  for (const z of ZONES) {
    for (const n of z.neighbors) {
      const key = [z.id, n].sort().join("-");
      if (!seen.has(key)) {
        seen.add(key);
        out.push([z.id, n]);
      }
    }
  }
  return out;
})();

/** Spiral slot around a zone so captains in the same zone don't overlap. */
function slot(zone: ZoneId, i: number) {
  const z = ZONE_BY_ID[zone];
  const angle = i * 2.399963; // golden angle
  const r = 9 + 4.1 * Math.sqrt(i);
  return { x: z.x + Math.cos(angle) * r, y: z.y + Math.sin(angle) * r };
}

function CityMapImpl({ frame, night, tickMs, onZoneClick, showLabels = true }: Props) {
  const positions = useMemo(() => {
    const counters: Partial<Record<ZoneId, number>> = {};
    const map = new Map<number, { x: number; y: number }>();
    for (const c of frame.captains) {
      if (c.status === "offline") {
        map.set(c.id, slot(c.home, 30));
        continue;
      }
      const i = counters[c.zone] ?? 0;
      counters[c.zone] = i + 1;
      map.set(c.id, slot(c.zone, i));
    }
    return map;
  }, [frame.captains]);

  const waiting = useMemo(() => {
    const byZone: Partial<Record<ZoneId, number>> = {};
    for (const r of frame.queue) byZone[r.zone] = (byZone[r.zone] ?? 0) + 1;
    return byZone;
  }, [frame.queue]);

  const idleBy = useMemo(() => {
    const byZone: Partial<Record<ZoneId, number>> = {};
    for (const c of frame.captains) if (c.status === "idle") byZone[c.zone] = (byZone[c.zone] ?? 0) + 1;
    return byZone;
  }, [frame.captains]);

  const moveMs = Math.max(500, tickMs * 1.6);

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" height="100%" role="img" aria-label="Map of Delhi NCR zones with captains and waiting riders">
      <defs>
        <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(255,253,235,0.07)" />
        </pattern>
        <radialGradient id="zoneGlow">
          <stop offset="0%" stopColor="#FFC83D" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FFC83D" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="zoneGlowRider">
          <stop offset="0%" stopColor="#B9A6FF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#B9A6FF" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={VIEW_W} height={VIEW_H} fill="url(#dots)" />

      {/* Yamuna, stylised */}
      <path
        d="M430 -10 C 405 60, 440 110, 418 170 S 400 270, 430 330 S 470 420, 455 460"
        fill="none"
        stroke="rgba(140,116,232,0.16)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <text x="438" y="232" fill="rgba(185,166,255,0.35)" fontSize="9" fontFamily="JetBrains Mono, monospace" transform="rotate(78 438 232)">
        YAMUNA
      </text>

      {ROADS.map(([a, b]) => {
        const za = ZONE_BY_ID[a];
        const zb = ZONE_BY_ID[b];
        return (
          <line key={`${a}-${b}`} x1={za.x} y1={za.y} x2={zb.x} y2={zb.y} stroke="rgba(255,253,235,0.08)" strokeWidth="1.5" strokeDasharray="2 5" />
        );
      })}

      {ZONES.map((z) => {
        const w = waiting[z.id] ?? 0;
        const idle = idleBy[z.id] ?? 0;
        const short = w > idle;
        const incent = frame.incentives.includes(z.id);
        return (
          <g
            key={z.id}
            onClick={onZoneClick ? () => onZoneClick(z.id) : undefined}
            style={{ cursor: onZoneClick ? "pointer" : "default" }}
            role={onZoneClick ? "button" : undefined}
            aria-label={onZoneClick ? `${z.name}: ${w} riders waiting, ${idle} idle captains. Toggle incentive.` : undefined}
            tabIndex={onZoneClick ? 0 : undefined}
            onKeyDown={
              onZoneClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onZoneClick(z.id);
                    }
                  }
                : undefined
            }
          >
            <circle cx={z.x} cy={z.y} r={62} fill={short ? "url(#zoneGlowRider)" : "url(#zoneGlow)"} style={{ transition: "opacity 0.6s" }} opacity={night ? 0.8 : 1} />
            <circle cx={z.x} cy={z.y} r={44} fill="rgba(255,253,235,0.02)" stroke={incent ? "#FFC83D" : "rgba(255,253,235,0.12)"} strokeWidth={incent ? 1.5 : 1} strokeDasharray={incent ? "4 4" : undefined}>
              {incent && <animateTransform attributeName="transform" type="rotate" from={`0 ${z.x} ${z.y}`} to={`360 ${z.x} ${z.y}`} dur="14s" repeatCount="indefinite" />}
            </circle>

            {/* waiting riders sit on the outer ring and pulse */}
            {Array.from({ length: Math.min(w, 14) }).map((_, i) => {
              const a = -Math.PI / 2 + (i / 14) * Math.PI * 2;
              const x = z.x + Math.cos(a) * 52;
              const y = z.y + Math.sin(a) * 52;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="3.2" fill="#B9A6FF" filter="url(#glow)" />
                  <circle cx={x} cy={y} r="3.2" fill="none" stroke="#B9A6FF" strokeWidth="1">
                    <animate attributeName="r" values="3;9" dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                </g>
              );
            })}

            {showLabels && (
              <>
                <text x={z.x} y={z.y + 62} textAnchor="middle" fill="rgba(255,253,235,0.82)" fontSize="11.5" fontFamily="Figtree, sans-serif" fontWeight="500">
                  {z.name}
                </text>
                {incent && (
                  <text x={z.x} y={z.y - 56} textAnchor="middle" fill="#FFC83D" fontSize="10" fontFamily="JetBrains Mono, monospace">
                    +₹30/ride
                  </text>
                )}
              </>
            )}
          </g>
        );
      })}

      {/* skipped / lost riders flash and fade */}
      {frame.events
        .filter((e) => e.kind !== "served")
        .slice(0, 12)
        .map((e, i) => {
          const z = ZONE_BY_ID[e.zone];
          const a = (i * 1.7 + frame.tick) % (Math.PI * 2);
          const x = z.x + Math.cos(a) * 34;
          const y = z.y + Math.sin(a) * 34;
          const color = e.kind === "lost" ? "#FF6C4C" : "rgba(185,166,255,0.7)";
          return (
            <g key={`${frame.tick}-${i}`} className="fade-x">
              <line x1={x - 3} y1={y - 3} x2={x + 3} y2={y + 3} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
              <line x1={x + 3} y1={y - 3} x2={x - 3} y2={y + 3} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            </g>
          );
        })}

      {frame.captains.map((c) => {
        const p = positions.get(c.id)!;
        const offline = c.status === "offline";
        const busy = c.status === "busy";
        const verified = frame.safeNight && c.safe;
        return (
          <g
            key={c.id}
            style={{
              transform: `translate(${p.x}px, ${p.y}px)`,
              transition: `transform ${moveMs}ms cubic-bezier(0.45, 0, 0.2, 1), opacity 900ms ease`,
              opacity: offline ? 0 : 1,
            }}
          >
            {verified && <circle r="6" fill="none" stroke="#B9A6FF" strokeWidth="1.2" opacity="0.9" />}
            <circle r={busy ? 2.6 : 3.4} fill={busy ? "rgba(255,200,61,0.45)" : "#FFC83D"} filter={busy ? undefined : "url(#glow)"} />
          </g>
        );
      })}
    </svg>
  );
}

export const CityMap = memo(CityMapImpl);
