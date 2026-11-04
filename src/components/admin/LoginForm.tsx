"use client";
import { useState } from "react";
import { getSession, signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
export default function LoginForm({
  expired = false,
  reset = false,
}: {
  expired?: boolean;
  reset?: boolean;
}) {
  const { status } = useSession();
  const preparingSession = status === "loading";
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || preparingSession) return;
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await signIn("credentials", {
        email: data.get("email"),
        password: data.get("password"),
        redirect: false,
        callbackUrl: "/admin/dashboard",
      });
      if (response?.error || !response?.ok) {
        setError(
          response?.error === "LoginRateLimited"
            ? "Terlalu banyak percobaan login, tunggu 15 menit lalu coba lagi"
            : response?.error === "CredentialsSignin"
              ? "Email atau password tidak sesuai"
              : "Login belum berhasil, silakan coba lagi atau hapus sesi browser",
        );
        setBusy(false);
        return;
      }
      const session = await getSession();
      if (
        !session?.user?.id ||
        session.user.role !== "ADMIN" ||
        session.error
      ) {
        setError("Sesi belum dapat dibuat, hapus sesi browser lalu coba lagi");
        setBusy(false);
        return;
      }
      // A fresh navigation avoids reusing a prefetched unauthenticated RSC response.
      // Always use this site's fixed path, even if the configured callback origin differs.
      window.location.replace("/admin/dashboard");
    } catch {
      setError("Tidak dapat terhubung. Silakan coba lagi.");
      setBusy(false);
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="brand">
          Hanif
        </Link>
        <div className="admin-panel mt-8 !p-7 sm:!p-8">
          <h1 className="text-2xl font-medium tracking-tight">Admin</h1>
          <p className="muted mb-7 mt-2 text-sm">
            Masuk untuk mengelola portofolio.
          </p>
          {(expired || reset) && (
            <p role="status" className="notice mb-5">
              {reset
                ? "Sesi browser telah dihapus, silakan login kembali"
                : "Sesi telah berakhir, silakan login kembali"}
            </p>
          )}
          <form onSubmit={submit} className="space-y-5">
            <label className="field">
              Email admin
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                maxLength={254}
                placeholder="Email"
              />
            </label>
            <label className="field">
              Password
              <div className="relative">
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  maxLength={72}
                  className="!pr-12"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={
                    show ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="absolute right-3 top-3.5 text-[#8997ae]"
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            {error && (
              <p role="alert" className="notice notice-error">
                {error}
              </p>
            )}
            <button
              disabled={busy || preparingSession}
              className="button button-primary w-full"
            >
              {preparingSession
                ? "Menyiapkan sesi…"
                : busy
                  ? "Memeriksa akun…"
                  : "Masuk"}
            </button>
          </form>
          <Link
            href="/admin/session"
            className="muted mt-5 inline-block text-sm underline-offset-4 hover:text-primary hover:underline"
          >
            Hapus sesi browser
          </Link>
        </div>
        <Link
          href="/"
          className="muted mt-6 inline-block text-xs hover:text-primary"
        >
          Kembali ke portofolio
        </Link>
      </div>
    </main>
  );
}
