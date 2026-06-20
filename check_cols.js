import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jtrugvxgztnxbhwjtiou.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cnVndnhnenRueGJod2p0aW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDQxMTksImV4cCI6MjA4NzcyMDExOX0.Kw-SMk8ABVNfFEeYoN8oDgbpDv7Uk_cDN23IccH7zoM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('citas').select('*').limit(1);
  if (error) {
    console.error("Error fetching citas:", error);
  } else {
    console.log("Citas row columns:", Object.keys(data[0] || {}));
    console.log("Sample row:", data[0]);
  }
}

main().catch(console.error);
