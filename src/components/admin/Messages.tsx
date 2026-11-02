"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen, Reply } from "lucide-react";
import type { ContactMessage } from "@/types/project";
import { api, errorMessage } from "@/lib/api-client";
import DeleteButton from "./DeleteButton";
export default function Messages({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const visible = messages
    .map((message) => ({
      ...message,
      isRead: overrides[message.id] ?? message.isRead,
    }))
    .filter(
      (message) =>
        !deleted.includes(message.id) &&
        (filter !== "unread" || !message.isRead),
    );
  async function toggle(message: ContactMessage) {
    setPending(message.id);
    setError("");
    try {
      await api(`/api/admin/messages/${message.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isRead: !message.isRead }),
      });
      setOverrides((previous) => ({
        ...previous,
        [message.id]: !message.isRead,
      }));
      router.refresh();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(null);
    }
  }
  return (
    <div>
      {error && (
        <p className="notice notice-error mb-5" role="alert">
          {error}
        </p>
      )}
      <div className="mb-6 flex gap-3">
        {[
          ["all", "Semua pesan"],
          ["unread", "Belum dibaca"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`button ${filter === value ? "button-primary" : "button-secondary"}`}
            aria-pressed={filter === value}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {visible.map((message) => (
          <article key={message.id} className="admin-panel">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex items-start gap-4">
                <span
                  className={`rounded-lg p-3 ${message.isRead ? "bg-[#172030] text-[#8997ae]" : "bg-[#91a6df]/10 text-[#91a6df]"}`}
                >
                  {message.isRead ? <MailOpen size={19} /> : <Mail size={19} />}
                </span>
                <div>
                  <h2 className="text-base font-medium">{message.subject}</h2>
                  <p className="muted mt-2 text-xs">
                    {message.name} ·{" "}
                    <a
                      className="break-all text-[#91a6df]"
                      href={`mailto:${message.email}`}
                    >
                      {message.email}
                    </a>
                  </p>
                </div>
              </div>
              <span className="font-mono text-[12px] text-[#8997ae]">
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeZone: "Asia/Jakarta",
                }).format(new Date(message.createdAt))}
              </span>
            </div>
            <p className="my-6 whitespace-pre-wrap break-words text-sm leading-7 text-[#b9c3d5]">
              {message.message}
            </p>
            <div className="flex flex-wrap justify-between gap-4 border-t border-[#212a39] pt-5">
              <a
                href={`mailto:${message.email}?subject=${encodeURIComponent("Re: " + message.subject)}`}
                className="admin-action"
              >
                <Reply size={14} />
                Balas melalui email
              </a>
              <div className="flex gap-2">
                <button
                  className="admin-action"
                  disabled={pending === message.id}
                  onClick={() => toggle(message)}
                >
                  {pending === message.id
                    ? "Menyimpan…"
                    : message.isRead
                      ? "Tandai belum dibaca"
                      : "Tandai dibaca"}
                </button>
                <DeleteButton
                  endpoint={`/api/admin/messages/${message.id}`}
                  title={message.subject}
                  onDeleted={() =>
                    setDeleted((previous) => [...previous, message.id])
                  }
                />
              </div>
            </div>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <Mail className="mx-auto mb-5" size={30} />
          <p>
            {filter === "unread"
              ? "Semua pesan sudah dibaca."
              : "Pesan dari formulir kontak akan muncul di sini."}
          </p>
        </div>
      )}
    </div>
  );
}
