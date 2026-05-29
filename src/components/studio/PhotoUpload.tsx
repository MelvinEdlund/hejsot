"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X, Image as ImgIcon, Link, Upload } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

type InputMode = "upload" | "url";

/**
 * Drag-and-drop foto-uppladdning eller URL-länk.
 * Returnerar publika URL:en när det är klart.
 */
export function PhotoUpload({
  value,
  onChange,
  caption,
  onCaptionChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  caption: string;
  onCaptionChange: (s: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<InputMode>("upload");
  const [urlDraft, setUrlDraft] = useState("");

  async function upload(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("bara bilder!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("max 5 mb");
      return;
    }
    const sb = supabaseBrowser();
    if (!sb) {
      setError("uppladdning är inte konfigurerad än");
      return;
    }
    setUploading(true);
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const key = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await sb.storage
      .from("hero-images")
      .upload(key, file, { upsert: false, contentType: file.type });
    if (upErr) {
      setUploading(false);
      setError("kunde inte ladda upp");
      return;
    }
    const { data } = sb.storage.from("hero-images").getPublicUrl(key);
    setUploading(false);
    onChange(data.publicUrl);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void upload(f);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void upload(f);
  }

  function commitUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    onChange(url);
    setUrlDraft("");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[14px] font-medium text-fg">en bild?</div>
          <div className="mt-0.5 text-[13px] text-muted">
            ditt ansikte, rolig katt, memes eller vad som helst.
          </div>
        </div>
      </div>

      {!value ? (
        <>
          {/* Mode toggle */}
          <div className="flex rounded-xl border border-border/15 bg-surface/40 p-1 gap-1">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={[
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all",
                mode === "upload"
                  ? "bg-surface shadow-sm text-fg"
                  : "text-muted hover:text-fg",
              ].join(" ")}
            >
              <Upload className="h-3.5 w-3.5" />
              bifoga
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={[
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all",
                mode === "url"
                  ? "bg-surface shadow-sm text-fg"
                  : "text-muted hover:text-fg",
              ].join(" ")}
            >
              <Link className="h-3.5 w-3.5" />
              länk
            </button>
          </div>

          {mode === "upload" ? (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors " +
                (dragging
                  ? "border-accent bg-accent/5"
                  : "border-border/20 bg-surface/40 hover:border-border/40 hover:bg-surface/60")
              }
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={onPick}
                className="sr-only"
              />
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted" />
              ) : (
                <Camera className="h-5 w-5 text-muted" />
              )}
              <div className="text-[14px] text-fg">
                {uploading ? "laddar upp..." : "klicka eller dra hit en bild"}
              </div>
              <div className="text-[12px] text-muted/70">
                jpg, png, gif · max 5 mb
              </div>
            </label>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitUrl();
                  }
                }}
                placeholder="https://..."
                className="flex-1 rounded-xl border border-border/15 bg-surface/60 px-3 py-2.5 text-[14px] text-fg placeholder:text-muted/50 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/10 transition-all"
              />
              <button
                type="button"
                onClick={commitUrl}
                disabled={!urlDraft.trim()}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border/15 bg-surface/60 px-4 text-[13px] text-fg transition-all hover:border-accent/40 hover:bg-accent/10 disabled:opacity-40"
              >
                lägg till
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-border/15 bg-surface/40 p-3">
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="vald bild"
              className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[13px] text-muted">
                <ImgIcon className="h-3.5 w-3.5" /> bild vald
              </div>
              <input
                value={caption}
                onChange={(e) => onCaptionChange(e.target.value)}
                maxLength={80}
                placeholder="skriv en liten bildtext (frivilligt)…"
                className="mt-2 w-full rounded-lg border border-border/15 bg-surface/60 px-3 py-1.5 text-[13px] text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="ta bort bild"
              className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-border/10 hover:text-fg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-[13px] text-accent">{error}</p>}
    </div>
  );
}
