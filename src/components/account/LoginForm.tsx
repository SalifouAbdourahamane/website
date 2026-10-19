"use client";

import { useState, type FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { accountCopy } from "@/content/account";
import type { Lang } from "@/i18n/config";

type Provider = "google" | "github";

/* Email magic link, plus Google and GitHub when NEXT_PUBLIC_AUTH_PROVIDERS lists them (e.g. "google,github"). */
export function LoginForm({ lang, next, providers, linkError }: { lang: Lang; next: string; providers: Provider[]; linkError: boolean }) {
  const t = accountCopy[lang].login;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(linkError ? "error" : "idle");
  const callback = () => `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;

  async function send(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: callback() } });
    setState(error ? "error" : "sent");
  }
  async function oauth(provider: Provider) {
    await supabaseBrowser().auth.signInWithOAuth({ provider, options: { redirectTo: callback() } });
  }

  if (state === "sent") return <p className="acct-note" role="status">{t.sent(email.trim())}</p>;
  return (
    <div className="acct-login">
      <form onSubmit={send} className="acct-form">
        <label className="field">
          <span>{t.email}</span>
          <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.org" />
        </label>
        <button type="submit" className="pill lg dark" disabled={state === "sending"}>{state === "sending" ? t.sending : t.send}</button>
        {state === "error" && <p className="acct-error" role="alert">{t.error}</p>}
      </form>
      {providers.length > 0 && <>
        <p className="acct-or"><span>{t.or}</span></p>
        <div className="acct-oauth">
          {providers.includes("google") && <button type="button" className="pill lg" onClick={() => oauth("google")}>{t.google}</button>}
          {providers.includes("github") && <button type="button" className="pill lg" onClick={() => oauth("github")}>{t.github}</button>}
        </div>
      </>}
    </div>
  );
}
