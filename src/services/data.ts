import { DailyWord, FlashcardDeck, Lesson } from '../types';
import { isRemote, getApiBase } from './config';

// Local demo data imports
import { lessons as localLessons } from '../data/lessons';
import { flashcardDecks as localDecks } from '../data/flashcards';
import { dailyWords as localDailyWords, getDailyWord as localGetDailyWord } from '../data/dailyWords';

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
};

export const listLessons = async (): Promise<Lesson[]> => {
  if (!isRemote()) return localLessons;
  const base = getApiBase();
  return fetchJson<Lesson[]>(`${base}/lessons`);
};

export const getLessonById = async (id: string): Promise<Lesson | undefined> => {
  if (!isRemote()) return localLessons.find(l => l.id === id);
  const base = getApiBase();
  return fetchJson<Lesson>(`${base}/lessons/${encodeURIComponent(id)}`);
};

export const listFlashcardDecks = async (): Promise<FlashcardDeck[]> => {
  if (!isRemote()) return localDecks;
  const base = getApiBase();
  return fetchJson<FlashcardDeck[]>(`${base}/flashcards`);
};

export const getFlashcardDeckById = async (id: string): Promise<FlashcardDeck | undefined> => {
  if (!isRemote()) return localDecks.find(d => d.id === id);
  const base = getApiBase();
  return fetchJson<FlashcardDeck>(`${base}/flashcards/${encodeURIComponent(id)}`);
};

export const getAllDailyWords = async (): Promise<DailyWord[]> => {
  if (!isRemote()) return localDailyWords;
  const base = getApiBase();
  return fetchJson<DailyWord[]>(`${base}/daily-words`);
};

export const getDailyWord = async (): Promise<DailyWord> => {
  if (!isRemote()) return localGetDailyWord();
  const base = getApiBase();
  return fetchJson<DailyWord>(`${base}/daily-word`);
};
