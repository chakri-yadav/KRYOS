#!/usr/bin/env node
// Private assistant connector. Reads one JSON request from stdin and prints only a receipt.
const endpoint = process.env.KRYOS_INGEST_URL || 'https://ogpkaxprhjhrewoxsyla.supabase.co/functions/v1/kryos-ingest';
const token = process.env.KRYOS_ASSISTANT_TOKEN;
if (!token) {
  process.stderr.write('Set KRYOS_ASSISTANT_TOKEN in a private environment before using assistant ingestion.\n');
  process.exit(2);
}
let raw = '';
for await (const chunk of process.stdin) {
  raw += chunk;
  if (raw.length > 120000) throw new Error('Request is too large.');
}
let body;
try { body = JSON.parse(raw); }
catch { process.stderr.write('Input must be one JSON request.\n'); process.exit(2); }
try {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (!response.ok) process.exitCode = 1;
} catch {
  process.stderr.write('Could not reach KRYOS. Retry with the same idempotency key.\n');
  process.exitCode = 1;
}
