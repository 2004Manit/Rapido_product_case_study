import { useState, type ReactNode } from "react";

/* ---------- horizontal bars ---------- */
export interface HBarDatum { label: string; value: number; display: string; color?: string; note?: ReactNode }

export function HBarChart({ data, max, caption }: { data: HBarDatum[]; max?: number; caption: ReactNode }) {
  const [hover, setHover] = useState<number | null>(null);
  const top = max ?? Math.max(...data.map((d) => d.value));
  return (
    <div>
      <div className="hbar" onPointerLeave={() => setHover(null)}>
        {data.map((d, i) => (
          <div
            className="hbar-row"
            key={d.label}
            onPointerEnter={() => setHover(i)}
            onClick={() => setHover(i)}
            style={{ opacity: hover === null || hover === i ? 1 : 0.55, transition: "opacity 0.2s" }}
          >
            <span>{d.label}</span>
            <div className="hbar-track">
              <div className="hbar-fill" style={{ width: `${Math.max(2, (d.value / top) * 100)}%`, background: d.color ?? "var(--bar)" }} />
            </div>
            <span className="hbar-val">{d.display}</span>
          </div>
        ))}
      </div>
      <p className="card-src" style={{ minHeight: 34 }} aria-live="polite">
        {hover !== null && data[hover].note ? data[hover].note : caption}
      </p>
    </div>
  );
}

/* ---------- columns ---------- */
export interface ColDatum { label: string; value: number; display: string; note: string }

export function ColumnChart({ data, unit }: { data: ColDatum[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 320, H = 170, PB = 24, PT = 22;
  const max = Math.max(...data.map((d) => d.value)) * 1.08;
  const bw = 46;
  const gap = (W - bw * data.length) / (data.length + 1);
  return (
    <div className="chart" onPointerLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={data.map((d) => `${d.label}: ${d.display}`).join(", ")}>
        <line x1="0" x2={W} y1={H - PB} y2={H - PB} stroke="var(--line-strong)" />
        {data.map((d, i) => {
          const x = gap + i * (bw + gap);
          const h = (d.value / max) * (H - PB - PT);
          const y = H - PB - h;
          const last = i === data.length - 1;
          return (
            <g key={d.label} onPointerEnter={() => setHover(i)} onClick={() => setHover(i)} style={{ cursor: "default" }}>
              <rect x={x - gap / 2} y={0} width={bw + gap} height={H} fill="transparent" />
              <path
                d={`M${x},${H - PB} V${y + 4} Q${x},${y} ${x + 4},${y} H${x + bw - 4} Q${x + bw},${y} ${x + bw},${y + 4} V${H - PB} Z`}
                fill={last ? "var(--bar)" : "var(--bar-faint)"}
                style={{ filter: hover === i ? "brightness(1.2)" : undefined, transition: "filter 0.2s" }}
              />
              <text x={x + bw / 2} y={y - 7} textAnchor="middle" fill="var(--fg)" fontSize="17" fontFamily="EB Garamond, serif">{d.display}</text>
              <text x={x + bw / 2} y={H - 7} textAnchor="middle" fill="var(--fg-3)" fontSize="10.5" fontFamily="JetBrains Mono, monospace">{d.label}</text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="chart-tooltip" style={{ left: `${((gap + hover * (bw + gap) + bw / 2) / W) * 100}%`, top: 0 }}>
          <div className="t">{data[hover].label}</div>
          <div><b>{data[hover].display}</b> {unit}</div>
          <div className="dim" style={{ fontSize: 11 }}>{data[hover].note}</div>
        </div>
      )}
    </div>
  );
}

/* ---------- lines ---------- */
export interface LineSeries { name: string; short: string; color: string; values: number[] }

export function LineChart({ labels, series, yMax, ySuffix = "" }: { labels: string[]; series: LineSeries[]; yMax: number; ySuffix?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 360, H = 190, PL = 26, PR = 64, PT = 10, PB = 24;
  const x = (i: number) => PL + (i / (labels.length - 1)) * (W - PL - PR);
  const y = (v: number) => PT + (1 - v / yMax) * (H - PT - PB);
  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left) / r.width) * (labels.length - 1));
    setHover(Math.max(0, Math.min(labels.length - 1, i)));
  };
  const last = labels.length - 1;
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={series.map((s) => `${s.name}: ${s.values.map((v, i) => `${labels[i]} ${Math.round(v)}`).join(", ")}`).join("; ")}>
        {[0.2, 0.4, 0.6, 0.8, 1].map((f) => (
          <g key={f}>
            <line x1={PL} x2={W - PR} y1={y(yMax * f)} y2={y(yMax * f)} stroke="var(--line)" />
            <text x={PL - 6} y={y(yMax * f) + 3} textAnchor="end" fill="var(--fg-3)" fontSize="9.5" fontFamily="JetBrains Mono, monospace">{Math.round(yMax * f)}</text>
          </g>
        ))}
        <line x1={PL} x2={W - PR} y1={y(0)} y2={y(0)} stroke="var(--line-strong)" />
        {series.map((s) => (
          <path key={s.name} d={s.values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ")} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {series.map((s, si) => (
          <text key={s.name} x={x(last) + 8} y={y(s.values[last]) + (si === 0 ? 10 : -4)} fill="var(--fg-2)" fontSize="10.5" fontFamily="Figtree, sans-serif">{s.short}</text>
        ))}
        {labels.map((l, i) => (
          <text key={l} x={x(i)} y={H - 6} textAnchor="middle" fill="var(--fg-3)" fontSize="9.5" fontFamily="JetBrains Mono, monospace">{l}</text>
        ))}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PT} y2={y(0)} stroke="var(--fg-3)" strokeDasharray="3 3" />
            {series.map((s) => <circle key={s.name} cx={x(hover)} cy={y(s.values[hover])} r="4.5" fill={s.color} stroke="var(--card)" strokeWidth="2" />)}
          </g>
        )}
        <rect x={PL} y={0} width={W - PL - PR} height={H} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} style={{ touchAction: "pan-y" }} />
      </svg>
      {hover !== null && (
        <div className="chart-tooltip" style={{ left: `${(x(hover) / W) * 100}%`, top: 0 }}>
          <div className="t">{labels[hover]}</div>
          {series.map((s) => (
            <div className="row2" key={s.name}><span className="legend-item"><span className="swatch" style={{ background: s.color }} />{s.name}</span><b>{Math.round(s.values[hover])}{ySuffix}</b></div>
          ))}
        </div>
      )}
      <div className="chart-legend">
        {series.map((s) => <span className="legend-item" key={s.name}><span className="legend-line" style={{ background: s.color }} />{s.name}</span>)}
      </div>
    </div>
  );
}
