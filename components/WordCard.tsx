import AudioButton from "./AudioButton";

interface Definition {
  definition: string;
  partOfSpeech: string;
  example?: string;
}

interface WordCardProps {
  word: string;
  date: string;
  phonetic: string;
  audioUrl: string;
  partOfSpeech: string;
  definition: string;
  definitions: Definition[];
  examples: string[];
  origin: string;
  showDate?: boolean;
}

export default function WordCard({
  word,
  date,
  phonetic,
  audioUrl,
  partOfSpeech,
  definitions,
  examples,
  origin,
  showDate = true,
}: WordCardProps) {
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="animate-fade-in">
      {showDate && (
        <p className="text-sm uppercase tracking-widest text-[#6B7280] mb-2 font-sans">
          Word of the Day &mdash; {formattedDate}
        </p>
      )}

      {/* Word and pronunciation */}
      <div className="mb-8">
        <div className="flex items-end gap-4 mb-3">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#1B365D] leading-tight">
            {word}
          </h1>
          <AudioButton audioUrl={audioUrl} />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#1B365D] text-white">
            {partOfSpeech}
          </span>
          {phonetic && (
            <span className="text-lg text-[#6B7280] font-mono">{phonetic}</span>
          )}
        </div>
      </div>

      {/* Definitions */}
      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-3 font-sans font-semibold">
          Definitions
        </h2>
        <div className="space-y-4">
          {definitions.map((def, i) => (
            <div key={i} className="pl-4 border-l-2 border-[#E5E0D8]">
              <p className="text-[#1B365D] text-lg leading-relaxed">
                <span className="text-[#9CA3AF] text-sm italic mr-2">
                  {def.partOfSpeech}
                </span>
                {def.definition}
              </p>
              {def.example && (
                <p className="text-[#6B7280] text-sm mt-1 italic">
                  &ldquo;{def.example}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      {examples.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-3 font-sans font-semibold">
            Examples
          </h2>
          <ul className="space-y-2">
            {examples.map((example, i) => (
              <li
                key={i}
                className="text-[#4B5563] leading-relaxed pl-4 border-l-2 border-[#E5E0D8]"
              >
                &ldquo;{example}&rdquo;
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Etymology / Origin */}
      {origin && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-3 font-sans font-semibold">
            Etymology
          </h2>
          <p className="text-[#4B5563] leading-relaxed bg-[#F5F0E8] rounded-lg p-4 italic">
            {origin}
          </p>
        </section>
      )}
    </article>
  );
}
