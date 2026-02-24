import { NextResponse } from "next/server";
import { fetchWordOfTheDayWord, fetchMerriamEntry } from "@/lib/merriam";
import { setWordOfTheDay, type WordOfTheDay } from "@/lib/kv";

export async function GET(request: Request) {
  // Verify cron secret in production (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Step 1: Get today's word from the MW RSS feed
    const word = await fetchWordOfTheDayWord();
    console.log(`Cron: Word of the day from MW RSS: "${word}"`);

    // Step 2: Get full details from the MW Collegiate Dictionary API
    const entry = await fetchMerriamEntry(word);

    // Step 3: Build the WordOfTheDay object
    const today = new Date().toISOString().split("T")[0];

    const wordData: WordOfTheDay = {
      word: entry.word,
      date: today,
      phonetic: entry.phonetic,
      audioUrl: entry.audioUrl,
      partOfSpeech: entry.partOfSpeech,
      definition: entry.definitions[0]?.definition ?? "",
      definitions: entry.definitions,
      examples: entry.examples,
      origin: entry.etymology
        ? entry.etymology
        : entry.firstKnownUse
          ? `First known use: ${entry.firstKnownUse}`
          : "",
    };

    // Step 4: Store in Vercel KV
    await setWordOfTheDay(wordData);

    console.log(`Cron: Successfully stored word "${word}" for ${today}`);

    return NextResponse.json({
      success: true,
      word: wordData.word,
      date: today,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch word of the day", details: String(error) },
      { status: 500 }
    );
  }
}
