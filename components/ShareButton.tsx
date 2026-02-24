"use client";

interface ShareButtonProps {
  word: string;
  definition: string;
}

export default function ShareButton({ word, definition }: ShareButtonProps) {
  const text = `Today's word is "${word}" — ${definition}. Learn a new word every day!`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-[#E5E0D8] text-[#6B7280] hover:border-[#1B365D] hover:text-[#1B365D] transition-colors duration-200"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Share
    </a>
  );
}
