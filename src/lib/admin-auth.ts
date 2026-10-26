import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  await connection();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError && userError.name !== "AuthSessionMissingError") {
    console.error("Unable to verify the admin session.", userError);
    throw new Error("Unable to verify the admin session.");
  }

  if (!user) redirect("/admin/login");

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error("Unable to verify admin permissions.", adminError);
    throw new Error("Unable to verify admin permissions.");
  }

  if (!admin) redirect("/admin/login?error=not-authorized");

  return { supabase, user };
}
