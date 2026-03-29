import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjkaeyyxzudoukcrgjyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indqa2FleXl4enVkb3VrY3JnanlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDYyNTgsImV4cCI6MjA5MDI4MjI1OH0.hSu3wLj4Xv8luYDjcEy7BF_FQBVhKWbv4ou8lA9XG4Y';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDB() {
  console.log("Testing connection and table structure...");

  // Insert into donations
  console.log("1. Attempting to insert into 'donations'...");
  const { error: donError } = await supabase.from('donations').insert([
    {
       food_name: 'Test Food',
       quantity: 1,
       location: 'test',
       expiry_time: new Date().toISOString(),
       food_type: 'veg'
    }
  ]);
  if (donError) {
    console.error("DONATIONS ERROR:", donError);
  } else {
    console.log("DONATIONS INSERT: SUCCESS");
  }

  // Insert into requests
  console.log("2. Attempting to insert into 'requests'...");
  const { error: reqError } = await supabase.from('requests').insert([
    {
       food_name: 'Test Request',
       quantity: 1,
       urgency: 'low',
       location: 'test'
    }
  ]);
  if (reqError) {
    console.error("REQUESTS ERROR:", reqError);
  } else {
    console.log("REQUESTS INSERT: SUCCESS");
  }

  // Fetch matches
  console.log("3. Attempting to read 'matches'...");
  const { error: matchError } = await supabase.from('matches').select('*').limit(1);
  if (matchError) {
    console.error("MATCHES ERROR:", matchError);
  } else {
    console.log("MATCHES READ: SUCCESS");
  }
}

testDB();
