const RSS_URL = "https://www.merriam-webster.com/wotd/feed/rss2";
const API_BASE =
  "https://www.dictionaryapi.com/api/v3/references/collegiate/json";
const AUDIO_BASE = "https://media.merriam-webster.com/audio/prons/en/us/mp3";

// ---------------------------------------------------------------------------
// 1. Fetch the Word of the Day from the Merriam-Webster RSS feed
// ---------------------------------------------------------------------------

export async function fetchWordOfTheDayWord(): Promise<string> {
  const res = await fetch(RSS_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`MW RSS feed error: ${res.status}`);
  }
  const xml = await res.text();

  // Extract the first <title> inside the first <item>
  const itemMatch = xml.match(/<item[\s>][\s\S]*?<\/item>/);
  if (!itemMatch) {
    throw new Error("No <item> found in MW RSS feed");
  }
  const titleMatch = itemMatch[0].match(
    /<title><!\[CDATA\[(.*?)\]\]><\/title>/
  );
  if (!titleMatch) {
    // Fallback: title without CDATA
    const plainTitle = itemMatch[0].match(/<title>(.*?)<\/title>/);
    if (!plainTitle) throw new Error("No <title> found in RSS item");
    return plainTitle[1].trim();
  }
  return titleMatch[1].trim();
}

// ---------------------------------------------------------------------------
// 2. Fetch full word details from the MW Collegiate Dictionary API
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface MerriamEntry {
  word: string;
  phonetic: string;
  audioUrl: string;
  partOfSpeech: string;
  definitions: Array<{
    definition: string;
    partOfSpeech: string;
    example?: string;
  }>;
  examples: string[];
  etymology: string;
  firstKnownUse: string;
}

