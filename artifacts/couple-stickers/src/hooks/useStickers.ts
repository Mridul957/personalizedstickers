import { useState, useEffect, useCallback } from "react";

export type Tag = "Romance" | "Cozy" | "Cute" | "Playful" | "Emotional" | "Classic" | "Trending" | "Soft Love";

export interface Sticker {
  id: number;
  name: string;
  tag: Tag;
  emoji: string;
  enabled: boolean;
  trending: boolean;
}

const STORAGE_KEY = "ours_stickers_v1";

const DEFAULT_STICKERS: Sticker[] = [
  { id: 1,  name: "The First Kiss",     tag: "Romance",    emoji: "💋", enabled: true,  trending: true  },
  { id: 2,  name: "Forever Hug",        tag: "Cozy",       emoji: "🤗", enabled: true,  trending: false },
  { id: 3,  name: "Sleepy Together",    tag: "Soft Love",  emoji: "😴", enabled: true,  trending: false },
  { id: 4,  name: "Late Night Calls",   tag: "Emotional",  emoji: "🌙", enabled: true,  trending: true  },
  { id: 5,  name: "Matching Hoodies",   tag: "Cute",       emoji: "👫", enabled: true,  trending: false },
  { id: 6,  name: "Coffee Date",        tag: "Classic",    emoji: "☕", enabled: true,  trending: false },
  { id: 7,  name: "Holding Hands",      tag: "Classic",    emoji: "🤝", enabled: true,  trending: false },
  { id: 8,  name: "Movie Night",        tag: "Cozy",       emoji: "🎬", enabled: true,  trending: false },
  { id: 9,  name: "Forever Yours",      tag: "Romance",    emoji: "💍", enabled: true,  trending: true  },
  { id: 10, name: "Cute Fight",         tag: "Playful",    emoji: "🥊", enabled: true,  trending: false },
  { id: 11, name: "Rainy Walk",         tag: "Emotional",  emoji: "☂️", enabled: true,  trending: false },
  { id: 12, name: "Long Distance Love", tag: "Emotional",  emoji: "✈️", enabled: true,  trending: false },
  { id: 13, name: "Soft Smile",         tag: "Soft Love",  emoji: "🥰", enabled: true,  trending: false },
  { id: 14, name: "Together Always",    tag: "Classic",    emoji: "♾️", enabled: true,  trending: false },
  { id: 15, name: "Dance Together",     tag: "Playful",    emoji: "💃", enabled: true,  trending: false },
  { id: 16, name: "Blushing Love",      tag: "Romance",    emoji: "😊", enabled: true,  trending: false },
  { id: 17, name: "Lazy Sunday",        tag: "Cozy",       emoji: "🛋️", enabled: true,  trending: false },
  { id: 18, name: "Heart Hands",        tag: "Cute",       emoji: "🫶", enabled: true,  trending: true  },
  { id: 19, name: "Ice Cream Date",     tag: "Cute",       emoji: "🍦", enabled: true,  trending: false },
  { id: 20, name: "Cozy Moments",       tag: "Cozy",       emoji: "🧣", enabled: true,  trending: false },
  { id: 21, name: "Stolen Glances",     tag: "Romance",    emoji: "👀", enabled: true,  trending: false },
  { id: 22, name: "Good Morning Kiss",  tag: "Soft Love",  emoji: "🌅", enabled: true,  trending: false },
  { id: 23, name: "Stargazing Night",   tag: "Emotional",  emoji: "🌟", enabled: true,  trending: false },
  { id: 24, name: "Pinky Promise",      tag: "Cute",       emoji: "🤙", enabled: true,  trending: false },
  { id: 25, name: "Reading Together",   tag: "Cozy",       emoji: "📖", enabled: true,  trending: false },
  { id: 26, name: "Beach Walk",         tag: "Classic",    emoji: "🌊", enabled: true,  trending: false },
  { id: 27, name: "Surprise Hug",       tag: "Playful",    emoji: "🎁", enabled: true,  trending: false },
  { id: 28, name: "Matching Outfits",   tag: "Trending",   emoji: "👗", enabled: true,  trending: true  },
  { id: 29, name: "Selfie Time",        tag: "Trending",   emoji: "🤳", enabled: true,  trending: false },
  { id: 30, name: "Forever & Always",   tag: "Emotional",  emoji: "💞", enabled: true,  trending: false },
];

function load(): Sticker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Sticker[];
  } catch {}
  return DEFAULT_STICKERS;
}

function save(stickers: Sticker[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stickers));
  } catch {}
}

export function useStickers() {
  const [stickers, setStickers] = useState<Sticker[]>(load);

  useEffect(() => {
    save(stickers);
  }, [stickers]);

  const addSticker = useCallback((data: Omit<Sticker, "id">) => {
    setStickers((prev) => {
      const id = prev.length > 0 ? Math.max(...prev.map((s) => s.id)) + 1 : 1;
      return [...prev, { id, ...data }];
    });
  }, []);

  const updateSticker = useCallback((id: number, data: Partial<Omit<Sticker, "id">>) => {
    setStickers((prev) => prev.map((s) => s.id === id ? { ...s, ...data } : s));
  }, []);

  const deleteSticker = useCallback((id: number) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const reorder = useCallback((newOrder: Sticker[]) => {
    setStickers(newOrder);
  }, []);

  const toggleEnabled  = useCallback((id: number) => updateSticker(id, {}), [updateSticker]);
  const toggleTrending = useCallback((id: number) => updateSticker(id, {}), [updateSticker]);

  return {
    stickers,
    addSticker,
    updateSticker,
    deleteSticker,
    reorder,
    toggleEnabled: (id: number) => setStickers((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s)),
    toggleTrending: (id: number) => setStickers((prev) => prev.map((s) => s.id === id ? { ...s, trending: !s.trending } : s)),
    resetToDefaults: () => setStickers(DEFAULT_STICKERS),
  };
}

export { DEFAULT_STICKERS };
