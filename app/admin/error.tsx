"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="admin-panel">
      <h1 className="text-2xl">Data belum dapat dimuat</h1>
      <p className="muted my-5 text-sm">
        Periksa koneksi database, lalu coba lagi. Perubahan yang belum disimpan
        tidak dikirim.
      </p>
      <button onClick={reset} className="button button-primary">
        Coba lagi
      </button>
    </div>
  );
}
