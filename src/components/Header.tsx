"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { models, programmeIcon, switcher } from "@/content/site";
import { programmes } from "@/content/programmes";

type Menu = null | "research" | "models" | "switch" | "sheet";

/* DeepMind-pattern header: transparent over the hero, a white frosted bar once the page scrolls,
   mega menus that drop a white sheet with icon rows, and a full-screen sheet on small screens. */
export function Header() {
  const path = usePathname();
  const [menu, setMenu] = useState<Menu>(null);
  const [solid, setSolid] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const overHero = path === "/";

  useEffect(() => { setMenu(null); }, [path]);
  useEffect(() => {
    const on = () => setSolid(!overHero || window.scrollY > 8);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [overHero]);
  useEffect(() => {
    if (!menu) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(null); };
    const click = (e: MouseEvent) => { if (!bar.current?.contains(e.target as Node)) setMenu(null); };
    document.addEventListener("keydown", key); document.addEventListener("click", click);
    document.body.style.overflow = menu === "sheet" ? "hidden" : "";
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("click", click); document.body.style.overflow = ""; };
  }, [menu]);

  const toggle = (m: Menu) => setMenu(cur => (cur === m ? null : m));
  const cls = ["hdr", solid ? "solid" : "", menu ? "open" : ""].join(" ");

  return (
    <header ref={bar} className={cls}>
      <a className="skip" href="#main">Skip to main content</a>
      <div className="wrap">
        <a className="brand" href="/" aria-label="Namu AI Lab home"><Logo className="mark" /><span className="rule" aria-hidden="true" /><span className="lab">AI Lab</span></a>
        <button className="switch-btn" type="button" aria-expanded={menu === "switch"} aria-controls="switch-panel" aria-label="Namu sites" onClick={() => toggle("switch")}>
          <Icon name="chevron" size={14} stroke={1.6} />
        </button>
        <nav className="nav" aria-label="Main">
          <button type="button" aria-expanded={menu === "research"} aria-controls="mega-research" onClick={() => toggle("research")}>Research <Icon name="chevron" size={14} stroke={1.6} /></button>
          <button type="button" aria-expanded={menu === "models"} aria-controls="mega-models" onClick={() => toggle("models")}>Models <Icon name="chevron" size={14} stroke={1.6} /></button>
          <a href="/data" aria-current={path.startsWith("/data") ? "page" : undefined}>Data</a>
          <a href="/about" aria-current={path.startsWith("/about") ? "page" : undefined}>About</a>
        </nav>
        <div className="hdr-cta">
          <a className="pill" href="https://www.namu-ai.org">namu-ai.org</a>
          <a className="pill" href="/models/air"><Icon name="play" size={16} stroke={1.6} />Hear Aïr</a>
        </div>
        <button className="menu-toggle" type="button" aria-expanded={menu === "sheet"} aria-controls="sheet" aria-label={menu === "sheet" ? "Close menu" : "Open menu"} onClick={() => toggle("sheet")}>
          <Icon name={menu === "sheet" ? "close" : "menu"} size={22} stroke={1.6} />
        </button>
      </div>

      <div id="switch-panel" className="switch-panel" hidden={menu !== "switch"}>
        {switcher.map(s => <a key={s.label} href={s.href} aria-current={s.current ? "true" : undefined}><span>{s.label}</span><span>{s.note}</span></a>)}
      </div>

      <div id="mega-research" className="mega" hidden={menu !== "research"}>
        <div className="wrap">
          <div className="mega-intro">
            <p className="h3">Research</p>
            <p>Five programmes on how machines hear, understand and answer in Hausa and Zarma.</p>
            <a className="pill dark" href="/research">Explore research</a>
          </div>
          <div className="mega-list">
            {programmes.map(p => (
              <a key={p.slug} className="mega-item" href={`/programmes/${p.slug}`}>
                <span className="ic"><Icon name={programmeIcon[p.slug]} size={22} stroke={1.4} /></span>
                <span><b lang={/[ɗʼ]/.test(p.name) ? "ha" : undefined}>{p.name}</b><span>{p.title}</span></span>
              </a>
            ))}
            <a className="mega-item" href="/research#latest">
              <span className="ic"><Icon name="paper" size={22} stroke={1.4} /></span>
              <span><b>Latest research</b><span>Posts, notes and methods</span></span>
            </a>
          </div>
        </div>
      </div>

      <div id="mega-models" className="mega" hidden={menu !== "models"}>
        <div className="wrap">
          <div className="mega-intro">
            <p className="h3">Models</p>
            <p>Speech systems for Hausa and the languages around it, built on the Lab’s research.</p>
            <a className="pill dark" href="/#models">View models</a>
          </div>
          <div className="mega-list">
            {models.map(m => (
              <a key={m.slug} className="mega-item" href={m.href}>
                <span className="ic"><Icon name={m.icon} size={22} stroke={1.4} /></span>
                <span><b>{m.name}</b><span>{m.line}</span></span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div id="sheet" className="sheet" hidden={menu !== "sheet"}>
        <details>
          <summary>Research <Icon name="chevron" size={18} stroke={1.6} /></summary>
          <div><a href="/research">Overview</a>{programmes.map(p => <a key={p.slug} href={`/programmes/${p.slug}`}>{p.name}</a>)}</div>
        </details>
        <details>
          <summary>Models <Icon name="chevron" size={18} stroke={1.6} /></summary>
          <div>{models.map(m => <a key={m.slug} href={m.href}>{m.name}</a>)}</div>
        </details>
        <a href="/data">Data</a>
        <a href="/about">About</a>
        <div className="pills"><a className="pill lg" href="https://www.namu-ai.org">namu-ai.org</a><a className="pill lg dark" href="/models/air">Hear Aïr</a></div>
      </div>
    </header>
  );
}
