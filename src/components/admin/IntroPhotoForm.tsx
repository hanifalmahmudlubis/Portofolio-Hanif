"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Upload } from "lucide-react";
import { api, errorMessage } from "@/lib/api-client";
import { MAX_IMAGE_SIZE } from "@/lib/upload-config";
import { DEFAULT_INTRO_IMAGE } from "@/lib/site";

export default function IntroPhotoForm({ initialUrl }: { initialUrl: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [selection, setSelection] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(
    () => () => {
      if (selection) URL.revokeObjectURL(selection.url);
    },
    [selection],
  );

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selection) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const body = new FormData();
      body.append("images", selection.file);
      const result = await api<{ introImageUrl: string }>(
        "/api/admin/profile",
        { method: "POST", body },
      );
      setCurrentUrl(result.introImageUrl);
      setSelection(null);
      if (input.current) input.current.value = "";
      setMessage("Foto intro berhasil diperbarui");
      router.refresh();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api<{ introImageUrl: string }>(
        "/api/admin/profile",
        { method: "DELETE" },
      );
      setCurrentUrl(result.introImageUrl);
      setSelection(null);
      if (input.current) input.current.value = "";
      setMessage("Foto awal digunakan kembali");
      router.refresh();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="admin-panel max-w-4xl">
      <fieldset
        disabled={busy}
        className="grid min-w-0 gap-8 md:grid-cols-[280px_1fr]"
      >
        <div className="relative aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-xl border border-border bg-background">
          <Image
            src={selection?.url || currentUrl}
            alt={selection ? "Pratinjau foto intro" : "Foto intro saat ini"}
            fill
            unoptimized
            sizes="320px"
            className="object-cover object-[center_25%]"
          />
        </div>
        <div className="min-w-0 space-y-6 self-center">
          <label className="field">
            <span className="flex items-center gap-2">
              <Upload size={18} /> Pilih foto intro
            </span>
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setError("");
                setMessage("");
                if (!file) {
                  setSelection(null);
                  return;
                }
                if (!file.size || file.size > MAX_IMAGE_SIZE) {
                  setError("Pilih gambar maksimal 4 MB dan tidak kosong");
                  event.target.value = "";
                  setSelection(null);
                  return;
                }
                setSelection({ file, url: URL.createObjectURL(file) });
              }}
            />
            <small>
              PNG, JPEG, WebP, GIF · Maksimal 4 MB · Foto vertikal disarankan
            </small>
          </label>
          {selection && (
            <p className="muted break-all text-sm">{selection.file.name}</p>
          )}
          {error && (
            <p role="alert" className="notice notice-error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="notice">
              {message}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              disabled={!selection || busy}
              className="button button-primary"
            >
              <Save size={17} />
              {busy ? "Menyimpan…" : "Simpan foto intro"}
            </button>
            <button
              type="button"
              disabled={busy || currentUrl === DEFAULT_INTRO_IMAGE}
              onClick={reset}
              className="button button-secondary"
            >
              Gunakan foto awal
            </button>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
