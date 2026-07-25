import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

// Singleton browser client.
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

export const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ac29d601`;
export { publicAnonKey };
