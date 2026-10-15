"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { models, programmeIcon, switcher } from "@/content/site";
import { LANG_COOKIE, lp, switchPath, type Lang } from "@/i18n/config";
import type { Copy } from "@/i18n/copy";

type Menu = null | "research" | "models" | "switch" | "sheet";
type Props = { lang: Lang; c: Pick<Copy, "nav" | "models" | "status">; programmes: { slug: string; name: string; title: string }[] };

/** EN · FR. Remembers the visitor's choice so the country-based default never overrides it. */
export function LangSwitch({ lang, label, className = "lang-switch" }: { lang: Lang; label: string; className?: string }) {
  const path = usePathname() || "/";
  const remember = (to: Lang) => { document.cookie = `${LANG_COOKIE}=${to}; path=/; max-age=31536000; samesite=lax`; };
  return (
    <nav className={className} aria-label={label}>
      {(["en", "fr"] as const).map(l => (
        <a key={l} href={switchPath(path, l)} hrefLang={l} lang={l} aria-current={l === lang ? "true" : undefined}
          title={l === "en" ? "English" : "Français"} onClick={() => remember(l)}>{l.toUpperCase()}</a>
      ))}
    </nav>
  );
}

/* DeepMind-pattern header: transparent over the hero, a white frosted bar once the page scrolls,
   mega menus that drop a white sheet with icon rows, and a full-screen sheet on small screens. */
export function Header({ lang, c, programmes }: Props) {
  const raw = usePathname() || "/";
  const path = raw.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";
  const [menu, setMenu] = useState<Menu>(null);
  const [solid, setSolid] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const overHero = path === "/";
  const L = (p: string) => lp(lang, p);
  const n = c.nav;

  useEffect(() => { setMenu(null); }, [raw]);
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
  const notes = [n.switcherNotes.products, n.switcherNotes.research, n.switcherNotes.code];
  const ha = (s: string) => (/[ɗʼ]/.test(s) ? "ha" : undefined);

  return (
    <header ref={bar} className={cls}>
      <a className="skip" href="#main">{n.skip}</a>
      <div className="wrap">
        <a className="brand" href={L("/")} aria-label="Namu AI Lab"><Logo className="mark" /><span className="rule" aria-hidden="true" /><span className="lab">AI Lab</span></a>
        <button className="switch-btn" type="button" aria-expanded={menu === "switch"} aria-controls="switch-panel" aria-label={n.sites} onClick={() => toggle("switch")}>
          <Icon name="chevron" size={14} stroke={1.6} />
        </button>
        <nav className="nav" aria-label="Main">
          <button type="button" aria-expanded={menu === "research"} aria-controls="mega-research" onClick={() => toggle("research")}>{n.research} <Icon name="chevron" size={14} stroke={1.6} /></button>
          <button type="button" aria-expanded={menu === "models"} aria-controls="mega-models" onClick={() => toggle("models")}>{n.models} <Icon name="chevron" size={14} stroke={1.6} /></button>
          <a href={L("/data")} aria-current={path.startsWith("/data") ? "page" : undefined}>{n.data}</a>
          <a href={L("/about")} aria-current={path.startsWith("/about") ? "page" : undefined}>{n.about}</a>
        </nav>
        <LangSwitch lang={lang} label={n.language} />
        <div className="hdr-cta">
          <a className="pill" href="https://www.namu-ai.org">namu-ai.org</a>
          <a className="pill" href={L("/models/air")}><Icon name="play" size={16} stroke={1.6} />{n.hearAir}</a>
        </div>
        <button className="menu-toggle" type="button" aria-expanded={menu === "sheet"} aria-controls="sheet" aria-label={menu === "sheet" ? n.closeMenu : n.openMenu} onClick={() => toggle("sheet")}>
          <Icon name={menu === "sheet" ? "close" : "menu"} size={22} stroke={1.6} />
        </button>
      </div>

      <div id="switch-panel" className="switch-panel" hidden={menu !== "switch"}>
        {switcher.map((s, i) => <a key={s.label} href={s.href === "/" ? L("/") : s.href} aria-current={s.current ? "true" : undefined}><span>{s.label}</span><span>{notes[i]}</span></a>)}
      </div>

      <div id="mega-research" className="mega" hidden={menu !== "research"}>
        <div className="wrap">
          <div className="mega-intro">
            <p className="h3">{n.research}</p>
            <p>{n.researchIntro}</p>
            <a className="pill dark" href={L("/research")}>{n.exploreResearch}</a>
          </div>
          <div className="mega-list">
            {programmes.map(p => (
              <a key={p.slug} className="mega-item" href={L(`/programmes/${p.slug}`)}>
                <span className="ic"><Icon name={programmeIcon[p.slug]} size={22} stroke={1.4} /></span>
                <span><b lang={ha(p.name)}>{p.name}</b><span>{p.title}</span></span>
              </a>
            ))}
            <a className="mega-item" href={L("/research#latest")}>
              <span className="ic"><Icon name="paper" size={22} stroke={1.4} /></span>
              <span><b>{n.latest}</b><span>{n.latestSub}</span></span>
            </a>
          </div>
        </div>
      </div>

      <div id="mega-models" className="mega" hidden={menu !== "models"}>
        <div className="wrap">
          <div className="mega-intro">
            <p className="h3">{n.models}</p>
            <p>{n.modelsIntro}</p>
            <a className="pill dark" href={L("/#models")}>{n.viewModels}</a>
          </div>
          <div className="mega-list">
            {models.map(m => (
              <a key={m.slug} className="mega-item" href={L(m.href)}>
                <span className="ic"><Icon name={m.icon} size={22} stroke={1.4} /></span>
                <span><b>{m.name}</b><span>{c.models[m.slug]?.line ?? m.line}</span></span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div id="sheet" className="sheet" hidden={menu !== "sheet"}>
        <details>
          <summary>{n.research} <Icon name="chevron" size={18} stroke={1.6} /></summary>
          <div><a href={L("/research")}>{n.overview}</a>{programmes.map(p => <a key={p.slug} href={L(`/programmes/${p.slug}`)} lang={ha(p.name)}>{p.name}</a>)}</div>
        </details>
        <details>
          <summary>{n.models} <Icon name="chevron" size={18} stroke={1.6} /></summary>
          <div>{models.map(m => <a key={m.slug} href={L(m.href)}>{m.name}</a>)}</div>
        </details>
        <a href={L("/data")}>{n.data}</a>
        <a href={L("/about")}>{n.about}</a>
        <div className="pills"><a className="pill lg" href="https://www.namu-ai.org">namu-ai.org</a><a className="pill lg dark" href={L("/models/air")}>{n.hearAir}</a></div>
      </div>
    </header>
  );
}
