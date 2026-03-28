import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjkaeyyxzudoukcrgjyj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indqa2FleXl4enVkb3VrY3JnanlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDYyNTgsImV4cCI6MjA5MDI4MjI1OH0.hSu3wLj4Xv8luYDjcEy7BF_FQBVhKWbv4ou8lA9XG4Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
