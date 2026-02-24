import { getAllArchivedWords } from "@/lib/kv";
import ArchiveList from "@/components/ArchiveList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Archive — Learn A New Word Everyday",
  description: "Browse all past words of the day.",
};

export default async function ArchivePage() {
  const words = await getAllArchivedWords();

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-[#1B365D] mb-2">
          Word Archive
        </h1>
        <p className="text-[#6B7280]">
          Every word we&apos;ve featured, collected for you to explore.
        </p>
      </div>
      <ArchiveList
        words={words.map((w) => ({
          word: w.word,
          date: w.date,
          partOfSpeech: w.partOfSpeech,
          definition: w.definition,
        }))}
      />
    </div>
  );
}
