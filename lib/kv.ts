import { createClient, type RedisClientType } from "redis";

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
// In-memory fallback for local development (when REDIS_URL isn't set)
// ---------------------------------------------------------------------------

const globalStore = globalThis as unknown as {
  __devKvStore?: Map<string, unknown>;
  __redisClient?: RedisClientType;
};
if (!globalStore.__devKvStore) {
  globalStore.__devKvStore = new Map<string, unknown>();
}
const memStore = globalStore.__devKvStore;

export function isKvConfigured(): boolean {
  const url = process.env.REDIS_URL;
  return !!(url && url.startsWith("redis://"));
}

async function getRedis(): Promise<RedisClientType> {
  if (globalStore.__redisClient?.isOpen) {
    return globalStore.__redisClient;
  }
  const client = createClient({
    url: process.env.REDIS_URL,
  }) as RedisClientType;
  await client.connect();
  globalStore.__redisClient = client;
  return client;
}

async function kvGet<T>(key: string): Promise<T | null> {
  if (!isKvConfigured()) {
    return (memStore.get(key) as T) ?? null;
  }
  const redis = await getRedis();
  const value = await redis.get(key);
  if (!value) return null;
  return JSON.parse(value) as T;
}

async function kvSet(key: string, value: unknown): Promise<void> {
  if (!isKvConfigured()) {
    memStore.set(key, value);
    return;
  }
  const redis = await getRedis();
  await redis.set(key, JSON.stringify(value));
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
