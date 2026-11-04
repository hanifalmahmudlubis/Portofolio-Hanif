"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function SessionReset() {
  const { data: session, status } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function reset() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/reset-session", {
        method: "POST",
        headers: { "X-Session-Reset": "1" },
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error("Sesi belum dapat dihapus, silakan coba lagi");
      // Native sign-out broadcasts a distinct logout event. A passive session read
      // can duplicate another read's same-second message and miss the other tabs.
      await signOut({ redirect: false }).catch(() => null);
      window.location.replace("/admin/login?reason=reset");
    } catch {
      setError("Sesi belum dapat dihapus, periksa koneksi lalu coba lagi");
      setBusy(false);
    }
  }

  const state =
    status === "loading"
      ? "Memeriksa sesi"
      : session?.error
        ? "Sesi telah berakhir"
        : session?.user
          ? "Sesi aktif"
          : "Tidak ada sesi aktif";

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-[440px]">
        <Link href="/" className="brand">
          Hanif
        </Link>
        <div className="admin-panel mt-8 !p-7 sm:!p-8">
          <h1 className="text-2xl font-medium tracking-tight">Sesi browser</h1>
          <p className="muted mt-3 text-sm leading-6">
            Hapus sesi tersimpan pada browser ini untuk mencoba login kembali
          </p>
          <div className="my-6 rounded-lg border border-border bg-black/15 p-4">
            <p className="text-sm font-medium">{state}</p>
            <p className="muted mt-2 text-sm leading-6">
              Cookie login akan dibersihkan tanpa mengubah akun atau password
            </p>
          </div>
          {error && (
            <p role="alert" className="notice notice-error mb-5">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            className="button button-primary w-full"
          >
            {busy ? "Menghapus sesi…" : "Hapus sesi browser ini"}
          </button>
        </div>
        <Link
          href="/admin/login"
          className="muted mt-6 inline-block text-sm hover:text-primary"
        >
          Kembali ke login
        </Link>
      </div>
    </main>
  );
}
