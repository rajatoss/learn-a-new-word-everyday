import { getWordByName } from "@/lib/kv";
import WordCard from "@/components/WordCard";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { notFound } from "next/navigation";

interface WordPageProps {
  params: Promise<{ word: string }>;
}

export async function generateMetadata({ params }: WordPageProps) {
  const { word: slug } = await params;
  const decodedWord = decodeURIComponent(slug);
  return {
    title: `${decodedWord} — Learn A New Word Everyday`,
    description: `Definition, pronunciation, and examples for "${decodedWord}".`,
  };
}

export default async function WordPage({ params }: WordPageProps) {
  const { word: slug } = await params;
  const decodedWord = decodeURIComponent(slug);
  const word = await getWordByName(decodedWord);

  if (!word) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/archive"
        className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#1B365D] transition-colors mb-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
        </svg>
        Back to Archive
      </Link>
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
        showDate={true}
      />
      <div className="mt-6">
        <ShareButton word={word.word} definition={word.definition} />
      </div>
    </div>
  );
}
