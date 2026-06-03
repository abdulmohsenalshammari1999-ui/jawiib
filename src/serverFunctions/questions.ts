import { createServerFn } from '@tanstack/react-start';
// Bundled at build time — file is never served as a public static asset
import questionsRaw from '../data/questions.csv?raw';

export const getQuestionsCSV = createServerFn({ method: 'GET' }).handler(
  async () => questionsRaw,
);
