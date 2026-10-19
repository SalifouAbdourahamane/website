"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

/* Supabase in the browser: used only to start sign-in. The anon key is public by design; RLS protects the data. */
export const supabaseBrowser = () => createBrowserClient(supabaseUrl, supabaseAnonKey);
