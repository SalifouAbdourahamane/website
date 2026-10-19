import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./env";

/* Supabase as the signed-in visitor, for server components and route handlers. Row-level security applies.
   Server components cannot write cookies; the session is refreshed in src/proxy.ts, so failures here are ignored. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: list => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* server component */ }
      },
    },
  });
}

/** The signed-in user, verified with Supabase Auth (not just read from the cookie), or null. */
export async function currentUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user ?? null };
}
