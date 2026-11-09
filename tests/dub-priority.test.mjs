import test from 'node:test';
import assert from 'node:assert/strict';
import { validate, formats, evaluate, matchesFormat, scores } from '../scripts/validate-formats.mjs';

const byName = new Map(formats().map(f => [f.data.name, f.data]));
const hit = (name, title, lang = 11) => matchesFormat(byName.get(name), title, lang);
const audioGate = 'RU - Russian Title or Studio Fallback';
const dub = 'RU - Translation - Dubbing';
const dv = 'UHD - DV without HDR fallback (WEB)';

test('JSON, matching regexes, Radarr/Sonarr parity and score CSV', () => {
  const result = validate();
  assert.equal(result.formats, 20);
  assert.equal(result.scores, 20);
});
test('foreign and generic DUB alone never prove Russian language', () => {
  for (const title of ['Film.GERMAN.DUB.WEB-DL', 'Film.FRENCH.DUB.BluRay', 'Film.DUB.1080p.WEB-DL',
                       'Film.RUSSIAN.SUBTITLES.1080p', 'Film.RUS.SUBS', 'Film.FAN.DUB']) {
    assert.equal(hit(audioGate, title, 1), false, title);
  }
});
test('unambiguous RU audio and curated studios satisfy fallback', () => {
  for (const title of ['Film.RUS.DUB.WEB-DL', 'Film.RUSSIAN.AUDIO', 'Film.RU.AUDIO',
                       'Film.MovieDalen.WEB-DL', 'Film.LostFilm.WEB-DL']) {
    assert.equal(hit(audioGate, title, 1), true, title);
  }
});
test('an anime group or vague studio token does not satisfy RU fallback', () => {
  for (const title of ['Film.AniLibria', 'Film.DEEP', 'Film.Nota', 'Film.RHS', 'Film.MovieDubbing']) {
    assert.equal(hit(audioGate, title, 1), false, title);
  }
});
test('studio alone does not assert a dubbed translation type', () => {
  assert.equal(hit(dub, 'Film.MVO.MovieDalen.WEB-DL'), false);
  assert.equal(hit(dub, 'Film.DVO.Flarrow.Films'), false);
  assert.equal(hit(dub, 'Film.RUS.DUB.WEB-DL'), true);
});
test('score ordering: explicit dub outranks MVO with the same Russian gate', () => {
  const bestDub = evaluate('Film.RUS.DUB.1080p.WEB-DL', 11);
  const studioMvo = evaluate('Film.MVO.MovieDalen.1080p.WEB-DL', 11);
  assert.ok(bestDub.total > studioMvo.total, JSON.stringify({ bestDub, studioMvo }));
});
test('a non-Russian German DUB is below minimum score 10000', () => {
  const release = evaluate('Film.GERMAN.DUB.1080p.WEB-DL', 1);
  assert.ok(release.total < 10000, JSON.stringify(release));
});
test('explicit dubbing classification is different from source-only hints', () => {
  assert.equal(hit(dub, 'Film.iTunes.BluRay.1080p'), false);
  assert.equal(hit(dub, 'Film.Kinopoisk.HD.DUB.1080p'), true);
});
test('DV-only WEB has a penalty while HDR10 and Blu-ray are exempt', () => {
  assert.equal(hit(dv, 'Film.WEB-DL.DV.2160p'), true);
  assert.equal(hit(dv, 'Film.WEB-DL.DV.HDR10.2160p'), false);
  assert.equal(hit(dv, 'Film.BluRay.DV.2160p'), false);
  assert.equal(hit(dv, 'Film.WEB-DL.HULU.DV.2160p'), false);
});
test('DV-only WEB cannot meet minimum score even with Russian audio and dubbing', () => {
  const candidate = evaluate('Film.RUS.DUB.WEB-DL.DV.2160p', 11);
  assert.ok(candidate.total < 10000, JSON.stringify(candidate));
});
test('official and amateur labels are scored distinctly, without studio guesses', () => {
  assert.equal(hit('RU - Explicit Official Dubbing Bonus', 'Film.официальный.дубляж'), true);
  assert.equal(hit('RU - Explicit Official Dubbing Bonus', 'Film.MovieDalen'), false);
  assert.equal(hit('RU - Amateur Dubbing Penalty', 'Film.FAN.DUB'), true);
  assert.ok(scores().get('RU - Amateur Dubbing Penalty') < 0);
});
test('single-voice AVO marker is recognized but never confused with dubbing', () => {
  assert.equal(hit('RU - Translation - Single Voiceover', 'Film.RUS.AVO'), true);
  assert.equal(hit(dub, 'Film.RUS.AVO'), false);
});

test('Russian full-word markers are understood with Unicode .NET-style word matching', () => {
  assert.equal(hit(audioGate, 'Film.русская.озвучка.WEB-DL', 1), true);
  assert.equal(hit(dub, 'Film.профессиональный.дубляж', 11), true);
  assert.equal(hit('RU - Explicit Official Dubbing Bonus', 'Film.официальный.дубляж'), true);
});
