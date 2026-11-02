"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { api, errorMessage } from "@/lib/api-client";
export default function DeleteButton({
  endpoint,
  title,
  onDeleted,
  iconOnly = false,
}: {
  endpoint: string;
  title: string;
  onDeleted?: () => void;
  iconOnly?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function remove() {
    setBusy(true);
    setError("");
    try {
      await api(endpoint, { method: "DELETE" });
      dialog.current?.close();
      onDeleted?.();
      router.refresh();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          dialog.current?.showModal();
        }}
        className="admin-action admin-danger"
        aria-label={`Hapus ${title}`}
      >
        <Trash2 size={14} />
        {!iconOnly && "Hapus"}
      </button>
      <dialog
        ref={dialog}
        aria-label={`Hapus ${title}?`}
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <div className="mb-5 inline-flex rounded-lg bg-[#ffada3]/10 p-3 text-[#ffada3]">
          <Trash2 size={24} />
        </div>
        <h2 className="text-xl font-medium">Hapus konten ini?</h2>
        <p className="muted mt-3 break-words text-sm leading-7">
          “{title}” akan dihapus beserta relasinya. Tindakan ini tidak dapat
          dibatalkan.
        </p>
        {error && (
          <p role="alert" className="notice notice-error mt-4">
            {error}
          </p>
        )}
        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => dialog.current?.close()}
            className="button button-secondary"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            className="button !bg-[#efa99c] !text-[#391b15]"
          >
            {busy ? "Menghapus…" : "Ya, hapus"}
          </button>
        </div>
      </dialog>
    </>
  );
}
