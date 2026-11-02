"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { Certificate } from "@/types/project";
import { api, errorMessage } from "@/lib/api-client";
import { Field, FormSection } from "./Field";
export default function CertificateForm({
  certificate,
}: {
  certificate?: Certificate;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api(
        certificate ? `/api/certificate/${certificate.id}` : "/api/certificate",
        { method: certificate ? "PUT" : "POST", body: JSON.stringify(data) },
      );
      router.push("/admin/certificate?saved=1");
      router.refresh();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}
      <fieldset disabled={busy}>
        <FormSection
          title="Informasi sertifikat"
          description="Tampilkan pencapaian dan sertifikasi yang mendukung keahlian Anda."
        >
          <Field
            label="Judul sertifikat"
            name="title"
            required
            maxLength={200}
            defaultValue={certificate?.title}
            placeholder="Cloud Practitioner Essentials"
          />
          <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
            <Field
              label="Penerbit"
              name="issuer"
              required
              maxLength={200}
              defaultValue={certificate?.issuer}
              placeholder="Dicoding Indonesia"
            />
            <Field
              label="Tahun"
              name="year"
              type="number"
              required
              min={1990}
              max={2100}
              defaultValue={certificate?.year || new Date().getFullYear()}
            />
          </div>
          <Field
            label="URL kredensial"
            name="credentialUrl"
            type="url"
            maxLength={2048}
            defaultValue={certificate?.credentialUrl || ""}
            placeholder="https://…"
            hint="Opsional. Tautan untuk memverifikasi sertifikat."
          />
        </FormSection>
      </fieldset>
      <div className="flex justify-end gap-3">
        <Link href="/admin/certificate" className="button button-secondary">
          Batal
        </Link>
        <button disabled={busy} className="button button-primary">
          <Save size={16} />
          {busy ? "Menyimpan…" : "Simpan sertifikat"}
        </button>
      </div>
    </form>
  );
}
