// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2';
import { projectRequest, validateRequest } from './projector.mjs';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const admin = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
}) : null;

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return [...digest].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function reply(status: number, body: object) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

Deno.serve(async request => {
  if (request.method !== 'POST') return reply(405, { error: 'Use POST.' });
  if (!admin) return reply(503, { error: 'Ingestion is not configured.' });
  if (Number(request.headers.get('content-length') || 0) > 120000) return reply(413, { error: 'Statement is too large.' });
  const token = request.headers.get('authorization')?.match(/^Bearer (kryos_[A-Za-z0-9_-]{43})$/)?.[1];
  if (!token) return reply(401, { error: 'Assistant credential required.' });
  try {
    const tokenHash = await sha256(token);
    const { data: credential, error: credentialError } = await admin.from('kryos_assistant_credentials')
      .select('id,profile_id,expires_at,revoked_at')
      .eq('token_hash', tokenHash).maybeSingle();
    if (credentialError || !credential || credential.revoked_at || (credential.expires_at && credential.expires_at <= new Date().toISOString())) {
      return reply(401, { error: 'Assistant credential is invalid or revoked.' });
    }
    let input;
    try {
      const rawBody = await request.text();
      if (rawBody.length > 120000) return reply(413, { error: 'Statement is too large.' });
      input = JSON.parse(rawBody);
      validateRequest(input);
      const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: input.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map(part => [part.type, part.value]));
      const today = `${parts.year}-${parts.month}-${parts.day}`;
      if (input.local_date > today) return reply(422, { error: 'Future dates need review.' });
    }
    catch (error) { return reply(400, { error: error.message || 'Invalid request.' }); }
    const requestHash = await sha256(JSON.stringify(input));
    const { data: prior, error: priorError } = await admin.from('kryos_assistant_requests')
      .select('request_hash,receipt').eq('profile_id', credential.profile_id)
      .eq('idempotency_key', input.idempotency_key).maybeSingle();
    if (priorError) throw priorError;
    if (prior) return prior.request_hash === requestHash
      ? reply(200, { ...prior.receipt, duplicate: true })
      : reply(409, { error: 'IDEMPOTENCY_MISMATCH' });
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: blocks, error: blockError } = await admin.from('kryos_sync_blocks')
        .select('block_key,payload,revision').eq('profile_id', credential.profile_id)
        .in('block_key', ['tasks', 'career']);
      if (blockError) throw blockError;
      const tasks = blocks?.find(block => block.block_key === 'tasks');
      const career = blocks?.find(block => block.block_key === 'career');
      if (!tasks || !career) return reply(409, { error: 'Sync the personal profile from KRYOS before assistant ingestion.' });
      let projection;
      try { projection = projectRequest(input, tasks.payload, career.payload); }
      catch (error) { return reply(422, { error: error.message || 'Statement needs review.' }); }
      const { data: receipt, error: applyError } = await admin.rpc('kryos_apply_assistant_request', {
        p_profile: credential.profile_id,
        p_idempotency_key: input.idempotency_key,
        p_request_hash: requestHash,
        p_local_date: input.local_date,
        p_timezone: input.timezone,
        p_raw_text: input.raw_text,
        p_events: projection.events,
        p_effects: projection.effects,
        p_tasks: projection.tasksChanged ? projection.tasks : null,
        p_career: projection.careerChanged ? projection.career : null,
        p_tasks_revision: tasks.revision,
        p_career_revision: career.revision,
      });
      if (!applyError) {
        await admin.from('kryos_assistant_credentials').update({ last_used_at: new Date().toISOString() }).eq('id', credential.id);
        return reply(200, receipt);
      }
      if (String(applyError.message).includes('IDEMPOTENCY_MISMATCH')) return reply(409, { error: 'IDEMPOTENCY_MISMATCH' });
      if (!String(applyError.message).includes('KRYOS_CONFLICT')) throw applyError;
    }
    return reply(409, { error: 'Data changed while saving. Retry with the same idempotency key.' });
  } catch (_error) {
    return reply(500, { error: 'Assistant update failed. No partial update was applied.' });
  }
});
