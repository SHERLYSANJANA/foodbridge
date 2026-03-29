import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjkaeyyxzudoukcrgjyj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indqa2FleXl4enVkb3VrY3JnanlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDYyNTgsImV4cCI6MjA5MDI4MjI1OH0.hSu3wLj4Xv8luYDjcEy7BF_FQBVhKWbv4ou8lA9XG4Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    options: {
      data: { full_name: 'Test', mobile: '123', role: 'donor' }
    }
  });

  if (error) {
    console.log('Signup error:', error);
    return;
  }

  console.log('User signed up. ID:', data.user.id);

  const { error: insertError } = await supabase.from('users').insert([
    { email: data.user.email, full_name: 'Test', mobile: '123', role: 'donor' }
  ]);

  if (insertError) {
    console.log('Insert error:', insertError);
  } else {
    console.log('Insert successful!');
  }
}

test();
