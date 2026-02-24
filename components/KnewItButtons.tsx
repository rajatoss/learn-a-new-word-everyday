"use client";

import { useState } from "react";
import confetti from "canvas-confetti";

export default function KnewItButtons() {
  const [selected, setSelected] = useState<"yes" | "no" | null>(null);

  const handleYes = () => {
    setSelected("yes");
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
    });
  };

  return (
    <div className="mt-10 pt-8 border-t border-[#E5E0D8]">
      <p className="text-[#6B7280] font-sans text-sm mb-4">
        Did you already know this word?
      </p>
      {selected === null ? (
        <div className="flex gap-3">
          <button
            onClick={handleYes}
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-[#1B365D] text-white hover:bg-[#264a80] transition-colors duration-200"
          >
            Yes, I knew it!
          </button>
          <button
            onClick={() => setSelected("no")}
            className="px-6 py-2.5 rounded-full text-sm font-semibold border-2 border-[#1B365D] text-[#1B365D] hover:bg-[#1B365D] hover:text-white transition-colors duration-200"
          >
            No, it&apos;s new to me
          </button>
        </div>
      ) : selected === "yes" ? (
        <p className="text-[#1B365D] font-semibold animate-fade-in">
          Impressive! You have a great vocabulary.
        </p>
      ) : (
        <p className="text-[#1B365D] font-semibold animate-fade-in">
          Wonderful — you just learned something new today!
        </p>
      )}
    </div>
  );
}
