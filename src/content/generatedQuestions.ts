/**
 * Generated question bank — built from seed-data.json via factory.ts.
 * Import GENERATED_QUESTIONS and pass to registerCustomQuestions() at startup
 * to add all factory-generated questions to the question pool.
 */
import type { Question } from '../lib/types';
import { buildFromSeed } from './factory';
import type { SeedData } from './factory';
import seedRaw from './seed-data.json';

export const GENERATED_QUESTIONS: Question[] = buildFromSeed(seedRaw as SeedData);
