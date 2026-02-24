import { getWordOfTheDay } from "@/lib/kv";
import WordCard from "@/components/WordCard";
import KnewItButtons from "@/components/KnewItButtons";
import ShareButton from "@/components/ShareButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const word = await getWordOfTheDay();

  if (!word) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h1 className="font-serif text-4xl font-bold text-[#1B365D] mb-4">
          No word yet today
        </h1>
        <p className="text-[#6B7280] text-lg">
          The word of the day hasn&apos;t been fetched yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div>
      <WordCard
        word={word.word}
        date={word.date}
        phonetic={word.phonetic}
        audioUrl={word.audioUrl}
        partOfSpeech={word.partOfSpeech}
        definition={word.definition}
        definitions={word.definitions}
        examples={word.examples}
        origin={word.origin}
      />
      <div className="mt-6 flex items-center gap-4">
        <ShareButton word={word.word} definition={word.definition} />
      </div>
      <KnewItButtons />
    </div>
  );
}
