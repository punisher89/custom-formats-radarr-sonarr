#!/usr/bin/env node
/**
 * Safely synchronize scores of ALREADY IMPORTED Custom Formats into one Quality Profile.
 * NEVER changes releases, library files or other profiles. Dry-run unless --apply.
 * Node.js >= 20. Usage:
 * RADARR_API_KEY=... node scripts/sync-scores.mjs --service=radarr --url=http://localhost:7878 --profile="My 4K"
 * RADARR_API_KEY=... node scripts/sync-scores.mjs --service=radarr --url=http://localhost:7878 --profile="My 4K" --apply
 */
import { scores } from './validate-formats.mjs';

export function calculateUpdates(profile, existingFormats, scoreMap) {
  const byId = new Map(existingFormats.map(cf => [cf.id, cf.name]));
  const formatItems = profile.formatItems ?? [];
  const changes = [];
  const found = new Set();
  const updatedItems = formatItems.map(item => {
    const name = byId.get(item.format);
    if (!scoreMap.has(name)) return item;
    found.add(name);
    const target = scoreMap.get(name);
    if (item.score !== target) {
      changes.push({ name, previous: item.score, next: target });
      return { ...item, score: target };
    }
    return item;
  });
  const missing = [...scoreMap.keys()].filter(name => !found.has(name));
  return { changes, missing, updated: { ...profile, formatItems: updatedItems } };
}

function options(argv) {
  const parsed = {};
  for (const arg of argv) {
    if (arg === '--apply') parsed.apply = true;
    else {
      const [key, ...rest] = arg.replace(/^--/, '').split('=');
      parsed[key] = rest.join('=');
    }
  }
  return parsed;
}

async function main() {
  const args = options(process.argv.slice(2));
  const service = args.service?.toLowerCase();
  if (!['radarr', 'sonarr'].includes(service) || !args.url || !args.profile)
    throw new Error('Specify --service=radarr|sonarr, --url=http://host:port, --profile="Profile name"');
  const key = process.env[service.toUpperCase() + '_API_KEY'];
  if (!key) throw new Error('Set ' + service.toUpperCase() + '_API_KEY environment variable');
  const base = args.url.replace(/\/+$/, '');
  const request = async (method, path, body) => {
    const response = await fetch(base + '/api/v3/' + path, {
      method, headers: { 'X-Api-Key': key, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (!response.ok) throw new Error(method + ' ' + path + ': HTTP ' + response.status + ' ' + (await response.text()).slice(0, 300));
    return response.json();
  };
  const [remoteFormats, profiles] = await Promise.all([
    request('GET', 'customformat'), request('GET', 'qualityprofile')
  ]);
  const chosen = profiles.filter(p => p.name === args.profile);
  if (chosen.length !== 1) throw new Error('Expected exactly one matching profile: ' + args.profile);
  const plan = calculateUpdates(chosen[0], remoteFormats, scores());
  console.log('Service:', service, '| Profile:', args.profile, '| Mode:', args.apply ? 'APPLY' : 'DRY RUN');
  for (const c of plan.changes) console.log(c.name + ': ' + c.previous + ' -> ' + c.next);
  if (plan.missing.length) console.warn('Not imported / missing in profile:', plan.missing.join(', '));
  if (plan.missing.length && args.apply)
    throw new Error('Refusing partial update: first import every JSON CF and ensure it is in the selected Quality Profile');
  if (!plan.changes.length) { console.log('No score changes required'); return; }
  if (!args.apply) { console.log('Dry run only. Add --apply to update this one profile.'); return; }
  await request('PUT', 'qualityprofile/' + chosen[0].id, plan.updated);
  console.log('Profile scores updated. Verify settings in Radarr/Sonarr.');
}
if (process.argv[1]?.endsWith('sync-scores.mjs')) {
  main().catch(err => { console.error(err.message); process.exitCode = 1; });
}
