import Link from "next/link";

interface ArchiveItem {
  word: string;
  date: string;
  partOfSpeech: string;
  definition: string;
}

interface ArchiveListProps {
  words: ArchiveItem[];
}

export default function ArchiveList({ words }: ArchiveListProps) {
  if (words.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[#9CA3AF] text-lg">
          No words archived yet. Check back tomorrow!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {words.map((item) => {
        const formattedDate = new Date(item.date + "T00:00:00").toLocaleDateString(
          "en-US",
          {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        );

        return (
          <Link
            key={item.date}
            href={`/word/${encodeURIComponent(item.word.toLowerCase())}`}
            className="block group"
          >
            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E0D8] hover:shadow-md hover:border-[#1B365D]/20 transition-all duration-200">
              <div className="flex items-baseline justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-serif text-2xl font-bold text-[#1B365D] group-hover:text-[#264a80] transition-colors">
                    {item.word}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#F5F0E8] text-[#6B7280]">
                      {item.partOfSpeech}
                    </span>
                    <p className="text-[#6B7280] text-sm truncate">
                      {item.definition}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#9CA3AF] whitespace-nowrap">
                  {formattedDate}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
