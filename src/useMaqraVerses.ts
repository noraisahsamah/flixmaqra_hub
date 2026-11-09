import { useState, useEffect, useRef } from 'react';

// ─── Types ──────────────────────────────────────────────
export interface FetchedAyah {
  surahNumber: number;
  ayahNumber: number;       // verse number within the surah
  textUthmani: string;      // full Uthmani text
  startWords: string;       // first ~3 words
  endWords: string;         // last ~3 words
  isFirstInSurah: boolean;  // first ayah of a new surah within this maqra
  surahName: string;
}

export type VerseFetchState = 'idle' | 'loading' | 'loaded' | 'error';

interface ApiResponseVerse {
  id: number;
  verse_number: number;
  verse_key: string;        // "2:255"
  text_uthmani: string;
}

interface ApiResponse {
  verses: ApiResponseVerse[];
}

// In-memory cache: surahId -> all verses for that surah
const surahCache = new Map<number, ApiResponseVerse[]>();

// Session cache: rubNumber -> processed FetchedAyah[]
const maqraVerseCache = new Map<number, FetchedAyah[]>();

const WORD_COUNT = 3;

function extractWords(text: string, fromStart: boolean, count: number): string {
  const words = text.split(/\s+/).filter(w => w.trim());
  if (words.length === 0) return text;
  if (fromStart) {
    return words.slice(0, Math.min(count, words.length)).join(' ');
  }
  return words.slice(Math.max(0, words.length - count)).join(' ');
}

export function useMaqraVerses(
  rubNumber: number | null,
  startSurah: number,
  startAyah: number,
  endSurah: number,
  endAyah: number,
  surahNames: Record<number, string>,
): { verses: FetchedAyah[]; state: VerseFetchState; error: string | null } {
  const [verses, setVerses] = useState<FetchedAyah[]>([]);
  const [state, setState] = useState<VerseFetchState>('idle');
  const [error, setError] = useState<string | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (rubNumber === null) return;

    // Return cached result immediately
    const cached = maqraVerseCache.get(rubNumber);
    if (cached) {
      setVerses(cached);
      setState('loaded');
      setError(null);
      return;
    }

    const currentReqId = ++reqIdRef.current;
    setState('loading');
    setError(null);

    // Determine which surahs we need to fetch
    const surahsNeeded: number[] = [];
    for (let s = startSurah; s <= endSurah; s++) surahsNeeded.push(s);

    // Filter to only uncached surahs
    const surahsToFetch = surahsNeeded.filter(s => !surahCache.has(s));

    const processVerses = () => {
      // Collect verses from all needed surahs, filtered to the maqra range
      const result: FetchedAyah[] = [];
      const seenSurahs = new Set<number>();

      for (const surah of surahsNeeded) {
        const allVerses = surahCache.get(surah);
        if (!allVerses) continue;

        const filtered = allVerses.filter(v => {
          if (surah === startSurah && v.verse_number < startAyah) return false;
          if (surah === endSurah && v.verse_number > endAyah) return false;
          return true;
        });

        for (const v of filtered) {
          const isFirstInSurah = !seenSurahs.has(surah);
          seenSurahs.add(surah);
          result.push({
            surahNumber: surah,
            ayahNumber: v.verse_number,
            textUthmani: v.text_uthmani,
            startWords: extractWords(v.text_uthmani, true, WORD_COUNT),
            endWords: extractWords(v.text_uthmani, false, WORD_COUNT),
            isFirstInSurah,
            surahName: surahNames[surah] || `Surah ${surah}`,
          });
        }
      }

      if (result.length > 0) {
        maqraVerseCache.set(rubNumber, result);
      }

      if (reqIdRef.current === currentReqId) {
        setVerses(result);
        setState('loaded');
      }
    };

    if (surahsToFetch.length === 0) {
      processVerses();
      return;
    }

    // Fetch all uncached surahs in parallel
    Promise.all(
      surahsToFetch.map(async (surahId) => {
        const url = `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=ar&words=false&fields=text_uthmani&page=1&per_page=300`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API error ${res.status} for surah ${surahId}`);
        const json: ApiResponse = await res.json();
        surahCache.set(surahId, json.verses || []);
      }),
    )
      .then(() => {
        if (reqIdRef.current === currentReqId) {
          processVerses();
        }
      })
      .catch((err: unknown) => {
        if (reqIdRef.current === currentReqId) {
          setState('error');
          setError(err instanceof Error ? err.message : 'Gagal memuat ayat');
        }
      });
  }, [rubNumber, startSurah, startAyah, endSurah, endAyah, surahNames]);

  return { verses, state, error };
}
