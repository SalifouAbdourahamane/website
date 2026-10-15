"use client";

/* Use cases, after openai.com/api: a list of names on the left; choosing one changes the large picture on the
   right, which carries a small mock-up of that product. Pictures and mock-ups are rendered on the server and
   passed in. Follows the WAI-ARIA tabs pattern, vertical. */
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "./Icon";

type Use = { icon: string; t: string; d: string };

export function ApiUseCases({ uses, arts, mocks, cta, mail }: { uses: Use[]; arts: ReactNode[]; mocks: ReactNode[]; cta: string; mail: string[] }) {
  const [i, setI] = useState(0);
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowDown" ? 1 : uses.length - 1)) % uses.length;
    setI(next); document.getElementById(`uc-tab-${next}`)?.focus();
  };
  return (
    <div className="uc">
      <div className="uc-list" role="tablist" aria-orientation="vertical" onKeyDown={onKey}>
        {uses.map((u, k) => (
          <button key={u.t} id={`uc-tab-${k}`} type="button" role="tab" aria-selected={k === i} aria-controls="uc-panel" tabIndex={k === i ? 0 : -1} onClick={() => setI(k)}>
            <span className="uc-ic"><Icon name={u.icon} size={20} stroke={1.5} /></span>
            <span className="uc-name">{u.t}</span>
            <Icon name="arrow-long" size={16} stroke={1.6} className="uc-go" />
          </button>
        ))}
      </div>
      <div id="uc-panel" className="uc-panel" role="tabpanel" aria-labelledby={`uc-tab-${i}`}>
        <div className="uc-stage" key={i}>
          <span className="art" aria-hidden="true">{arts[i]}</span>
          <div className="uc-mock">{mocks[i]}</div>
        </div>
        <div className="uc-text">
          <p>{uses[i].d}</p>
          <a className="textlink" href={mail[i]}><span>{cta}</span><Icon name="arrow-long" size={16} stroke={1.6} /></a>
        </div>
      </div>
    </div>
  );
}
