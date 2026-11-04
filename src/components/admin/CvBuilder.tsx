"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Download, Eye, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { api, errorMessage } from "@/lib/api-client";
import { formatMonth } from "@/lib/site";
import type { CvEditorData, Education, PersonalProfile } from "@/types/cv";
import { Field, Textarea, FormSection } from "./Field";
import CvPreview from "./CvPreview";
import { CV_LIMITS } from "@/lib/cv-config";

const tabs = [
  ["profile", "Profil"],
  ["education", "Pendidikan"],
  ["skills", "Keterampilan"],
  ["content", "Isi CV"],
  ["preview", "Pratinjau"],
] as const;
type Tab = (typeof tabs)[number][0];
type Pdf = { url: string; blob: Blob; revision: string };
const splitSkills = (value: string) =>
  value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function CvBuilder({ initial }: { initial: CvEditorData }) {
  const [draft, setDraft] = useState(initial);
  const [skillTexts, setSkillTexts] = useState(
    Object.fromEntries(
      initial.skillGroups.map((group) => [group.key, group.skills.join(", ")]),
    ),
  );
  const [softText, setSoftText] = useState(initial.softSkills.join(", "));
  const [active, setActive] = useState<Tab>("profile");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pdf, setPdf] = useState<Pdf | null>(null);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const busy = saving || generating;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(
    () => () => {
      if (pdf) URL.revokeObjectURL(pdf.url);
    },
    [pdf],
  );

  function changed() {
    setDirty(true);
    setPdf(null);
    setError("");
    setMessage("");
  }
  function profileValue(key: keyof PersonalProfile, value: string) {
    changed();
    setDraft((previous) => ({
      ...previous,
      profile: { ...previous.profile, [key]: value },
    }));
  }
  function educationValue(id: string, key: keyof Education, value: string) {
    changed();
    setDraft((previous) => ({
      ...previous,
      education: previous.education.map((item) =>
        item.id === id
          ? { ...item, [key]: key === "endDate" ? value || null : value }
          : item,
      ),
    }));
  }
  async function save(): Promise<boolean> {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await api<CvEditorData>("/api/admin/cv", {
        method: "PUT",
        body: JSON.stringify({
          ...draft,
          softSkills: splitSkills(softText),
          skillGroups: draft.skillGroups.map((group) => ({
            ...group,
            skills: splitSkills(skillTexts[group.key] || ""),
          })),
        }),
      });
      if (!mounted.current) return false;
      setDraft(result);
      setDirty(false);
      setPdf(null);
      setSkillTexts(
        Object.fromEntries(
          result.skillGroups.map((group) => [
            group.key,
            group.skills.join(", "),
          ]),
        ),
      );
      setSoftText(result.softSkills.join(", "));
      setMessage("Perubahan tersimpan dan tersinkron dengan portofolio");
      return true;
    } catch (error) {
      if (mounted.current) setError(errorMessage(error));
      return false;
    } finally {
      if (mounted.current) setSaving(false);
    }
  }
  async function generate(force = false): Promise<Pdf | null> {
    if (dirty && !(await save())) return null;
    setGenerating(true);
    setError("");
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    try {
      if (pdf && !dirty && !force) {
        const latest = await api<CvEditorData>("/api/admin/cv", {
          signal: abort.signal,
        });
        if (latest.revision === pdf.revision) return pdf;
        if (!mounted.current) return null;
        setDraft(latest);
        setSkillTexts(
          Object.fromEntries(
            latest.skillGroups.map((group) => [
              group.key,
              group.skills.join(", "),
            ]),
          ),
        );
        setSoftText(latest.softSkills.join(", "));
      }
      const response = await fetch("/api/admin/cv/pdf", {
        cache: "no-store",
        signal: abort.signal,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.message || "PDF belum dapat dibuat, silakan coba lagi",
        );
      }
      if (!response.headers.get("content-type")?.startsWith("application/pdf"))
        throw new Error("Format PDF tidak valid");
      const blob = await response.blob();
      if (!mounted.current || abort.signal.aborted) return null;
      const result = {
        url: URL.createObjectURL(blob),
        blob,
        revision: response.headers.get("x-cv-revision") || "",
      };
      setPdf(result);
      return result;
    } catch (error) {
      if (mounted.current && !abort.signal.aborted)
        setError(errorMessage(error));
      return null;
    } finally {
      if (mounted.current) setGenerating(false);
    }
  }
  async function preview(force = false) {
    setActive("preview");
    await generate(force);
  }
  async function download() {
    const result = await generate();
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.download = "Hanif_Almahmud_Lubis_CV.pdf";
    document.body.append(link);
    link.click();
    link.remove();
  }
  function exclude(
    key:
      "excludedProjectIds" | "excludedExperienceIds" | "excludedCertificateIds",
    id: string,
    include: boolean,
  ) {
    changed();
    setDraft((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        [key]: include
          ? previous.preferences[key].filter((value) => value !== id)
          : [...new Set([...previous.preferences[key], id])],
      },
    }));
  }

  return (
    <div className="cv-builder">
      <div className="cv-toolbar">
        <p className="muted text-sm" aria-live="polite">
          {dirty
            ? "Ada perubahan yang belum disimpan"
            : "CV mengikuti data portofolio terbaru"}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="button button-secondary"
            disabled={busy || !dirty}
            onClick={() => void save()}
          >
            <Save size={16} />
            {saving ? "Menyimpan…" : "Simpan perubahan"}
          </button>
          <button
            type="button"
            className="button button-secondary"
            disabled={busy}
            onClick={() => void preview()}
          >
            <Eye size={16} />
            {dirty ? "Simpan & pratinjau" : "Pratinjau CV"}
          </button>
          <button
            type="button"
            className="button button-primary"
            disabled={busy}
            onClick={() => void download()}
          >
            <Download size={16} />
            {generating
              ? "Membuat PDF…"
              : dirty
                ? "Simpan & unduh PDF"
                : "Unduh PDF"}
          </button>
        </div>
      </div>
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
      <nav className="cv-tabs" aria-label="Bagian pengaturan CV">
        {tabs.map(([key, label]) => (
          <button
            type="button"
            key={key}
            aria-pressed={active === key}
            disabled={busy}
            onClick={() =>
              key === "preview" ? void preview() : setActive(key)
            }
          >
            {label}
          </button>
        ))}
      </nav>
      <fieldset disabled={busy} className="min-w-0" aria-busy={busy}>
        {active === "profile" && (
          <div className="cv-editor-columns">
            <FormSection
              title="Informasi pribadi"
              description="Nama, jabatan, kontak, dan tautan juga digunakan oleh portofolio"
            >
              <Field
                label="Nama lengkap"
                value={draft.profile.fullName}
                maxLength={150}
                required
                onChange={(e) => profileValue("fullName", e.target.value)}
              />
              <Field
                label="Judul profesional"
                value={draft.profile.professionalTitle}
                maxLength={160}
                required
                onChange={(e) =>
                  profileValue("professionalTitle", e.target.value)
                }
              />
              <Field
                label="Lokasi"
                value={draft.profile.location}
                maxLength={200}
                onChange={(e) => profileValue("location", e.target.value)}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Email"
                  type="email"
                  value={draft.profile.email}
                  maxLength={254}
                  required
                  onChange={(e) => profileValue("email", e.target.value)}
                />
                <Field
                  label="Nomor telepon"
                  type="tel"
                  value={draft.profile.phone}
                  maxLength={40}
                  onChange={(e) => profileValue("phone", e.target.value)}
                  hint="Hanya ditampilkan di CV admin"
                />
              </div>
              <Field
                label="LinkedIn"
                type="url"
                value={draft.profile.linkedinUrl}
                maxLength={2048}
                onChange={(e) => profileValue("linkedinUrl", e.target.value)}
              />
              <Field
                label="GitHub"
                type="url"
                value={draft.profile.githubUrl}
                maxLength={2048}
                onChange={(e) => profileValue("githubUrl", e.target.value)}
              />
              <Field
                label="Website portofolio"
                type="url"
                value={draft.profile.portfolioUrl}
                maxLength={2048}
                onChange={(e) => profileValue("portfolioUrl", e.target.value)}
              />
            </FormSection>
            <div className="space-y-6">
              <FormSection title="Profil singkat">
                <Textarea
                  label="Intro portofolio"
                  value={draft.profile.shortBio}
                  maxLength={500}
                  rows={3}
                  required
                  onChange={(e) => profileValue("shortBio", e.target.value)}
                />
                <Textarea
                  label="Profil profesional untuk CV"
                  value={draft.profile.summary}
                  maxLength={CV_LIMITS.summary}
                  rows={10}
                  required
                  onChange={(e) => profileValue("summary", e.target.value)}
                  hint={`${draft.profile.summary.length}/${CV_LIMITS.summary} karakter · Ringkas agar CV tetap maksimal dua halaman`}
                />
              </FormSection>
              <FormSection title="Tata letak PDF">
                <label className="cv-option">
                  <input
                    type="checkbox"
                    checked={draft.preferences.includePhoto}
                    onChange={(e) => {
                      changed();
                      setDraft((previous) => ({
                        ...previous,
                        preferences: {
                          ...previous.preferences,
                          includePhoto: e.target.checked,
                        },
                      }));
                    }}
                  />
                  Sertakan foto intro
                </label>
                <Link
                  href="/admin/profile"
                  className="admin-action"
                  target="_blank"
                >
                  Ubah foto intro
                </Link>
                <p className="muted text-sm">
                  Isi mengalir otomatis hingga maksimal dua halaman
                </p>
              </FormSection>
            </div>
          </div>
        )}
        {active === "education" && (
          <FormSection
            title="Pendidikan"
            description="Urutan terbaru berada di atas. Nama institusi terbaru juga digunakan pada intro portofolio"
          >
            {draft.education.map((item, index) => (
              <div className="cv-entry" key={item.id}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium">
                    {item.institution || "Pendidikan baru"}
                  </h3>
                  <button
                    type="button"
                    className="admin-action text-red-300"
                    aria-label={`Hapus pendidikan ${index + 1}`}
                    onClick={() => {
                      changed();
                      setDraft((previous) => ({
                        ...previous,
                        education: previous.education.filter(
                          (row) => row.id !== item.id,
                        ),
                      }));
                    }}
                  >
                    <Trash2 size={15} />
                    Hapus
                  </button>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Institusi"
                    required
                    value={item.institution}
                    maxLength={200}
                    onChange={(e) =>
                      educationValue(item.id, "institution", e.target.value)
                    }
                  />
                  <Field
                    label="Gelar / jenjang"
                    required
                    value={item.degree}
                    maxLength={200}
                    onChange={(e) =>
                      educationValue(item.id, "degree", e.target.value)
                    }
                  />
                  <Field
                    label="Program studi"
                    value={item.major}
                    maxLength={200}
                    onChange={(e) =>
                      educationValue(item.id, "major", e.target.value)
                    }
                  />
                  <Field
                    label="Lokasi pendidikan"
                    value={item.location}
                    maxLength={200}
                    onChange={(e) =>
                      educationValue(item.id, "location", e.target.value)
                    }
                  />
                  <Field
                    label="Mulai pendidikan"
                    type="month"
                    required
                    value={item.startDate}
                    onChange={(e) =>
                      educationValue(item.id, "startDate", e.target.value)
                    }
                  />
                  <Field
                    label="Selesai pendidikan"
                    type="month"
                    value={item.endDate || ""}
                    onChange={(e) =>
                      educationValue(item.id, "endDate", e.target.value)
                    }
                    hint="Kosongkan jika masih berlangsung"
                  />
                  <Field
                    label="IPK / GPA"
                    value={item.gpa}
                    maxLength={40}
                    onChange={(e) =>
                      educationValue(item.id, "gpa", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="button button-secondary"
              disabled={draft.education.length >= 10}
              onClick={() => {
                changed();
                setDraft((previous) => ({
                  ...previous,
                  education: [
                    ...previous.education,
                    {
                      id: crypto.randomUUID(),
                      institution: "",
                      degree: "",
                      major: "",
                      location: "",
                      startDate: "",
                      endDate: null,
                      gpa: "",
                    },
                  ],
                }));
              }}
            >
              <Plus size={16} />
              Tambah pendidikan
            </button>
          </FormSection>
        )}
        {active === "skills" && (
          <div className="space-y-6">
            <FormSection
              title="Keterampilan teknis"
              description="Pisahkan dengan koma atau baris baru. Daftar ini digunakan bersama oleh portofolio dan CV"
            >
              <div className="grid gap-6 md:grid-cols-2">
                {draft.skillGroups.map((group) => (
                  <Textarea
                    key={group.key}
                    label={group.title}
                    rows={3}
                    maxLength={4000}
                    value={skillTexts[group.key] || ""}
                    onChange={(e) => {
                      changed();
                      setSkillTexts((previous) => ({
                        ...previous,
                        [group.key]: e.target.value,
                      }));
                    }}
                  />
                ))}
              </div>
            </FormSection>
            <div className="cv-editor-columns">
              <FormSection title="Soft skills">
                <Textarea
                  label="Daftar soft skills"
                  value={softText}
                  maxLength={3000}
                  rows={5}
                  onChange={(e) => {
                    changed();
                    setSoftText(e.target.value);
                  }}
                  hint="Pisahkan dengan koma atau baris baru"
                />
              </FormSection>
              <FormSection title="Bahasa">
                {draft.languages.map((item, index) => (
                  <div className="cv-language" key={index}>
                    <Field
                      label="Bahasa"
                      value={item.name}
                      maxLength={100}
                      required
                      onChange={(e) => {
                        changed();
                        setDraft((previous) => ({
                          ...previous,
                          languages: previous.languages.map((row, i) =>
                            i === index
                              ? { ...row, name: e.target.value }
                              : row,
                          ),
                        }));
                      }}
                    />
                    <Field
                      label="Kemampuan"
                      value={item.proficiency}
                      maxLength={100}
                      required
                      onChange={(e) => {
                        changed();
                        setDraft((previous) => ({
                          ...previous,
                          languages: previous.languages.map((row, i) =>
                            i === index
                              ? { ...row, proficiency: e.target.value }
                              : row,
                          ),
                        }));
                      }}
                    />
                    <button
                      type="button"
                      className="admin-action"
                      aria-label={`Hapus bahasa ${index + 1}`}
                      onClick={() => {
                        changed();
                        setDraft((previous) => ({
                          ...previous,
                          languages: previous.languages.filter(
                            (_, i) => i !== index,
                          ),
                        }));
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={draft.languages.length >= 20}
                  onClick={() => {
                    changed();
                    setDraft((previous) => ({
                      ...previous,
                      languages: [
                        ...previous.languages,
                        { name: "", proficiency: "" },
                      ],
                    }));
                  }}
                >
                  <Plus size={16} />
                  Tambah bahasa
                </button>
              </FormSection>
            </div>
          </div>
        )}
        {active === "content" && (
          <div className="space-y-6">
            <p className="muted text-sm">
              Pilih konten CV tanpa mengubah publikasinya di website. Proyek dan
              pengalaman memakai hingga tiga poin dari deskripsi lengkap,
              maksimal {CV_LIMITS.pointCharacters} karakter per poin. Edit poin
              CV untuk menentukan isinya sendiri
            </p>
            <FormSection title="Pengalaman">
              <Link
                className="admin-action"
                href="/admin/experience"
                target="_blank"
              >
                Kelola pengalaman
              </Link>
              {draft.sources.experiences.length ? (
                draft.sources.experiences.map((item) => (
                  <div key={item.id} className="cv-source">
                    <label className="cv-option">
                      <input
                        type="checkbox"
                        checked={
                          !draft.preferences.excludedExperienceIds.includes(
                            item.id,
                          )
                        }
                        onChange={(e) =>
                          exclude(
                            "excludedExperienceIds",
                            item.id,
                            e.target.checked,
                          )
                        }
                      />
                      <span>
                        {item.company}
                        <small>
                          {item.position} · {formatMonth(item.startDate)} –{" "}
                          {item.endDate ? formatMonth(item.endDate) : "Present"}
                        </small>
                      </span>
                    </label>
                    <Link
                      href={`/admin/experience/${item.id}`}
                      target="_blank"
                      className="admin-action"
                    >
                      Edit
                    </Link>
                  </div>
                ))
              ) : (
                <p className="muted text-sm">Belum ada pengalaman</p>
              )}
            </FormSection>
            <FormSection
              title="Proyek"
              description="CV mengambil proyek yang dipublikasikan, dengan urutan tahun terbaru"
            >
              <Link
                className="admin-action"
                href="/admin/projects"
                target="_blank"
              >
                Kelola proyek
              </Link>
              {draft.sources.projects.length ? (
                draft.sources.projects.map((item) => (
                  <div key={item.id} className="cv-source">
                    <label className="cv-option">
                      <input
                        type="checkbox"
                        checked={
                          !draft.preferences.excludedProjectIds.includes(
                            item.id,
                          )
                        }
                        onChange={(e) =>
                          exclude(
                            "excludedProjectIds",
                            item.id,
                            e.target.checked,
                          )
                        }
                      />
                      <span>
                        {item.title}
                        <small>{item.year}</small>
                      </span>
                    </label>
                    <Link
                      href={`/admin/projects/${item.id}`}
                      target="_blank"
                      className="admin-action"
                    >
                      Edit
                    </Link>
                  </div>
                ))
              ) : (
                <p className="muted text-sm">
                  Belum ada proyek yang dipublikasikan
                </p>
              )}
            </FormSection>
            <FormSection title="Sertifikat">
              <Link
                className="admin-action"
                href="/admin/certificate"
                target="_blank"
              >
                Kelola sertifikat
              </Link>
              {draft.sources.certificates.length ? (
                draft.sources.certificates.map((item) => (
                  <div key={item.id} className="cv-source">
                    <label className="cv-option">
                      <input
                        type="checkbox"
                        checked={
                          !draft.preferences.excludedCertificateIds.includes(
                            item.id,
                          )
                        }
                        onChange={(e) =>
                          exclude(
                            "excludedCertificateIds",
                            item.id,
                            e.target.checked,
                          )
                        }
                      />
                      <span>
                        {item.title}
                        <small>{item.year}</small>
                      </span>
                    </label>
                    <Link
                      href={`/admin/certificate/${item.id}`}
                      target="_blank"
                      className="admin-action"
                    >
                      Edit
                    </Link>
                  </div>
                ))
              ) : (
                <p className="muted text-sm">Belum ada sertifikat</p>
              )}
            </FormSection>
          </div>
        )}
        {active === "preview" && (
          <section
            className="admin-panel cv-preview"
            aria-label="Pratinjau dokumen CV"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium">Pratinjau PDF</h2>
                <p className="muted mt-2 text-sm">
                  A4 · Maksimal dua halaman · Pratinjau sesuai unduhan
                </p>
              </div>
              <button
                type="button"
                className="button button-secondary"
                disabled={busy}
                onClick={() => void preview(true)}
              >
                <RefreshCw size={15} />
                Perbarui pratinjau
              </button>
            </div>
            {generating && (
              <p role="status" className="cv-preview-empty">
                Menyiapkan dokumen CV…
              </p>
            )}
            {!generating && pdf && (
              <>
                <a
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-action mt-5"
                >
                  Buka PDF di tab baru
                </a>
                <CvPreview key={pdf.url} blob={pdf.blob} />
              </>
            )}
            {!generating && !pdf && (
              <p className="cv-preview-empty muted">
                Gunakan Perbarui pratinjau untuk membuat dokumen
              </p>
            )}
          </section>
        )}
      </fieldset>
    </div>
  );
}
