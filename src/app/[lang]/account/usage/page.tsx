import type { Metadata } from "next";
import { AccountShell, NotConfigured } from "@/components/account/AccountShell";
import { accountCopy } from "@/content/account";
import { isLang, type Lang } from "@/i18n/config";
import { requireAccount } from "@/lib/account";
import { hasSupabase } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; const l: Lang = isLang(lang) ? lang : "en";
  const [title, description] = accountCopy[l].usage.meta;
  return { title, description, robots: { index: false } };
}

type Event = { endpoint: string; audio_seconds: number | string; characters: number; status: number };
const ENDPOINTS = ["transcribe", "speech", "translate", "converse"];

export default async function Usage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  if (!hasSupabase()) return <NotConfigured lang={lang} />;
  const { supabase, profile } = await requireAccount(lang, "/account/usage");
  const t = accountCopy[lang].usage;

  const now = new Date();
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const { data } = await supabase.from("usage_events").select("endpoint, audio_seconds, characters, status")
    .gte("created_at", month).limit(20000);
  const rows = ENDPOINTS.map(ep => {
    const ev = ((data ?? []) as Event[]).filter(e => e.endpoint === ep);
    return {
      ep, requests: ev.length, errors: ev.filter(e => e.status >= 400).length,
      audio: ev.reduce((s, e) => s + Number(e.audio_seconds), 0) / 60, chars: ev.reduce((s, e) => s + e.characters, 0),
    };
  });
  const used = rows.reduce((s, r) => s + r.audio, 0);
  const nf = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 1 });
  const limit = profile.monthly_audio_seconds / 60;
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <AccountShell lang={lang} active="usage" admin={profile.role === "admin"} h1={t.h1} lede={t.lede}>
      <div className="panel acct-card">
        <p className="eyebrow">{t.month}</p>
        <p className="h3">{t.allowance(nf.format(used), nf.format(limit))}</p>
        <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}><i style={{ width: `${pct}%` }} /></div>
      </div>
      <div className="acct-table-wrap">
        <table className="acct-table">
          <thead><tr><th>{t.th.endpoint}</th><th>{t.th.requests}</th><th>{t.th.audio}</th><th>{t.th.chars}</th><th>{t.th.errors}</th></tr></thead>
          <tbody>
            {rows.every(r => r.requests === 0) && <tr><td colSpan={5} className="muted">{t.empty}</td></tr>}
            {rows.filter(r => r.requests > 0).map(r => (
              <tr key={r.ep}><td><code>/v1/{r.ep}</code></td><td>{r.requests}</td><td>{nf.format(r.audio)}</td><td>{r.chars}</td><td>{r.errors}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="meta">{t.note}</p>
    </AccountShell>
  );
}
