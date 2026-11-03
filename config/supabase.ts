import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://jtrugvxgztnxbhwjtiou.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cnVndnhnenRueGJod2p0aW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDQxMTksImV4cCI6MjA4NzcyMDExOX0.Kw-SMk8ABVNfFEeYoN8oDgbpDv7Uk_cDN23IccH7zoM';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cnVndnhnenRueGJod2p0aW91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE0NDExOSwiZXhwIjoyMDg3NzIwMTE5fQ.Nd_23Hu34rJyizST_VTa1rb4-GcJcsCMPMabkRiJZnQ';

// Cliente estándar (anon key) — para operaciones de usuario normal
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente admin (service role) — solo para creación de usuarios desde panel admin
// Nunca persiste sesión ni refresca tokens automáticamente
export const supabaseAdmin = SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;
