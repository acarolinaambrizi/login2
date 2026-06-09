export const signout = async () => {
  "use server";
  const { supabase } = await import("@/lib/supabase");
  await supabase.auth.signOut();
};