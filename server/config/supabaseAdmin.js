require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!serviceRoleKey) {
  console.warn(
    '[SupabaseAdmin] SUPABASE_SERVICE_ROLE_KEY is not set in server/.env. Falling back to SUPABASE_ANON_KEY; RLS-protected writes require SUPABASE_SERVICE_ROLE_KEY.'
  );
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const supabaseAnon = createClient(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = {
  supabaseAdmin,
  supabaseAnon,
  hasServiceRoleKey: Boolean(serviceRoleKey),
};
