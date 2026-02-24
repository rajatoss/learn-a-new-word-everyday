import { createClient } from "@vercel/kv";

export interface WordOfTheDay {
  word: string;
  date: string;
  phonetic: string;
  audioUrl: string;
  partOfSpeech: string;
  definition: string;
  definitions: Array<{
    definition: string;
    partOfSpeech: string;
    example?: string;
  }>;
  examples: string[];
  origin: string;
}

// ---------------------------------------------------------------------------
// In-memory fallback for local development (when KV credentials aren't set)
// Attach to globalThis so the store survives Next.js hot reloads / module re-imports
// ---------------------------------------------------------------------------

const globalStore = globalThis as unknown as {
  __devKvStore?: Map<string, unknown>;
};
if (!globalStore.__devKvStore) {
  globalStore.__devKvStore = new Map<string, unknown>();
}
const memStore = globalStore.__devKvStore;

// Vercel KV uses KV_REST_API_URL; Upstash Redis integration uses UPSTASH_REDIS_REST_URL
function getKvCredentials(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && url.startsWith("https://")) {
    return { url, token };
  }
  return null;
}

export function isKvConfigured(): boolean {
  return getKvCredentials() !== null;
}

function getKv() {
  const creds = getKvCredentials();
  if (!creds) throw new Error("KV not configured");
  return createClient(creds);
}

async function kvGet<T>(key: string): Promise<T | null> {
  if (!isKvConfigured()) {
    return (memStore.get(key) as T) ?? null;
  }
  return getKv().get<T>(key);
}

async function kvSet(key: string, value: unknown): Promise<void> {
  if (!isKvConfigured()) {
    memStore.set(key, value);
    return;
  }
  await getKv().set(key, value);
}

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

const WORD_OF_THE_DAY_KEY = "word-of-the-day";
const ARCHIVE_PREFIX = "archive:";
const ARCHIVE_INDEX_KEY = "archive-index";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function setWordOfTheDay(data: WordOfTheDay): Promise<void> {
  await kvSet(WORD_OF_THE_DAY_KEY, data);
  await kvSet(`${ARCHIVE_PREFIX}${data.date}`, data);

  // Add to archive index
  const index = (await kvGet<string[]>(ARCHIVE_INDEX_KEY)) ?? [];
  if (!index.includes(data.date)) {
    index.unshift(data.date);
    await kvSet(ARCHIVE_INDEX_KEY, index);
  }

  // Also store by word for the /word/[word] page
  await kvSet(`word:${data.word.toLowerCase()}`, data);
}

export async function getWordOfTheDay(): Promise<WordOfTheDay | null> {
  return kvGet<WordOfTheDay>(WORD_OF_THE_DAY_KEY);
}

export async function getArchivedWord(
  date: string
): Promise<WordOfTheDay | null> {
  return kvGet<WordOfTheDay>(`${ARCHIVE_PREFIX}${date}`);
}

export async function getWordByName(
  word: string
): Promise<WordOfTheDay | null> {
  return kvGet<WordOfTheDay>(`word:${word.toLowerCase()}`);
}

export async function getArchiveIndex(): Promise<string[]> {
  return (await kvGet<string[]>(ARCHIVE_INDEX_KEY)) ?? [];
}

export async function getAllArchivedWords(): Promise<WordOfTheDay[]> {
  const index = await getArchiveIndex();
  const words: WordOfTheDay[] = [];
  for (const date of index) {
    const word = await getArchivedWord(date);
    if (word) words.push(word);
  }
  return words;
}
