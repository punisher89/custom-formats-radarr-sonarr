#!/usr/bin/env node
// Dependency-free static validation and an approximation of CF matching for regression tests.
// For final acceptance, use the Radarr/Sonarr interactive release parser on live data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PACK = path.join(ROOT, 'Russian-Custom-Formats-Dub-Priority');

export function formats(service = 'Radarr') {
  if (!['Radarr', 'Sonarr'].includes(service)) throw new Error('service must be Radarr or Sonarr');
  return fs.readdirSync(path.join(PACK, service))
    .filter(file => file.endsWith('.json'))
    .sort()
    .map(file => ({
      file,
      content: fs.readFileSync(path.join(PACK, service, file), 'utf8'),
      data: JSON.parse(fs.readFileSync(path.join(PACK, service, file), 'utf8'))
    }));
}
export function scores() {
  const lines = fs.readFileSync(path.join(PACK, 'scores.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
  return new Map(lines.map(line => {
    const parts = line.match(/"[^"]*"|[^;]+/g);
    if (!parts || parts.length < 2) throw new Error('Invalid scores.csv line: ' + line);
    return [parts[0].replace(/^"|"$/g, ''), Number(parts[1].replace(/^"|"$/g, ''))];
  }));
}
export function matchesRegex(value, title) {
  const ignoreCase = value.startsWith('(?i)');
  // Servarr uses .NET regex where \w includes Cyrillic; JS \w only includes ASCII.
  const source = (ignoreCase ? value.slice(4) : value)
    .replace(/\\w/g, '[\\p{L}\\p{N}_]');
  const regex = new RegExp(source, ignoreCase ? 'iu' : 'u');
  return regex.test(title);
}
export function matchesFormat(cf, releaseTitle, languageId = 11) {
  const specs = cf.specifications.map(spec => {
    const pass = spec.implementation === 'LanguageSpecification'
      ? languageId === spec.fields.value
      : matchesRegex(spec.fields.value, releaseTitle);
    return { ...spec, pass: spec.negate ? !pass : pass };
  });
  // Required conditions are ANDed; optional conditions in each implementation group are ORed.
  // This is an illustrative static simulation, not an embedded Servarr parser.
  for (const group of new Set(specs.map(spec => spec.implementation))) {
    const groupSpecs = specs.filter(spec => spec.implementation === group);
    if (groupSpecs.some(spec => spec.required && !spec.pass)) return false;
    const optional = groupSpecs.filter(spec => !spec.required);
    if (optional.length && !optional.some(spec => spec.pass)) return false;
  }
  return true;
}
export function evaluate(title, languageId = 11) {
  const scoreMap = scores();
  const hits = formats().filter(format => matchesFormat(format.data, title, languageId));
  return { total: hits.reduce((sum, format) => sum + scoreMap.get(format.data.name), 0),
    hits: hits.map(format => format.data.name) };
}
export function validate() {
  const radarr = formats('Radarr');
  const sonarr = formats('Sonarr');
  const scoreMap = scores();
  const errors = [];
  const names = new Set();
  const allowedImpl = new Set(['ReleaseTitleSpecification', 'LanguageSpecification']);
  if (radarr.length !== sonarr.length) errors.push('Radarr/Sonarr JSON count differs');
  for (const {file, content, data} of radarr) {
    if (names.has(data.name)) errors.push('Duplicate CF name: ' + data.name);
    names.add(data.name);
    const twin = sonarr.find(row => row.file === file);
    if (!twin || twin.content !== content) errors.push('Radarr/Sonarr mismatch: ' + file);
    if (!Number.isFinite(scoreMap.get(data.name))) errors.push('Missing numeric score: ' + data.name);
    if (!data.name || !Array.isArray(data.specifications) || !data.specifications.length) errors.push('Invalid format: ' + file);
    for (const spec of data.specifications ?? []) {
      if (!allowedImpl.has(spec.implementation)) errors.push('Unknown implementation: ' + file);
      if (typeof spec.required !== 'boolean' || typeof spec.negate !== 'boolean') errors.push('Invalid flags: ' + file);
      if (spec.implementation === 'LanguageSpecification') {
        if (!Number.isInteger(spec.fields?.value)) errors.push('Language ID must be integer: ' + file);
      } else {
        if (typeof spec.fields?.value !== 'string') errors.push('Regex must be string: ' + file);
        else try { matchesRegex(spec.fields.value, '__smoke_test__'); }
          catch (err) { errors.push('Invalid regex in ' + file + ': ' + err.message); }
      }
    }
  }
  for (const name of scoreMap.keys()) if (!names.has(name)) errors.push('Orphan score: ' + name);
  if (scoreMap.size !== radarr.length) errors.push('CSV does not contain exactly one entry per JSON file');
  const audios = ['RU - Russian Language', 'RU - Russian Title or Studio Fallback'];
  if (audios.some(name => scoreMap.get(name) !== 10000)) errors.push('Russian gate scores must be 10000');
  if (errors.length) throw new Error(errors.join('\n'));
  return { formats: radarr.length, scores: scoreMap.size };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const info = validate();
  console.log('OK: ' + info.formats + ' CFs per service; both trees identical; score table and regexes valid');
}
