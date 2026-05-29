import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Returns the authenticated user, or null if no session exists. */
export const getSession = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { userId: user.id, email: user.email ?? "" };
});

/** Returns the authenticated user, or redirects to /login. */
export const requireAuth = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
});
