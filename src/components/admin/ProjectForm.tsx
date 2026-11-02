"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Save, Plus, Check } from "lucide-react";
import type { Project, ProjectImage, Technology } from "@/types/project";
import { api, errorMessage, RequestError } from "@/lib/api-client";
import { imageUrl } from "@/lib/urls";
import { MAX_IMAGE_SIZE, MAX_UPLOAD_COUNT } from "@/lib/upload-config";
import { Field, Textarea, FormSection } from "./Field";
import DeleteButton from "./DeleteButton";
export default function ProjectForm({
  project,
  technologies: initialTechnologies,
}: {
  project?: Project;
  technologies: Technology[];
}) {
  const router = useRouter();
  const [savedId, setSavedId] = useState(project?.id);
  const [slug, setSlug] = useState(project?.slug || "");
  const [slugEdited, setSlugEdited] = useState(!!project);
  const [images, setImages] = useState<ProjectImage[]>(project?.images || []);
  const [technologies, setTechnologies] = useState(initialTechnologies);
  const [selected, setSelected] = useState(
    project?.technologies.map((item) => item.technology.id) || [],
  );
  const [busy, setBusy] = useState(false);
  const [addingTech, setAddingTech] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("");
  const [techName, setTechName] = useState("");
  const [techCategory, setTechCategory] = useState("Framework");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const filesRef = useRef<HTMLInputElement>(null);
  const [imageBusy, setImageBusy] = useState(false);
  async function addTechnology() {
    if (!techName.trim()) return;
    setAddingTech(true);
    setError("");
    try {
      const item = await api<Technology>("/api/technologies", {
        method: "POST",
        body: JSON.stringify({ name: techName, category: techCategory }),
      });
      setTechnologies((previous) =>
        previous.some((technology) => technology.id === item.id)
          ? previous
          : [...previous, item],
      );
      setSelected((previous) => [...new Set([...previous, item.id])]);
      setTechName("");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setAddingTech(false);
    }
  }
  async function cover(imageId: string) {
    if (!savedId) return;
    setImageBusy(true);
    setError("");
    try {
      await api(`/api/projects/${savedId}/images`, {
        method: "PATCH",
        body: JSON.stringify({ imageId }),
      });
      setImages((previous) =>
        previous.map((image) => ({
          ...image,
          isThumbnail: image.id === imageId,
        })),
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setImageBusy(false);
    }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      pendingFiles.length > MAX_UPLOAD_COUNT ||
      pendingFiles.some((file) => !file.size || file.size > MAX_IMAGE_SIZE)
    ) {
      setError(
        "Pilih maksimal 8 gambar, masing-masing maksimal 4 MB dan tidak kosong.",
      );
      return;
    }
    setBusy(true);
    setError("");
    setPhase("Menyimpan proyek…");
    const form = new FormData(event.currentTarget);
    const payload = {
      ...Object.fromEntries(form),
      year: Number(form.get("year")),
      displayOrder: Number(form.get("displayOrder")),
      published: form.has("published"),
      featured: form.has("featured"),
      technologyIds: selected,
    };
    try {
      const result = await api<Project>(
        savedId ? `/api/projects/${savedId}` : "/api/projects",
        { method: savedId ? "PUT" : "POST", body: JSON.stringify(payload) },
      );
      setSavedId(result.id);
      const files = [...pendingFiles];
      if (files.length) {
        try {
          for (const [index, file] of files.entries()) {
            setPhase(`Mengunggah gambar ${index + 1}/${files.length}…`);
            const upload = new FormData();
            upload.append("images", file);
            const uploaded = await api<ProjectImage[]>(
              `/api/projects/${result.id}/images`,
              { method: "POST", body: upload },
            );
            setImages((previous) => [...previous, ...uploaded]);
            setPendingFiles((previous) =>
              previous.filter((item) => item !== file),
            );
            if (filesRef.current) filesRef.current.value = "";
          }
        } catch (error) {
          throw new Error(
            `Proyek sudah tersimpan, tetapi gambar belum berhasil diunggah. ${errorMessage(error)} Klik simpan untuk mencoba lagi; proyek tidak akan diduplikasi.`,
          );
        }
      }
      router.push("/admin/projects?saved=1");
      router.refresh();
    } catch (error) {
      setError(
        errorMessage(error) +
          (error instanceof RequestError && error.fields
            ? " " + Object.values(error.fields).join(" ")
            : ""),
      );
    } finally {
      setBusy(false);
      setPhase("");
    }
  }
  return (
    <form onSubmit={submit}>
      {error && (
        <div role="alert" className="notice notice-error mb-6">
          {error}
        </div>
      )}
      <fieldset
        disabled={busy || imageBusy}
        className="grid min-w-0 gap-6 xl:grid-cols-[1fr_310px]"
      >
        <div className="min-w-0 space-y-6">
          <FormSection
            title="Informasi proyek"
            description="Beri konteks singkat tentang karya Anda. Kolom bertanda * wajib diisi."
          >
            <Field
              label="Judul proyek"
              name="title"
              required
              maxLength={200}
              defaultValue={project?.title}
              placeholder="Contoh: Clinic Management App"
              onChange={(event) => {
                if (!slugEdited)
                  setSlug(
                    event.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  );
              }}
            />
            <Field
              label="Slug"
              name="slug"
              required
              maxLength={180}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugEdited(true);
              }}
              hint={`Alamat publik: /projects/${slug || "nama-proyek"}`}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Kategori"
                name="category"
                required
                maxLength={100}
                list="project-categories"
                defaultValue={project?.category}
                placeholder="Web Development"
              />
              <datalist id="project-categories">
                <option>Web Development</option>
                <option>Mobile Development</option>
                <option>Machine Learning</option>
                <option>Automation</option>
              </datalist>
              <Field
                label="Jenis proyek"
                name="projectType"
                required
                maxLength={100}
                defaultValue={project?.projectType}
                placeholder="Academic Project / Personal Project"
              />
            </div>
            <Textarea
              label="Ringkasan"
              name="shortDescription"
              required
              maxLength={500}
              rows={3}
              defaultValue={project?.shortDescription}
              hint="Tampil pada kartu proyek. Maksimal 500 karakter."
            />
          </FormSection>
          <FormSection title="Cerita di balik proyek">
            <Textarea
              label="Deskripsi lengkap"
              name="fullDescription"
              required
              maxLength={20000}
              rows={6}
              defaultValue={project?.fullDescription}
            />
            <Textarea
              label="Masalah yang diselesaikan"
              name="problem"
              maxLength={10000}
              rows={3}
              defaultValue={project?.problem || ""}
            />
            <Textarea
              label="Solusi & pendekatan"
              name="solution"
              maxLength={10000}
              rows={3}
              defaultValue={project?.solution || ""}
            />
          </FormSection>
          <FormSection
            title="Galeri proyek"
            description="Gunakan tangkapan layar yang paling mewakili proyek. Gambar sampul muncul di daftar publik."
          >
            {!!images.length && (
              <div className="grid gap-4 sm:grid-cols-2">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-lg border border-[#263146]"
                  >
                    <div className="relative aspect-video bg-[#07090e]">
                      {imageUrl(image.imageUrl) && (
                        <Image
                          src={imageUrl(image.imageUrl)!}
                          alt="Screenshot proyek"
                          fill
                          sizes="300px"
                          className="object-contain"
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                      <button
                        type="button"
                        onClick={() => cover(image.id)}
                        disabled={image.isThumbnail}
                        className="admin-action"
                      >
                        {image.isThumbnail && <Check size={12} />}
                        {image.isThumbnail ? "Sampul" : "Jadikan sampul"}
                      </button>
                      <DeleteButton
                        endpoint={`/api/projects/${savedId}/images?imageId=${image.id}`}
                        title="gambar proyek"
                        iconOnly
                        onDeleted={() =>
                          setImages((previous) => {
                            const remaining = previous.filter(
                              (item) => item.id !== image.id,
                            );
                            return image.isThumbnail
                              ? remaining.map((item, index) => ({
                                  ...item,
                                  isThumbnail: index === 0,
                                }))
                              : remaining;
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <label className="field rounded-lg border border-dashed border-[#3b5590] bg-[#090d16] p-6">
              <span className="mb-2 flex items-center gap-3 text-sm text-[#91a6df]">
                <ImagePlus size={20} />
                Tambahkan gambar
              </span>
              <input
                ref={filesRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(event) =>
                  setPendingFiles(Array.from(event.target.files || []))
                }
              />
              <small>
                Pilih hingga 8 gambar sekaligus, maksimal 4 MB/gambar (PNG,
                JPEG, WebP, GIF)
              </small>
              <small>Galeri proyek berganti otomatis setiap 5 detik</small>
              {pendingFiles.length > 0 && (
                <span className="text-xs text-[#91a6df]">
                  {pendingFiles.length} gambar menunggu unggahan saat proyek
                  disimpan.
                </span>
              )}
            </label>
          </FormSection>
        </div>
        <div className="space-y-6">
          <FormSection title="Publikasi">
            <label className="flex items-start gap-3 text-sm">
              <input
                className="mt-1 accent-[#91a6df]"
                type="checkbox"
                name="published"
                defaultChecked={project?.published}
              />
              <span>
                Publikasikan proyek
                <small className="muted mt-1 block text-[13px] leading-5">
                  Nonaktifkan untuk menyimpan sebagai draft.
                </small>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                className="mt-1 accent-[#91a6df]"
                type="checkbox"
                name="featured"
                defaultChecked={project?.featured}
              />
              <span>
                Proyek unggulan
                <small className="muted mt-1 block text-[13px] leading-5">
                  Tandai karya pilihan Anda.
                </small>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Tahun"
                name="year"
                type="number"
                min={1990}
                max={2100}
                required
                defaultValue={project?.year || new Date().getFullYear()}
              />
              <Field
                label="Urutan"
                name="displayOrder"
                type="number"
                min={0}
                max={10000}
                required
                defaultValue={project?.displayOrder || 0}
              />
            </div>
          </FormSection>
          <FormSection
            title="Teknologi"
            description="Teknologi terhubung dengan proyek dan toolkit publik."
          >
            <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto">
              {technologies.map((technology) => (
                <label
                  key={technology.id}
                  className={`flex cursor-pointer items-center gap-2 rounded border px-2 py-1.5 text-[13px] ${selected.includes(technology.id) ? "border-[#56709b] bg-[#91a6df]/10 text-[#91a6df]" : "border-[#263146] text-[#9ba6ba]"}`}
                >
                  <input
                    type="checkbox"
                    className="accent-[#91a6df]"
                    checked={selected.includes(technology.id)}
                    onChange={(event) =>
                      setSelected((previous) =>
                        event.target.checked
                          ? [...previous, technology.id]
                          : previous.filter((id) => id !== technology.id),
                      )
                    }
                  />
                  {technology.name}
                </label>
              ))}
            </div>
            <div className="space-y-3 border-t border-[#263146] pt-4">
              <Field
                label="Teknologi baru"
                placeholder="Contoh: React"
                maxLength={60}
                value={techName}
                onChange={(event) => setTechName(event.target.value)}
              />
              <Field
                label="Kategori teknologi"
                value={techCategory}
                onChange={(event) => setTechCategory(event.target.value)}
                maxLength={80}
              />
              <button
                type="button"
                onClick={addTechnology}
                disabled={
                  addingTech || !techName.trim() || !techCategory.trim()
                }
                className="admin-action"
              >
                <Plus size={13} />
                {addingTech ? "Menambah…" : "Tambah teknologi"}
              </button>
            </div>
          </FormSection>
          <FormSection title="Tautan">
            <Field
              label="Repository GitHub"
              name="githubUrl"
              type="url"
              maxLength={2048}
              placeholder="https://github.com/…"
              defaultValue={project?.githubUrl || ""}
              hint="Kosongkan untuk menggunakan tautan profil GitHub."
            />
            <Field
              label="Live demo"
              name="liveDemoUrl"
              type="url"
              maxLength={2048}
              placeholder="https://…"
              defaultValue={project?.liveDemoUrl || ""}
            />
          </FormSection>
        </div>
      </fieldset>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#263146] bg-[#10151f] p-5">
        <p className="muted text-xs">
          {phase || "Perubahan akan diterapkan setelah disimpan."}
        </p>
        <div className="flex gap-3">
          <Link href="/admin/projects" className="button button-secondary">
            Kembali
          </Link>
          <button
            disabled={busy || addingTech || imageBusy}
            className="button button-primary"
          >
            <Save size={16} />
            {busy ? "Menyimpan…" : "Simpan proyek"}
          </button>
        </div>
      </div>
    </form>
  );
}
