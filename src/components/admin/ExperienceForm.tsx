"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";
import type { Experience } from "@/types/project";
import { api, errorMessage } from "@/lib/api-client";
import { toMonthInput } from "@/lib/site";
import { Field, Textarea, FormSection } from "./Field";
export default function ExperienceForm({
  experience,
}: {
  experience?: Experience;
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
        experience ? `/api/experience/${experience.id}` : "/api/experience",
        {
          method: experience ? "PUT" : "POST",
          body: JSON.stringify({
            ...data,
            images: String(data.images || "")
              .split("\n")
              .map((url) => url.trim())
              .filter(Boolean),
          }),
        },
      );
      router.push("/admin/experience?saved=1");
      router.refresh();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      {error && (
        <p role="alert" className="notice notice-error">
          {error}
        </p>
      )}
      <fieldset disabled={busy} className="space-y-6">
        <FormSection
          title="Detail pengalaman"
          description="Perubahan akan tampil pada bagian perjalanan profesional di portofolio."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Posisi / jabatan"
              name="position"
              required
              maxLength={200}
              defaultValue={experience?.position}
              placeholder="Web Development Intern"
            />
            <Field
              label="Perusahaan / organisasi"
              name="company"
              required
              maxLength={200}
              defaultValue={experience?.company}
            />
          </div>
          <Field
            label="Lokasi"
            name="location"
            maxLength={200}
            defaultValue={experience?.location || ""}
            placeholder="Medan, Indonesia"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Mulai"
              name="startDate"
              type="month"
              required
              defaultValue={toMonthInput(experience?.startDate || null)}
            />
            <Field
              label="Selesai"
              name="endDate"
              type="month"
              defaultValue={toMonthInput(experience?.endDate || null)}
              hint="Kosongkan jika masih berlangsung."
            />
          </div>
          <Textarea
            label="Deskripsi & kontribusi"
            name="description"
            required
            maxLength={10000}
            rows={6}
            defaultValue={experience?.description}
          />
        </FormSection>
        <FormSection title="Dokumentasi">
          <Textarea
            label="URL gambar"
            name="images"
            rows={4}
            defaultValue={experience?.images
              .map((image) => image.url)
              .join("\n")}
            placeholder="https://example.com/photo.jpg"
            hint="Satu URL http/https per baris, maksimal 12 gambar. Kosongkan untuk menghapus dokumentasi."
          />
        </FormSection>
      </fieldset>
      <div className="flex justify-end gap-3">
        <Link href="/admin/experience" className="button button-secondary">
          Batal
        </Link>
        <button disabled={busy} className="button button-primary">
          <Save size={16} />
          {busy ? "Menyimpan…" : "Simpan pengalaman"}
        </button>
      </div>
    </form>
  );
}
