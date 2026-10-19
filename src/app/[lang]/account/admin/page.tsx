import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountShell, NotConfigured } from "@/components/account/AccountShell";
import { AdminBeta } from "@/components/account/AdminBeta";
import { accountCopy } from "@/content/account";
import { isLang, type Lang } from "@/i18n/config";
import { requireAccount, type Profile } from "@/lib/account";
import { hasSupabase } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; const l: Lang = isLang(lang) ? lang : "en";
  const [title, description] = accountCopy[l].admin.meta;
  return { title, description, robots: { index: false } };
}

const order = { pending: 0, approved: 1, denied: 2 } as const;

export default async function Admin({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang as Lang;
  if (!hasSupabase()) return <NotConfigured lang={lang} />;
  const { supabase, user, profile } = await requireAccount(lang, "/account/admin");
  if (profile.role !== "admin") notFound();
  const t = accountCopy[lang].admin;
  // The "admin profiles" RLS policy lets admins read every profile; writes still go through /api/admin/beta.
  const { data } = await supabase.from("profiles")
    .select("user_id, email, beta_status, role, use_case, monthly_audio_seconds, created_at")
    .order("created_at", { ascending: false }).limit(500);
  const rows = ((data ?? []) as Profile[]).sort((a, b) => order[a.beta_status] - order[b.beta_status]);

  return (
    <AccountShell lang={lang} active="admin" admin h1={t.h1} lede={t.lede}>
      <AdminBeta lang={lang} initial={rows} me={user.id} />
    </AccountShell>
  );
}
