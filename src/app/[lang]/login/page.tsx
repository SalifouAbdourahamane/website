import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/account/LoginForm";
import { NotConfigured } from "@/components/account/AccountShell";
import { accountCopy } from "@/content/account";
import { isLang, lp, type Lang } from "@/i18n/config";
import { hasSupabase } from "@/lib/supabase/env";
import { currentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; const l: Lang = isLang(lang) ? lang : "en";
  const [title, description] = accountCopy[l].login.meta;
  return { title, description, robots: { index: false } };
}

const PROVIDERS = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "").split(",").map(s => s.trim())
  .filter((p): p is "google" | "github" => p === "google" || p === "github");

export default async function Login({ params, searchParams }:
  { params: Promise<{ lang: string }>; searchParams: Promise<{ next?: string; error?: string }> }) {
  const lang = (await params).lang as Lang;
  if (!hasSupabase()) return <NotConfigured lang={lang} />;
  const sp = await searchParams;
  const fallback = lp(lang, "/account/keys");
  const next = sp.next && /^\/(?!\/)[\w\-/]*$/.test(sp.next) ? sp.next : fallback;
  const { user } = await currentUser();
  if (user) redirect(next);
  const t = accountCopy[lang].login;
  return (
    <section className="page-top wrap intro acct-intro">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1 className="h1">{t.h1}</h1>
      <p className="lede">{t.lede}</p>
      <LoginForm lang={lang} next={next} providers={PROVIDERS} linkError={sp.error === "link"} />
      <p className="meta acct-terms">{t.terms}</p>
    </section>
  );
}
