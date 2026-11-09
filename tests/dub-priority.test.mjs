import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const base = join(root, 'Russian-Custom-Formats-Dub-Priority');
const formats = {};
const scores = new Map();
const lines = readFileSync(join(base, 'scores.csv'), 'utf8').trim().split(/\r?\n/);
for (const row of lines.slice(1)) {
  const match = row.match(/^"([^"]+)";"(-?\d+)";/);
  assert.ok(match, 'CSV row has name and integer score: ' + row);
  assert.ok(!scores.has(match[1]), 'Duplicate score name: ' + match[1]);
  scores.set(match[1], Number(match[2]));
}
for (const app of ['Radarr', 'Sonarr']) {
  formats[app] = new Map();
  for (const file of readdirSync(join(base, app)).filter(f => f.endsWith('.json'))) {
    const data = JSON.parse(readFileSync(join(base, app, file), 'utf8'));
    assert.ok(data.name && Array.isArray(data.specifications), file);
    assert.ok(!formats[app].has(data.name), 'Duplicate name: ' + data.name);
    formats[app].set(data.name, data);
  }
}
function regexp(pattern) {
  if (pattern.startsWith('(?i)')) return new RegExp(pattern.slice(4), 'i');
  return new RegExp(pattern);
}
function applies(name, title, language = 1, app = 'Radarr') {
  const cf = formats[app].get(name);
  assert.ok(cf, 'Missing CF: ' + name);
  const evaluations = cf.specifications.map(spec => {
    assert.ok(['ReleaseTitleSpecification', 'LanguageSpecification'].includes(spec.implementation), 'Unexpected implementation ' + spec.implementation);
    const value = spec.implementation === 'LanguageSpecification' ? language === spec.fields.value : regexp(spec.fields.value).test(title);
    return { required: spec.required, success: spec.negate ? !value : value };
  });
  return evaluations.filter(x => x.required).every(x => x.success) &&
    (!evaluations.some(x => !x.required) || evaluations.some(x => !x.required && x.success));
}
function scoreFor(title, language = 1) {
  return [...scores].reduce((s, [name, score]) => s + (applies(name, title, language) ? score : 0), 0);
}
const gate = 'RU - Russian Title or Studio Fallback';
const dub = 'RU - Translation - Dubbing';
const dv = 'UHD - DV without HDR fallback (WEB)';

test('all JSON formats and scores are consistent across Radarr and Sonarr', () => {
  assert.deepEqual([...formats.Radarr.keys()], [...formats.Sonarr.keys()]);
  assert.deepEqual([...scores.keys()].sort(), [...formats.Radarr.keys()].sort());
  for (const [name, format] of formats.Radarr) {
    assert.deepEqual(format, formats.Sonarr.get(name), name);
    for (const spec of format.specifications) {
      if (spec.implementation === 'ReleaseTitleSpecification') assert.doesNotThrow(() => regexp(spec.fields.value), name);
    }
  }
});
test('bare foreign-language DUB and subtitles never establish Russian audio', () => {
  for (const title of ['Film.2026.GERMAN.DUB.WEB-DL', 'Film.2026.FRENCH.DUB.BluRay', 'Film.2026.DUB.WEB-DL', 'Film.2026.RUSSIAN.SUBTITLES.WEB-DL', 'Film.2026.RUS.SUB.WEB-DL']) {
    assert.equal(applies(gate, title, 1), false, title);
    assert.ok(scoreFor(title, 1) < 10000, title + ' should not pass minimum');
  }
});
test('explicit Russian audio and Russian-specific studio can satisfy fallback', () => {
  for (const title of ['Film.2026.RUS.DUB.WEB-DL', 'Film.2026.RUSSIAN.AUDIO.WEB-DL', 'Film.2026.MovieDalen.WEB-DL', 'Film.2026.LostFilm.WEB-DL']) {
    assert.equal(applies(gate, title, 1), true, title);
  }
});
test('anime and generic/multilingual studio tokens never establish Russian audio', () => {
  for (const title of ['Film.2026.AniLibria.WEB-DL', 'Film.2026.MovieDubbing.WEB-DL', 'Film.2026.RHS.WEB-DL', 'Film.2026.DEEP.WEB-DL', 'Film.2026.Nota.WEB-DL']) {
    assert.equal(applies(gate, title, 1), false, title);
  }
});
test('language metadata and fallback are mutually exclusive', () => {
  assert.equal(applies('RU - Russian Language', 'Film.RUS.DUB', 11), true);
  assert.equal(applies(gate, 'Film.RUS.DUB', 11), false);
  assert.equal(applies('RU - Russian Language', 'Film.RUS.DUB', 1), false);
  assert.equal(applies(gate, 'Film.RUS.DUB', 1), true);
});
test('studio alone does not infer dubbing type', () => {
  assert.equal(applies(dub, 'Film.2026.MVO.MovieDalen', 11), false);
  assert.equal(applies(dub, 'Film.2026.RUS.DUB', 11), true);
  assert.ok(scoreFor('Film.2026.RUS.DUB', 11) > scoreFor('Film.2026.MVO.MovieDalen', 11));
});
test('translation score order is maintained and protected from tie-breakers', () => {
  const labels = ['Dubbing','Professional MVO','Professional DVO','MVO','DVO','Single Voiceover'];
  const values = [5000, 4000, 3000, 2000, 1000, 500];
  const names = [
    'RU - Translation - Dubbing', 'RU - Translation - Professional MVO',
    'RU - Translation - Professional DVO', 'RU - Translation - MVO',
    'RU - Translation - DVO', 'RU - Translation - Single Voiceover'
  ];
  assert.deepEqual(names.map(x => scores.get(x)), values);
  const bonusMax = [...scores].filter(([n,s]) => !n.startsWith('RU - Translation') && n !== 'RU - Russian Language' && n !== gate && s > 0).reduce((total,[,s]) => total + s, 0);
  assert.ok(bonusMax < 500, 'Combined positive tie-breakers must be below smallest category gap: ' + bonusMax);
  assert.equal(labels.length, values.length);
});
test('DV WEB compatibility penalty, not present for HDR fallback, Blu-ray or HULU', () => {
  for (const title of ['Film.2026.WEB-DL.DV', 'Film.2026.WEBRip.DoVi']) assert.equal(applies(dv, title), true, title);
  for (const title of ['Film.2026.WEB-DL.DV.HDR10', 'Film.2026.WEB-DL.DV.HDR10+', 'Film.2026.BluRay.DV', 'Film.2026.HULU.WEB-DL.DV']) assert.equal(applies(dv, title), false, title);
});
test('official/amateur descriptors only match explicit wording', () => {
  const official = 'RU - Explicit Official Dubbing Bonus';
  const amateur = 'RU - Amateur Dubbing Penalty';
  assert.equal(applies(official, 'Film.официальный.дубляж', 11), true);
  assert.equal(applies(amateur, 'Film.FANDUB.WEB-DL', 11), true);
  assert.equal(applies(official, 'Film.MovieDalen.WEB-DL', 11), false);
  assert.equal(applies(amateur, 'Film.MovieDalen.WEB-DL', 11), false);
});
