import { useCallback, useEffect, useRef, useState } from "react";
import { createSim, isOver, step, type SimState } from "./engine";
import type { MapFrame } from "../components/CityMap";

export interface Frame extends MapFrame {
  online: number;
  budget: number;
  trust: number;
  surge: number;
  stats: SimState["stats"];
}

function snapshot(s: SimState): Frame {
  return {
    tick: s.tick,
    captains: s.captains.map((c) => ({ ...c })),
    queue: s.queue.slice(),
    events: s.events.slice(),
    incentives: s.levers.incentives.slice(),
    safeNight: s.levers.safeNight,
    surge: s.levers.surge,
    online: s.captains.filter((c) => c.status !== "offline").length,
    budget: s.budget,
    trust: s.trust,
    stats: { ...s.stats },
  };
}

interface Options {
  seed?: number;
  tickMs: number;
  running: boolean;
  /** restart from 6 PM when the night ends (hero ambience) */
  loop?: boolean;
  onEnd?: (s: SimState) => void;
}

/** Drives a simulation on a timer and exposes render-ready frames. */
export function useSim({ seed = 7, tickMs, running, loop = false, onEnd }: Options) {
  const simRef = useRef<SimState>(createSim(seed));
  const [frame, setFrame] = useState<Frame>(() => snapshot(simRef.current));
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const s = simRef.current;
      if (isOver(s)) {
        if (loop) {
          simRef.current = createSim(seed + Math.floor(Math.random() * 1000));
          setFrame(snapshot(simRef.current));
        }
        return;
      }
      step(s);
      setFrame(snapshot(s));
      if (isOver(s)) onEndRef.current?.(s);
    }, tickMs);
    return () => window.clearInterval(id);
  }, [running, tickMs, loop, seed]);

  const reset = useCallback((newSeed: number) => {
    simRef.current = createSim(newSeed);
    setFrame(snapshot(simRef.current));
  }, []);

  /** Change levers mid-run and repaint immediately. */
  const mutate = useCallback((fn: (s: SimState) => void) => {
    fn(simRef.current);
    setFrame(snapshot(simRef.current));
  }, []);

  return { frame, reset, mutate, sim: simRef };
}
