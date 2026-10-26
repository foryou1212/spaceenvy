"use server";

import { redirect } from "next/navigation";
import { createSupabaseActionClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

async function clearDeniedSession(supabase: Awaited<ReturnType<typeof createSupabaseActionClient>>) {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Unable to clear an unapproved admin session.", error);
}

export type LoginState = {
  message: string;
  success: boolean;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Supabase is not configured. Add the connection settings before signing in.",
    };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password || email.length > 254 || password.length > 256) {
    return { success: false, message: "Enter your email address and password." };
  }

  const supabase = await createSupabaseActionClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return {
      success: false,
      message: "Those sign-in details could not be verified.",
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Signed-in admin session could not be verified.", userError);
    await clearDeniedSession(supabase);
    return {
      success: false,
      message: "We could not verify this account. Please try again.",
    };
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error("Unable to verify admin access after sign-in.", adminError);
    await clearDeniedSession(supabase);
    return {
      success: false,
      message: "Admin access could not be verified. Please try again later.",
    };
  }

  if (!admin) {
    await clearDeniedSession(supabase);
    return {
      success: false,
      message: "This account has not been approved for SpaceEnvy admin access.",
    };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createSupabaseActionClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Unable to sign out from the admin workspace.", error);
    throw new Error("Unable to sign out. Please try again.");
  }
  redirect("/admin/login");
}
