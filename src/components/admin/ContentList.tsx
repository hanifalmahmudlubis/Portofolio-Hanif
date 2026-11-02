"use client";
import Link from "next/link";
import { useState } from "react";
import { Pencil, Search, FolderOpen, ArrowUpRight } from "lucide-react";
import DeleteButton from "./DeleteButton";
type Item = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  published?: boolean;
  featured?: boolean;
  publicHref?: string;
};
export default function ContentList({
  items,
  kind,
  emptyLabel,
}: {
  items: Item[];
  kind: "projects" | "experience" | "certificate";
  emptyLabel: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleted, setDeleted] = useState<string[]>([]);
  const visible = items.filter(
    (item) =>
      !deleted.includes(item.id) &&
      `${item.title} ${item.subtitle}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" || item.published === (filter === "published")),
  );
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <label className="relative w-full max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-3.5 text-[#8997ae]"
          />
          <input
            aria-label="Cari konten"
            className="input !pl-10"
            placeholder="Cari judul atau kategori…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {kind === "projects" && (
          <select
            aria-label="Filter status"
            className="input !w-auto"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">Semua status</option>
            <option value="published">Dipublikasikan</option>
            <option value="draft">Draft</option>
          </select>
        )}
      </div>
      <div className="overflow-x-auto rounded-xl border border-[#212a39]">
        <table className="admin-table min-w-[680px]">
          <thead>
            <tr>
              <th>Konten</th>
              <th>{kind === "projects" ? "Tahun" : "Periode"}</th>
              {kind === "projects" && <th>Status</th>}
              <th className="!text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link
                    href={`/admin/${kind}/${item.id}`}
                    className="font-medium hover:text-[#91a6df]"
                  >
                    {item.title}
                  </Link>
                  <p className="muted mt-2 text-[13px]">
                    {item.subtitle}
                    {item.featured && (
                      <span className="ml-2 text-[#91a6df]">· Unggulan</span>
                    )}
                  </p>
                </td>
                <td className="whitespace-nowrap font-mono text-xs text-[#b0b9c9]">
                  {item.meta}
                </td>
                {kind === "projects" && (
                  <td>
                    <span
                      className={`status ${item.published ? "" : "status-draft"}`}
                    >
                      <span className="h-1 w-1 rounded-full bg-current" />
                      {item.published ? "Dipublikasikan" : "Draft"}
                    </span>
                  </td>
                )}
                <td>
                  <div className="flex justify-end gap-2">
                    {item.publicHref && (
                      <Link
                        href={item.publicHref}
                        target="_blank"
                        className="admin-action"
                        aria-label={`Lihat ${item.title}`}
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    )}
                    <Link
                      href={`/admin/${kind}/${item.id}`}
                      className="admin-action"
                    >
                      <Pencil size={13} />
                      Edit
                    </Link>
                    <DeleteButton
                      endpoint={`/api/${kind}/${item.id}`}
                      title={item.title}
                      onDeleted={() =>
                        setDeleted((previous) => [...previous, item.id])
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && (
          <div className="p-12 text-center">
            <FolderOpen className="mx-auto mb-4 text-[#8794ac]" size={30} />
            <p className="muted text-sm">
              {query || filter !== "all"
                ? "Tidak ada hasil yang cocok."
                : emptyLabel}
            </p>
            {(query || filter !== "all") && (
              <button
                className="mt-4 text-xs text-[#91a6df]"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Reset filter
              </button>
            )}
          </div>
        )}
      </div>
      <p className="muted mt-4 text-[13px]" aria-live="polite">
        {visible.length} konten ditampilkan
      </p>
    </div>
  );
}
