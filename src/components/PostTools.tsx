"use client";

import { useEffect, useRef, useState } from "react";

/** Sticky section tabs with scroll-spy (the SIMA 2 pattern). Keyboard: native links. */
export function SectionTabs({ sections }: { sections: { id: string; title: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const heads = sections.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-140px 0px -60% 0px" });
    heads.forEach(h => io.observe(h));
    return () => io.disconnect();
  }, [sections]);
  useEffect(() => {
    const a = nav.current?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    a?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);
  return (
    <div className="tabs">
      <nav ref={nav} aria-label="Sections">
        {sections.map(s => <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined}>{s.title}</a>)}
      </nav>
    </div>
  );
}

/** Thin reading-progress line under the sticky header (the WeatherNext pattern). */
export function ReadingProgress({ target = "article" }: { target?: string }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(target);
    if (!el || !bar.current) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - innerHeight * .6;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
      bar.current?.style.setProperty("--p", p.toFixed(4));
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => { removeEventListener("scroll", update); removeEventListener("resize", update); };
  }, [target]);
  return <div ref={bar} className="progress" aria-hidden="true" />;
}

export function Share({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    const url = location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true); setTimeout(() => setCopied(false), 1600);
    } catch { /* dismissed */ }
  };
  return (
    <button type="button" className="share" onClick={onClick} aria-live="polite">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 15V3.5" /><path d="M7.5 8L12 3.5 16.5 8" /><path d="M5 12.5v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      </svg>
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
