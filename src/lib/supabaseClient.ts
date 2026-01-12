// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lrmvfnapaghuogwhhwxa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybXZmbmFwYWdodW9nd2hod3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDUzMjEsImV4cCI6MjA4MTIyMTMyMX0.EcwjdqDHjmZBuc28GzvamHmticGBRve7Lb9g1aPOvD0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
