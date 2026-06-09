import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vxfpwecjmzphjfxekdlc.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4ZnB3ZWNqbXpwaGpmeGVrZGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjQ1ODgsImV4cCI6MjA5NjYwMDU4OH0.kT7oZ3fig8dOsTXWlQ040UKQVQ-rsJBF9FeEMNWbP14";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);