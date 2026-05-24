import { useState, useEffect, useCallback } from "react";

export type Tag = "Romance" | "Cozy" | "Cute" | "Playful" | "Emotional" | "Classic" | "Trending" | "Soft Love";

export interface Sticker {
  id: number;
  name: string;
  tag: Tag;
  emoji: string;
  image?: string;
  enabled: boolean;
  trending: boolean;
}

/** Crop + resize any image file to a square JPEG data-URL (default 600×600 px). */
export function fileToSquareDataUrl(file: File, size = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width  = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const min = Math.min(img.width, img.height);
        const sx  = (img.width  - min) / 2;
        const sy  = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function useStickers() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (retryCount = 0) => {
    try {
      if (retryCount === 0) setLoading(true);
      const res = await fetch("/api/stickers");
      if (res.ok) {
        const data = await res.json();
        setStickers(data);
        setLoading(false);
      } else if ((res.status === 504 || res.status === 502 || res.status === 503) && retryCount < 6) {
        console.log(`Server might be waking up (Render cold start). Retrying in 5s... (Attempt ${retryCount + 1})`);
        setTimeout(() => refresh(retryCount + 1), 5000);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error("Failed to fetch stickers from backend:", e);
      if (retryCount < 6) {
        console.log(`Network error, retrying in 5s... (Attempt ${retryCount + 1})`);
        setTimeout(() => refresh(retryCount + 1), 5000);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addSticker = useCallback(async (data: Omit<Sticker, "id">) => {
    try {
      const res = await fetch("/api/stickers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "8523",
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newSticker = await res.json();
        setStickers((prev) => [...prev, newSticker]);
      }
    } catch (e) {
      console.error("Failed to add sticker:", e);
    }
  }, []);

  const updateSticker = useCallback(async (id: number, data: Partial<Omit<Sticker, "id">>) => {
    try {
      const res = await fetch(`/api/stickers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "8523",
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setStickers((prev) => prev.map((s) => (s.id === id ? updated : s)));
      }
    } catch (e) {
      console.error("Failed to update sticker:", e);
    }
  }, []);

  const deleteSticker = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/stickers/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": "8523",
        },
      });
      if (res.ok) {
        setStickers((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete sticker:", e);
    }
  }, []);

  const toggleEnabled = useCallback(async (id: number) => {
    setStickers((prev) => {
      const s = prev.find((item) => item.id === id);
      if (!s) return prev;
      const nextVal = !s.enabled;
      updateSticker(id, { enabled: nextVal });
      return prev.map((item) => item.id === id ? { ...item, enabled: nextVal } : item);
    });
  }, [updateSticker]);

  const toggleTrending = useCallback(async (id: number) => {
    setStickers((prev) => {
      const s = prev.find((item) => item.id === id);
      if (!s) return prev;
      const nextVal = !s.trending;
      updateSticker(id, { trending: nextVal });
      return prev.map((item) => item.id === id ? { ...item, trending: nextVal } : item);
    });
  }, [updateSticker]);

  return {
    stickers,
    loading,
    refresh,
    addSticker,
    updateSticker,
    deleteSticker,
    reorder: (newOrder: Sticker[]) => setStickers(newOrder),
    toggleEnabled,
    toggleTrending,
    resetToDefaults: () => {},
  };
}
