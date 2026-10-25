import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** One teardown section: centered label + serif headline, evidence below. */
export function Row({
  id, index, title, headline, desc, action, children,
}: {
  id: string;
  index: string;
  /** small uppercase label */
  title: string;
  /** large serif headline; wrap the key phrase in <em> */
  headline: ReactNode;
  desc?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="row" id={id}>
      <div className="container">
        <Reveal className="row-head">
          <span className="eyebrow"><span className="num">{index}</span>{title}</span>
          <h2 className="display">{headline}</h2>
          {desc && <p className="desc">{desc}</p>}
          {action}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

/** Hand-drawn marker underline for a key word. */
export function Underline({ children }: { children: ReactNode }) {
  return (
    <span className="u-hand">
      {children}
      <svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
        <path d="M3 13 C 40 6, 90 4, 130 8 S 185 14, 197 9" />
      </svg>
    </span>
  );
}
