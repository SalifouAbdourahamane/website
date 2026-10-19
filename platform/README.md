# Namu developer platform

How the public API, the API keys and the website's live demos fit together, and how to switch them on.

```
browser ──► Vercel (this Next.js site)      ──► Supabase (Auth + Postgres: profiles, api_keys, usage_events)
             /login, /account/*  dashboard            ▲
             /api/keys           create / revoke      │ key lookup (cached 30 s), usage metering
             /api/demo/*         server-held demo key │
                    │                                 │
developer app ──────┴──► namu-gateway (Modal, CPU, the only public API)
                           auth · scopes · beta status · quota · rate limit · size caps
                           │  Modal proxy auth (Modal-Key / Modal-Secret)
                           ▼
              namu-transcribe · namu-voice · namu-interpret · namu-agent     (GPU, locked)
```

## What is where

| Path | What it is |
| --- | --- |
| `supabase/migrations/0001_developer_api.sql` | Tables, row-level security, the trigger that creates a pending profile on sign-up, and the two functions the gateway calls |
| `platform/modal/namu_gateway.py` | The public API (`/v1/transcribe`, `/v1/speech`, `/v1/translate`, `/v1/converse`, `/v1/models`, `/v1/voices`, `/v1/usage`) |
| `platform/modal/namu_{transcribe,voice,interpret,agent}.py` | The model services, with the proxy-auth switch |
| `platform/tests/test_gateway.py` | Gateway tests with fake store, upstream and limiter: `cd platform && python -m pytest tests -q` |
| `src/app/api/keys`, `src/app/api/demo/[model]`, `src/app/[lang]/account/*`, `src/app/[lang]/docs` | Dashboard, key minting, live demos, docs |

## Security model, in short

- **Keys** are `namu_sk_` + 43 base62 characters (256 random bits), minted on the server (`src/lib/keys.ts`).
  The browser sees the secret once. The database stores only `HMAC-SHA256(NAMU_KEY_PEPPER, key)` and a short
  prefix. A database leak alone does not reveal usable keys.
- **Signed-in users can only read** their own profile, keys (without the hash column) and usage. Every write
  goes through a server route that checks the session first, using the service role.
- **Private beta**: new accounts are `pending`. An admin approves them at `/account/admin`. Denying an account
  also stops its existing keys (the gateway checks the owner's status on every lookup).
- **Gateway checks**, in order: key present → known → not revoked → owner approved → scope → monthly audio
  quota → per-key rate limit (60/min by default) → size and duration caps (25 MB, 5 min, 2,000 characters),
  measured with ffprobe *before* any GPU is called.
- **Demo**: the website holds one ordinary key marked `is_demo`. Only demo keys may pass the visitor's IP
  (`X-Namu-Client-IP`); the gateway limits each IP to 30 requests per hour, 15 s of audio and 300 characters.
- **Conversation memory** is namespaced by account (`user_id:session_id`): nobody can read another
  account's conversation by guessing its id.
- **No content is stored**: `usage_events` holds durations, character counts, status codes and latency.
- **Model services** stop answering the open internet once `REQUIRE_PROXY_AUTH = True`: Modal rejects
  requests without the proxy token at its edge, before a container (or a GPU) starts.

## Switching it on (in order)

1. **Supabase**: create a project. In the SQL editor, run `supabase/migrations/0001_developer_api.sql`.
   In Authentication → URL configuration, set the Site URL to the website's URL and add
   `https://<site>/api/auth/callback` (and the Vercel preview pattern, if wanted) to the redirect URLs.
   Magic-link email works out of the box; Google/GitHub need their own OAuth apps, then list them in
   `NEXT_PUBLIC_AUTH_PROVIDERS`.
2. **Pepper**: generate one secret, used by both sides:
   `python -c "import secrets; print(secrets.token_urlsafe(48))"`
3. **Modal secrets** (dashboard → Secrets, or CLI):
   ```
   modal secret create namu-supabase SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<service role key>
   modal secret create namu-key-pepper NAMU_KEY_PEPPER=<pepper>
   ```
4. **Deploy the gateway**: `modal deploy platform/modal/namu_gateway.py` →
   `https://abdoulide71--namu-gateway-api.modal.run/v1/health` should answer.
5. **Vercel env vars**: see `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NAMU_KEY_PEPPER`, later `NAMU_DEMO_KEY`). Redeploy.
6. **First admin**: sign up on the site with your own email, then in the SQL editor:
   ```sql
   update public.profiles set role = 'admin', beta_status = 'approved', reviewed_at = now()
   where email = 'you@example.org';
   ```
7. **Demo key**: in `/account/keys`, create a key named `website demo`, copy it into Vercel as `NAMU_DEMO_KEY`,
   then mark it:
   ```sql
   update public.api_keys set is_demo = true, scopes = array['transcribe','speech','translate']
   where name = 'website demo';
   ```
   Give the admin account a larger monthly allowance if the demo is busy (it counts against its owner).
8. **Lock the model services** (do this last, after step 4 works end to end):
   1. Modal dashboard → Settings → Proxy auth tokens → create a token.
   2. `modal secret create namu-proxy-auth MODAL_PROXY_KEY=wk-... MODAL_PROXY_SECRET=ws-...`
   3. Set `REQUIRE_PROXY_AUTH = True` in all five files under `platform/modal/`.
   4. For each service: `modal app stop <app> --yes` then `modal deploy platform/modal/<file>.py`
      (the voice service needs a `huggingface-token` secret that can read `Namuorg/tenere-omnivoice-hausa`).
   5. Check: a direct `curl` to a model service URL now returns 401; the same call through the gateway works.

   **Before flipping**: anything else that calls the model URLs directly stops working. That includes the
   `namu-chat` web app and `namu_livekit.py` (both live outside this repo). Point them at the gateway with a
   key, or have their *server* send the proxy-auth headers. Never put the proxy token in browser code.

## Verifying a deployment

```
# no key → 401, bad key → 401
curl -i $API/v1/speech -d '{}'
curl -i $API/v1/speech -H "Authorization: Bearer namu_sk_nope" -d '{}'
# a real key → WAV
curl $API/v1/speech -H "Authorization: Bearer $NAMU_API_KEY" -H "Content-Type: application/json" \
  -d '{"text": "Barka da safiya!", "voice": "nadia"}' -o out.wav
# revoke it in the dashboard → within 30 s the same call returns 401 key_revoked
```

Then confirm in Supabase that `api_keys` holds only hashes and prefixes, and `usage_events` holds no text.

## Credentials to rotate

Some tokens were pasted into chat sessions while this was built. Rotate them and update the secrets that hold
them: both Hugging Face tokens (the `huggingface-token` Modal secret), and the OpenRouter key (the
`gemini-api-key` Modal secret used by `namu-agent`).
