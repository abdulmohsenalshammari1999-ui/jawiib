/**
 * Question factory — generates Question[] from seed-data.json rows.
 * Output conforms to the existing Question interface in src/lib/types.ts.
 * Tier mapping: seed tier 1 → 200 pts (existing tier 2),
 *               seed tier 2 → 400 pts (existing tier 4),
 *               seed tier 3 → 600 pts (existing tier 6).
 */
import type { Question, CategoryId } from '../lib/types';

// ── Seed-data shapes ──────────────────────────────────────────────────────────

interface SeedCountry {
  id: string;
  nameAr: string;
  capitalAr: string;
  flagUrl: string;
  mapUrl: string;
  region: string;
  tier: 1 | 2 | 3;
}

interface SeedLandmark {
  id: string;
  nameAr: string;
  countryAr: string;
  imageUrl: string;
  tier: 1 | 2 | 3;
}

interface SeedAudio {
  id: string;
  titleAr: string;
  kind: 'song' | 'sound' | 'anthem';
  clipUrl: string;
  tier: 1 | 2 | 3;
}

interface SeedWord {
  id: string;
  wordAr: string;
  tier: 1 | 2 | 3;
  emoji?: string;
}

interface SeedRiddle {
  id: string;
  promptAr: string;
  answerAr: string;
  distractorsAr: string[];
  tier: 1 | 2 | 3;
}

interface SeedProverb {
  id: string;
  sentenceAr: string;
  answerAr: string;
  distractorsAr: string[];
  tier: 1 | 2 | 3;
}

interface SeedFigure {
  id: string;
  nameAr: string;
  cluesAr: string[];
  tier: 1 | 2 | 3;
}

export interface SeedData {
  countries: SeedCountry[];
  landmarks: SeedLandmark[];
  audio: SeedAudio[];
  charadesWords: SeedWord[];
  drawWords: SeedWord[];
  riddles: SeedRiddle[];
  proverbs: SeedProverb[];
  figures: SeedFigure[];
}

// ── Tier mapping ──────────────────────────────────────────────────────────────

// Maps seed tier (1-3) to the existing Question tier (1-6) so that
// tier-1 seeds land on 200 pts, tier-2 on 400 pts, tier-3 on 600 pts.
const SEED_TIER_TO_GAME_TIER: Record<1 | 2 | 3, 2 | 4 | 6> = { 1: 2, 2: 4, 3: 6 };

function gameTier(seedTier: 1 | 2 | 3): 2 | 4 | 6 {
  return SEED_TIER_TO_GAME_TIER[seedTier];
}

// ── Distractor helpers ────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a 4-option array with the correct answer shuffled in.
 * Returns [options, correctIndex].
 */
function buildOptions(answer: string, distractors: string[]): [string[], number] {
  const pool = [...distractors.slice(0, 3)];
  const opts = shuffle([answer, ...pool]);
  return [opts, opts.indexOf(answer)];
}

/** Pick up to n items from pool, excluding a set of ids. */
function pickDistractors<T extends { id: string }>(
  pool: T[],
  excludeId: string,
  n: number,
  sameRegion?: string,
  regionKey?: keyof T
): T[] {
  let candidates = pool.filter((x) => x.id !== excludeId);
  if (sameRegion && regionKey) {
    const regional = candidates.filter((x) => x[regionKey] === sameRegion);
    if (regional.length >= n) candidates = regional;
  }
  return shuffle(candidates).slice(0, n);
}

// ── Country generators ────────────────────────────────────────────────────────

