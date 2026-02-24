import { NextResponse } from "next/server";
import { getWordOfTheDay } from "@/lib/kv";

export async function GET() {
  try {
    const word = await getWordOfTheDay();

    if (!word) {
      return NextResponse.json(
        { error: "No word of the day found. Trigger /api/cron first." },
        { status: 404 }
      );
    }

    return NextResponse.json(word);
  } catch (error) {
    console.error("Failed to get word:", error);
    return NextResponse.json(
      { error: "Failed to retrieve word of the day" },
      { status: 500 }
    );
  }
}
