import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { models, programmeIcon } from "@/content/site";
import { getProgrammes } from "@/content";
import { lp, type Lang } from "@/i18n/config";
import { copy } from "@/i18n/copy";

const GitHub = () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" /></svg>;

export function Footer({ lang }: { lang: Lang }) {
  const f = copy[lang].footer;
  const L = (p: string) => lp(lang, p);
  const cols: { title: string; links: { label: string; href: string; icon?: string }[] }[] = [
    { title: f.models, links: models.map(m => ({ label: m.name, href: L(m.href), icon: m.icon })) },
    { title: f.research, links: [...getProgrammes(lang).map(p => ({ label: p.name, href: L(`/programmes/${p.slug}`), icon: programmeIcon[p.slug] })), { label: f.allResearch, href: L("/research") }] },
    { title: f.learn, links: [
      { label: f.about, href: L("/about") }, { label: f.news, href: L("/research#latest") }, { label: f.data, href: L("/data") },
      { label: f.careers, href: L("/about#careers") }, { label: f.contact, href: "mailto:contact@namuai.org" },
    ] },
  ];
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="follow">
          <span>{f.follow}</span>
          <a href="https://github.com/namu-ai-lab" aria-label="GitHub"><GitHub /></a>
        </div>
        <div className="ftr-main">
          <p className="tag">{f.tag}</p>
          {cols.map(c => (
            <div key={c.title} className="ftr-col">
              <h2>{c.title}</h2>
              <ul>{c.links.map(l => (
                <li key={l.label}><a href={l.href} lang={/[ɗʼ]/.test(l.label) ? "ha" : undefined}>{l.icon && <span className="ic"><Icon name={l.icon} size={14} stroke={1.5} /></span>}{l.label}</a></li>
              ))}</ul>
            </div>
          ))}
        </div>
        <div className="ftr-base">
          <a href="https://www.namu-ai.org" aria-label="Namu"><Logo className="mark" id="lg-ftr" /></a>
          <nav aria-label="Namu"><a href="https://www.namu-ai.org">{f.aboutNamu}</a><a href="https://www.namu-ai.org/privacy">{f.privacy}</a><a href="https://www.namu-ai.org/terms">{f.terms}</a></nav>
          <small>© 2026 Namu</small>
        </div>
      </div>
    </footer>
  );
}