export async function fetchMerriamEntry(word: string): Promise<MerriamEntry> {
  const apiKey = process.env.MERRIAM_WEBSTER_API_KEY;
  if (!apiKey) {
    throw new Error("MERRIAM_WEBSTER_API_KEY is not set");
  }

  const res = await fetch(
    `${API_BASE}/${encodeURIComponent(word)}?key=${apiKey}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`MW API error: ${res.status}`);
  }

  const data = await res.json();

  // The API returns an array of strings (suggestions) if the word isn't found
  if (!data.length || typeof data[0] === "string") {
    throw new Error(
      `Word "${word}" not found in MW API. Suggestions: ${data.slice(0, 5).join(", ")}`
    );
  }

  // Use the first entry that has definitions
  const entry = data.find((e: any) => e.def) ?? data[0];

  return parseEntry(entry, data);
}

// ---------------------------------------------------------------------------
// 3. Parse the deeply-nested MW response into a clean structure
// ---------------------------------------------------------------------------

function parseEntry(entry: any, allEntries: any[]): MerriamEntry {
  // --- Word ---
  const word = cleanId(entry.meta?.id ?? "");

  // --- Pronunciation ---
  const prs = entry.hwi?.prs?.[0];
  const phonetic = prs?.mw ? `/${prs.mw}/` : "";

  // --- Audio URL ---
  let audioUrl = "";
  const audioFile = prs?.sound?.audio;
  if (audioFile) {
    audioUrl = `${AUDIO_BASE}/${audioSubfolder(audioFile)}/${audioFile}.mp3`;
  }

  // --- Part of speech ---
  const partOfSpeech = entry.fl ?? "word";

  // --- Definitions & inline examples ---
  const definitions: MerriamEntry["definitions"] = [];
  const examples: string[] = [];

  for (const e of allEntries) {
    if (!e.def) continue;
    const pos = e.fl ?? partOfSpeech;
    for (const defBlock of e.def) {
      for (const senseGroup of defBlock.sseq ?? []) {
        parseSenseGroup(senseGroup, pos, definitions, examples);
      }
    }
  }

  // --- Etymology ---
  let etymology = "";
  if (entry.et) {
    etymology = entry.et
      .map((seg: any) => (typeof seg === "string" ? seg : seg[1] ?? ""))
      .join("")
      .replace(/\{[^}]*\}/g, "")
      .trim();
  }

  // --- First known use ---
  const firstKnownUse = entry.date ? stripMarkup(entry.date) : "";

  return {
    word,
    phonetic,
    audioUrl,
    partOfSpeech,
    definitions,
    examples: examples.slice(0, 5),
    etymology,
    firstKnownUse,
  };
}

// ---------------------------------------------------------------------------
// Sense-sequence parser — handles sense, bs (binding substitute), sen, etc.
// ---------------------------------------------------------------------------

function parseSenseGroup(
  senseGroup: any[],
  partOfSpeech: string,
  definitions: MerriamEntry["definitions"],
  examples: string[]
) {
  for (const item of senseGroup) {
    if (!Array.isArray(item) || item.length < 2) continue;

    const type = item[0];
    const body = item[1];

    if (type === "sense") {
      const { def, exs } = parseDt(body.dt);
      if (def) {
        definitions.push({
          definition: def,
          partOfSpeech,
          example: exs[0],
        });
        for (const ex of exs) {
          if (!examples.includes(ex)) examples.push(ex);
        }
      }
    } else if (type === "bs") {
      // Binding substitute — contains a nested sense
      if (body?.sense) {
        const { def, exs } = parseDt(body.sense.dt);
        if (def) {
          definitions.push({ definition: def, partOfSpeech, example: exs[0] });
          for (const ex of exs) {
            if (!examples.includes(ex)) examples.push(ex);
          }
        }
      }
    } else if (type === "sen") {
      // Truncated sense
      const { def, exs } = parseDt(body.dt);
      if (def) {
        definitions.push({ definition: def, partOfSpeech, example: exs[0] });
        for (const ex of exs) {
          if (!examples.includes(ex)) examples.push(ex);
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// dt (defining text) parser
// ---------------------------------------------------------------------------

function parseDt(dt: any[] | undefined): { def: string; exs: string[] } {
  if (!dt) return { def: "", exs: [] };
  let def = "";
  const exs: string[] = [];

  for (const part of dt) {
    if (!Array.isArray(part)) continue;
    const [tag, value] = part;

    if (tag === "text") {
      def += stripMarkup(value);
    } else if (tag === "vis") {
      // Verbal illustrations (examples)
      for (const vis of value) {
        if (vis.t) {
          exs.push(stripMarkup(vis.t));
        }
      }
    }
  }

  return { def: def.trim(), exs };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip MW markup tokens like {bc}, {it}...{/it}, {wi}, {sx|...|...|...} */
function stripMarkup(text: string): string {
  return text
    .replace(/\{bc\}/g, "") // bold colon
    .replace(/\{it\}(.*?)\{\/it\}/g, "$1") // italic
    .replace(/\{b\}(.*?)\{\/b\}/g, "$1") // bold
    .replace(/\{sc\}(.*?)\{\/sc\}/g, "$1") // small caps
    .replace(/\{wi\}(.*?)\{\/wi\}/g, "$1") // word illustration
    .replace(/\{phrase\}(.*?)\{\/phrase\}/g, "$1")
    .replace(/\{qword\}(.*?)\{\/qword\}/g, "$1")
    .replace(/\{sx\|([^|]*)\|[^}]*\}/g, "$1") // synonym cross-ref
    .replace(/\{d_link\|([^|]*)\|[^}]*\}/g, "$1") // definition link
    .replace(/\{a_link\|([^|]*)\}/g, "$1") // auto link
    .replace(/\{dxt\|([^|]*)\|[^}]*\}/g, "$1") // direct cross-ref
    .replace(/\{ma\}(.*?)\{\/ma\}/g, "$1") // more at
    .replace(/\{[^}]*\}/g, "") // catch-all for remaining tokens
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Remove the homograph suffix from meta.id  (e.g. "test:1" → "test") */
function cleanId(id: string): string {
  return id.replace(/:\d+$/, "");
}

/** Determine the audio subdirectory per MW rules */
function audioSubfolder(filename: string): string {
  if (filename.startsWith("bix")) return "bix";
  if (filename.startsWith("gg")) return "gg";
  if (/^[0-9]/.test(filename)) return "number";
  return filename[0];
}
