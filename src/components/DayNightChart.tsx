import { useState } from "react";
import { DAY_CURVE } from "../content";

const W = 720;
const H = 260;
const PAD = { l: 12, r: 70, t: 16, b: 30 };
const NIGHT_FROM = DAY_CURVE.findIndex((d) => d.hour === "9 PM");

const x = (i: number) => PAD.l + (i / (DAY_CURVE.length - 1)) * (W - PAD.l - PAD.r);
const y = (v: number) => PAD.t + (1 - v / 100) * (H - PAD.t - PAD.b);

function path(key: "riders" | "captains") {
  return DAY_CURVE.map((d, i) => {
    if (i === 0) return `M${x(i)},${y(d[key])}`;
    const px = x(i - 1);
    const py = y(DAY_CURVE[i - 1][key]);
    const cx = (px + x(i)) / 2;
    return `C${cx},${py} ${cx},${y(d[key])} ${x(i)},${y(d[key])}`;
  }).join(" ");
}

function gapArea() {
  const start = NIGHT_FROM - 1;
  const pts = DAY_CURVE.slice(start);
  const top = pts.map((d, i) => `${x(start + i)},${y(d.riders)}`).join(" L");
  const bottom = pts.map((d, i) => `${x(start + i)},${y(d.captains)}`).reverse().join(" L");
  return `M${top} L${bottom} Z`;
}

export function DayNightChart() {
  const [hover, setHover] = useState<number | null>(null);
  const last = DAY_CURVE.length - 1;
  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - rect.left) / rect.width) * last);
    setHover(Math.max(0, Math.min(last, i)));
  };
  const h = hover !== null ? DAY_CURVE[hover] : null;

  return (
    <div className="card">
      <div className="card-title">Riders wanting a ride vs captains online, across a day</div>
      <div className="card-sub">Illustrative shape built from 70 interviews. Not Rapido data.</div>
      <div className="chart">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-hidden="true">
          <rect x={x(NIGHT_FROM)} y={PAD.t} width={x(last) - x(NIGHT_FROM)} height={H - PAD.t - PAD.b} fill="rgba(140,116,232,0.08)" rx="6" />
          <text x={x(NIGHT_FROM) + 8} y={PAD.t + 14} fill="var(--fg-3)" fontSize="11" fontFamily="JetBrains Mono, monospace">AFTER 9 PM</text>
          {[25, 50, 75, 100].map((v) => <line key={v} x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--line)" />)}
          <line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} stroke="var(--line-strong)" />
          <path d={gapArea()} fill="rgba(140,116,232,0.2)" />
          <text x={x(NIGHT_FROM + 2.2)} y={(y(DAY_CURVE[NIGHT_FROM + 2].riders) + y(DAY_CURVE[NIGHT_FROM + 2].captains)) / 2 + 4} fill="var(--fg)" fontSize="12" fontFamily="Figtree, sans-serif" fontWeight="600">Night gap</text>
          <path d={path("riders")} fill="none" stroke="var(--series-rider)" strokeWidth="2" strokeLinecap="round" />
          <path d={path("captains")} fill="none" stroke="var(--series-captain)" strokeWidth="2" strokeLinecap="round" />
          <text x={x(last) + 10} y={y(DAY_CURVE[last].riders) - 2} fill="var(--fg-2)" fontSize="12" fontFamily="Figtree, sans-serif">Riders</text>
          <text x={x(last) + 10} y={y(DAY_CURVE[last].captains) + 12} fill="var(--fg-2)" fontSize="12" fontFamily="Figtree, sans-serif">Captains</text>
          {DAY_CURVE.map((d, i) => (i % 3 === 0 || i === last ? (
            <text key={d.hour} x={x(i)} y={H - 8} textAnchor="middle" fill="var(--fg-3)" fontSize="11" fontFamily="JetBrains Mono, monospace">{d.hour}</text>
          ) : null))}
          {h && hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={y(0)} stroke="var(--fg-3)" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(h.riders)} r="5" fill="var(--series-rider)" stroke="var(--card)" strokeWidth="2" />
              <circle cx={x(hover)} cy={y(h.captains)} r="5" fill="var(--series-captain)" stroke="var(--card)" strokeWidth="2" />
            </g>
          )}
          <rect x={PAD.l} y={0} width={W - PAD.l - PAD.r} height={H} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} style={{ touchAction: "pan-y" }} />
        </svg>
        {h && hover !== null && (
          <div className="chart-tooltip" style={{ left: `${(x(hover) / W) * 100}%`, top: 0 }}>
            <div className="t">{h.hour}</div>
            <div className="row2"><span className="legend-item"><span className="swatch" style={{ background: "var(--series-rider)" }} />Riders</span><b>{h.riders}</b></div>
            <div className="row2"><span className="legend-item"><span className="swatch" style={{ background: "var(--series-captain)" }} />Captains</span><b>{h.captains}</b></div>
          </div>
        )}
      </div>
      <div className="chart-legend">
        <span className="legend-item"><span className="legend-line" style={{ background: "var(--series-rider)" }} />Riders wanting a ride</span>
        <span className="legend-item"><span className="legend-line" style={{ background: "var(--series-captain)" }} />Captains online</span>
      </div>
      <div className="sr-only">
        <table>
          <caption>Relative rider demand and captain supply by hour (index, peak = 100). Illustrative.</caption>
          <thead><tr><th>Hour</th><th>Riders</th><th>Captains</th></tr></thead>
          <tbody>{DAY_CURVE.map((d) => <tr key={d.hour}><td>{d.hour}</td><td>{d.riders}</td><td>{d.captains}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
