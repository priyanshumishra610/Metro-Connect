// Supabase Edge Function — the server-side half of Truecaller sign-in.
//
// The client (services/truecallerAuth.ts) gets an authorization code from
// the Truecaller SDK and sends it here. This function:
//   1. exchanges that code for a Truecaller access token using PKCE
//      (client_id + code + code_verifier — no client secret. Truecaller's
//      own developer console has no secret field anywhere for an Android
//      credential, only Package Name / Client ID / Fingerprints, which
//      matches the standard rule that native/mobile OAuth clients are
//      "public clients" and use PKCE instead of a secret, since a secret
//      embedded in a distributed app binary can't actually stay secret),
//   2. fetches the verified phone number from Truecaller,
//   3. creates the Supabase user if they're new (idempotent — safe to call
//      every sign-in),
//   4. mints a real Supabase session for that phone number and returns it.
//
// Deploy: `supabase functions deploy truecaller-verify`
// Secrets (never set as EXPO_PUBLIC_ — these stay server-side only):
//   supabase secrets set TRUECALLER_CLIENT_ID=...
// (Confirmed via Truecaller's own docs — see the endpoints below — that the
// backend token exchange needs no client secret at all, just client_id +
// code + code_verifier. TRUECALLER_CLIENT_SECRET stays supported below only
// in case that ever changes; nothing to set for it currently.)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected by the
// Supabase platform into every Edge Function — nothing to set for those.
//
// Endpoints confirmed from docs.truecaller.com/truecaller-sdk/android/
// oauth-sdk-3.0.0/integration-steps/integrating-with-your-backend
// (fetching-user-token / fetching-user-profile), Aug 2026.

import { createClient } from 'npm:@supabase/supabase-js@2';

const TRUECALLER_TOKEN_URL = 'https://oauth-account-noneu.truecaller.com/v1/token';
const TRUECALLER_PROFILE_URL = 'https://oauth-account-noneu.truecaller.com/v1/userinfo';

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
  const clientSecret = Deno.env.get('TRUECALLER_CLIENT_SECRET'); // optional — see header note
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!clientId || !supabaseUrl || !serviceRoleKey || !anonKey) {
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

  // 1. Exchange the code for a Truecaller access token (PKCE: client_id +
  // code + code_verifier proves this request came from the same app
  // instance that started the flow — no secret required for a public/
  // mobile client). client_secret is included only if you've set one.
  const tokenParams: Record<string, string> = {
    grant_type: 'authorization_code',
    client_id: clientId,
    code: authorizationCode,
    code_verifier: codeVerifier,
  };
  if (clientSecret) tokenParams.client_secret = clientSecret;

  const tokenResponse = await fetch(TRUECALLER_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(tokenParams),
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
