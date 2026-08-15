// Supabase Edge Function — the server-side half of Truecaller sign-in.
//
// The client (services/truecallerAuth.ts) gets an authorization code from
// the Truecaller SDK and sends it here. This function:
//   1. exchanges that code for a Truecaller access token (using the client
//      secret, which must never live in the app itself),
//   2. fetches the verified phone number from Truecaller,
//   3. creates the Supabase user if they're new (idempotent — safe to call
//      every sign-in),
//   4. mints a real Supabase session for that phone number and returns it.
//
// Deploy: `supabase functions deploy truecaller-verify`
// Secrets (never set as EXPO_PUBLIC_ — these stay server-side only):
//   supabase secrets set TRUECALLER_CLIENT_ID=... TRUECALLER_CLIENT_SECRET=...
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected by the
// Supabase platform into every Edge Function — nothing to set for those.
//
// ⚠️ TRUECALLER_TOKEN_URL / TRUECALLER_PROFILE_URL below are placeholders —
// I could not confirm Truecaller's current OAuth token/profile endpoint
// URLs from public documentation, and would rather leave an honest
// placeholder than ship a guessed URL. Get the exact values from your
// Truecaller developer dashboard (Backend/Server-side integration docs)
// once your app is approved, and fill them in here before deploying.

import { createClient } from 'npm:@supabase/supabase-js@2';

const TRUECALLER_TOKEN_URL = 'https://REPLACE_ME.truecaller.com/oauth2/token'; // TODO: fill in from Truecaller dashboard
const TRUECALLER_PROFILE_URL = 'https://REPLACE_ME.truecaller.com/v1/userinfo'; // TODO: fill in from Truecaller dashboard

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const clientId = Deno.env.get('TRUECALLER_CLIENT_ID');
  const clientSecret = Deno.env.get('TRUECALLER_CLIENT_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!clientId || !clientSecret || !supabaseUrl || !serviceRoleKey || !anonKey) {
    return json({ error: 'server_misconfigured' }, 500);
  }

  let body: { authorizationCode?: string; codeVerifier?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const { authorizationCode, codeVerifier } = body;
  if (!authorizationCode || !codeVerifier) {
    return json({ error: 'missing_authorization_code_or_code_verifier' }, 400);
  }

  // 1. Exchange the code for a Truecaller access token.
  const tokenResponse = await fetch(TRUECALLER_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: authorizationCode,
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenResponse.ok) {
    return json({ error: 'truecaller_token_exchange_failed' }, 401);
  }
  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token as string | undefined;
  if (!accessToken) return json({ error: 'truecaller_token_exchange_failed' }, 401);

  // 2. Fetch the verified phone number.
  const profileResponse = await fetch(TRUECALLER_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileResponse.ok) return json({ error: 'truecaller_profile_fetch_failed' }, 401);

  const profile = await profileResponse.json();
  const phoneNumber = profile.phoneNumber ?? profile.phone_number;
  if (!phoneNumber) return json({ error: 'truecaller_profile_missing_phone' }, 401);

  // 3 & 4. Get-or-create the Supabase user for this phone, then mint a
  // session. Supabase's admin API has no generateLink() for phone, only
  // email — so a deterministic, never-emailed pseudo-address is the vehicle
  // for the magic-link token exchange; the real phone number is still
  // stored natively on auth.users.phone.
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const pseudoEmail = `${phoneNumber.replace(/[^0-9]/g, '')}@phone.metroconnect.internal`;

  const { error: createError } = await admin.auth.admin.createUser({
    email: pseudoEmail,
    phone: phoneNumber,
    email_confirm: true,
    phone_confirm: true,
    password: crypto.randomUUID(),
  });
  if (createError && !createError.message.toLowerCase().includes('already')) {
    return json({ error: 'user_create_failed' }, 500);
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: pseudoEmail,
  });
  if (linkError || !linkData?.properties?.hashed_token) {
    return json({ error: 'session_mint_failed' }, 500);
  }

  const anon = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: verifyData, error: verifyError } = await anon.auth.verifyOtp({
    type: 'magiclink',
    token_hash: linkData.properties.hashed_token,
  });
  if (verifyError || !verifyData.session) {
    return json({ error: 'session_verify_failed' }, 500);
  }

  return json({
    access_token: verifyData.session.access_token,
    refresh_token: verifyData.session.refresh_token,
  });
});
