"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
export default function LoginForm() {
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
          "Email atau password tidak sesuai, atau terlalu banyak percobaan. Silakan coba lagi.",
        );
        setBusy(false);
        return;
      }
      // A fresh navigation avoids reusing a prefetched unauthenticated RSC response.
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
            <button disabled={busy} className="button button-primary w-full">
              {busy ? "Memeriksa akun…" : "Masuk"}
            </button>
          </form>
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
