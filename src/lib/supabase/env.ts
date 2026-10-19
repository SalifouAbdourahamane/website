/* Which parts of the developer platform are configured. The site builds and serves its public pages
   without any of these; account pages and the live demos say so instead of failing. */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const hasSupabase = () => Boolean(supabaseUrl && supabaseAnonKey);

/** The public API base developers call. *.modal.run until api.namu-ai.org is pointed at the gateway. */
export const apiBase = (process.env.NEXT_PUBLIC_NAMU_API_BASE || "https://abdoulide71--namu-gateway-api.modal.run").replace(/\/+$/, "");