function fromCountries(countries: SeedCountry[]): Question[] {
  const qs: Question[] = [];

  for (const c of countries) {
    const tier = gameTier(c.tier);
    const region = c.region;

    // 1. Flag image: "عَلَم أيّ دولة هذا؟"
    const flagDistractors = pickDistractors(countries, c.id, 3, region, 'region');
    const [flagOpts, flagIdx] = buildOptions(c.nameAr, flagDistractors.map((d) => d.nameAr));
    qs.push({
      id: `img-flag-${c.id}`,
      category: 'flags_maps' as CategoryId,
      tier,
      points: (tier * 100) as Question['points'],
      text: 'عَلَم أيّ دولة هذا؟',
      options: flagOpts,
      correctIndex: flagIdx,
      type: 'image',
      mediaUrl: c.flagUrl,
      mediaAlt: `علم ${c.nameAr}`,
    });

    // 2. Map image: "خريطة أيّ دولة هذه؟"
    const mapDistractors = pickDistractors(countries, c.id, 3, region, 'region');
    const [mapOpts, mapIdx] = buildOptions(c.nameAr, mapDistractors.map((d) => d.nameAr));
    qs.push({
      id: `img-map-${c.id}`,
      category: 'flags_maps' as CategoryId,
      tier,
      points: (tier * 100) as Question['points'],
      text: 'خريطة أيّ دولة هذه؟',
      options: mapOpts,
      correctIndex: mapIdx,
      type: 'image',
      mediaUrl: c.mapUrl,
      mediaAlt: `خريطة ${c.nameAr}`,
    });

    // 3. Fill-blank: "عاصمة ___ هي [answer]" — options are 3 other capitals
    const capDistractors = pickDistractors(countries, c.id, 3);
    const [capOpts, capIdx] = buildOptions(c.capitalAr, capDistractors.map((d) => d.capitalAr));
    qs.push({
      id: `fill-capital-${c.id}`,
      category: 'geo' as CategoryId,
      tier,
      points: (tier * 100) as Question['points'],
      text: `عاصمة ${c.nameAr} هي ___`,
      options: capOpts,
      correctIndex: capIdx,
      type: 'text',
    });
  }

  return qs;
}

// ── Landmark generators ───────────────────────────────────────────────────────

function fromLandmarks(landmarks: SeedLandmark[]): Question[] {
  const qs: Question[] = [];

  for (const lm of landmarks) {
    const tier = gameTier(lm.tier);

    // 1. "ما اسم هذا المعلَم؟"
    const nameDistractors = pickDistractors(landmarks, lm.id, 3);
    const [nameOpts, nameIdx] = buildOptions(lm.nameAr, nameDistractors.map((d) => d.nameAr));
    qs.push({
      id: `img-lm-name-${lm.id}`,
      category: 'travel' as CategoryId,
      tier,
      points: (tier * 100) as Question['points'],
      text: 'ما اسم هذا المعلَم؟',
      options: nameOpts,
      correctIndex: nameIdx,
      type: 'image',
      mediaUrl: lm.imageUrl,
      mediaAlt: lm.nameAr,
    });

    // 2. "أين يقع هذا المعلَم؟"
    const countryDistractors = pickDistractors(landmarks, lm.id, 3);
    const [countryOpts, countryIdx] = buildOptions(
      lm.countryAr,
      countryDistractors.map((d) => d.countryAr)
    );
    qs.push({
      id: `img-lm-country-${lm.id}`,
      category: 'travel' as CategoryId,
      tier,
      points: (tier * 100) as Question['points'],
      text: 'أين يقع هذا المعلَم؟',
      options: countryOpts,
      correctIndex: countryIdx,
      type: 'image',
      mediaUrl: lm.imageUrl,
      mediaAlt: lm.nameAr,
    });
  }

  return qs;
}

// ── Audio generators ──────────────────────────────────────────────────────────

function fromAudio(audioRows: SeedAudio[]): Question[] {
  const qs: Question[] = [];

  for (const clip of audioRows) {
    const tier = gameTier(clip.tier);
    const promptMap: Record<SeedAudio['kind'], string> = {
      song:   'ما اسم هذه الأغنية؟',
      sound:  'صوت ماذا هذا؟',
      anthem: 'نشيد أيّ دولة هذا؟',
    };
    const sameKind = audioRows.filter((a) => a.kind === clip.kind && a.id !== clip.id);
    const distractors = shuffle(sameKind).slice(0, 3).map((a) => a.titleAr);
    // Pad with other-kind titles if not enough same-kind
    if (distractors.length < 3) {
      const others = audioRows
        .filter((a) => a.id !== clip.id && !distractors.includes(a.titleAr))
        .map((a) => a.titleAr);
      distractors.push(...shuffle(others).slice(0, 3 - distractors.length));
    }
    const [opts, idx] = buildOptions(clip.titleAr, distractors);
    qs.push({
      id: `audio-${clip.id}`,
      category: 'music' as CategoryId,
      tier,
      points: (tier * 100) as Question['points'],
      text: promptMap[clip.kind],
      options: opts,
      correctIndex: idx,
      type: 'audio',
      mediaUrl: clip.clipUrl,
      mediaDuration: 10,
    });
  }

  return qs;
}

