const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jtrugvxgztnxbhwjtiou.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cnVndnhnenRueGJod2p0aW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDQxMTksImV4cCI6MjA4NzcyMDExOX0.Kw-SMk8ABVNfFEeYoN8oDgbpDv7Uk_cDN23IccH7zoM');

const query = `
  ALTER TABLE public.carrusel_02_imagenes 
    ADD COLUMN IF NOT EXISTS foto_position TEXT DEFAULT '50% 50%', 
    ADD COLUMN IF NOT EXISTS foto_scale NUMERIC DEFAULT 1.0;
  
  DROP POLICY IF EXISTS "Acceso total anon carrusel02" ON public.carrusel_02_imagenes;
  
  CREATE POLICY "Acceso total anon carrusel02" 
    ON public.carrusel_02_imagenes 
    FOR ALL TO anon 
    USING (true) WITH CHECK (true);
    
  NOTIFY pgrst, 'reload schema';
`;

supabase.rpc('execute_sql', { sql: query }).then(res => {
  console.log('SQL Executed:', res);
}).catch(err => {
  console.error('Error:', err);
});