// ── Charades generators ───────────────────────────────────────────────────────

function fromCharades(words: SeedWord[]): Question[] {
  return words.map((w) => {
    const tier = gameTier(w.tier);
    return {
      id: `charades-${w.id}`,
      category: 'culture' as CategoryId,
      tier,
      points: (tier * 100) as Question['points'],
      text: w.wordAr,
      options: [],
      correctIndex: 0,
      type: 'charades' as const,
      tags: w.emoji ? [w.emoji] : undefined,
    } satisfies Question;
  });
}

// ── Draw generators ───────────────────────────────────────────────────────────

function fromDrawWords(words: SeedWord[]): Question[] {
  return words.map((w) => {
    const tier = gameTier(w.tier);
    return {
      id: `draw-${w.id}`,
      category: 'culture' as CategoryId,
      tier,
      points: (tier * 100) as Question['points'],
      text: w.wordAr,
      options: [],
      correctIndex: 0,
      type: 'guess' as const,
      tags: ['draw', ...(w.emoji ? [w.emoji] : [])],
    } satisfies Question;
  });
}

// ── Riddle generators ─────────────────────────────────────────────────────────

function fromRiddles(riddles: SeedRiddle[]): Question[] {
  return riddles.map((r) => {
    const tier = gameTier(r.tier);
    const [opts, idx] = buildOptions(r.answerAr, r.distractorsAr);
    return {
      id: `riddle-${r.id}`,
      category: 'riddles_ar' as CategoryId,
      tier,
      points: (tier * 100) as Question['points'],
      text: r.promptAr,
      options: opts,
      correctIndex: idx,
      type: 'riddle' as const,
    } satisfies Question;
  });
}

// ── Proverb generators ────────────────────────────────────────────────────────

function fromProverbs(proverbs: SeedProverb[]): Question[] {
  return proverbs.map((p) => {
    const tier = gameTier(p.tier);
    const [opts, idx] = buildOptions(p.answerAr, p.distractorsAr);
    return {
      id: `proverb-${p.id}`,
      category: 'arabic_language' as CategoryId,
      tier,
      points: (tier * 100) as Question['points'],
      text: p.sentenceAr,
      options: opts,
      correctIndex: idx,
      type: 'text' as const,
      tags: ['proverb'],
    } satisfies Question;
  });
}

// ── Figure/clue generators ────────────────────────────────────────────────────

function fromFigures(figures: SeedFigure[]): Question[] {
  const qs: Question[] = [];

  for (const fig of figures) {
    const tier = gameTier(fig.tier);
    // Emit one question per clue, scoring decreases with each revealed clue.
    // In the existing engine these render as plain text questions. The clues
    // are joined with a separator so the host can reveal them progressively.
    const clueText = fig.cluesAr
      .map((clue, i) => `${i + 1}. ${clue}`)
      .join('\n');
    qs.push({
      id: `clue-${fig.id}`,
      category: 'history' as CategoryId,
      tier,
      points: (tier * 100) as Question['points'],
      text: `مَن أنا؟\n${clueText}`,
      options: [fig.nameAr, '؟', '؟؟', '؟؟؟'],
      correctIndex: 0,
      type: 'riddle' as const,
      tags: ['clue'],
    });
  }

  return qs;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Build the full generated question bank from a seed-data object.
 * Validates that every question has a unique id.
 */
export function buildFromSeed(seed: SeedData): Question[] {
  const all: Question[] = [
    ...fromCountries(seed.countries),
    ...fromLandmarks(seed.landmarks),
    ...fromAudio(seed.audio),
    ...fromCharades(seed.charadesWords),
    ...fromDrawWords(seed.drawWords),
    ...fromRiddles(seed.riddles),
    ...fromProverbs(seed.proverbs),
    ...fromFigures(seed.figures),
  ];

  // Validate uniqueness
  const seen = new Set<string>();
  const deduped: Question[] = [];
  for (const q of all) {
    if (seen.has(q.id)) {
      console.warn(`[factory] duplicate question id skipped: ${q.id}`);
      continue;
    }
    seen.add(q.id);
    deduped.push(q);
  }

  return deduped;
}
