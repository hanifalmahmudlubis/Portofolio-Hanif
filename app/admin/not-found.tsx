import Link from "next/link";
export default function AdminNotFound() {
  return (
    <div className="admin-panel">
      <p className="eyebrow mb-5">Konten tidak ditemukan</p>
      <h1 className="text-2xl font-medium">Data ini sudah tidak tersedia.</h1>
      <p className="muted my-5 text-sm leading-7">
        Konten mungkin sudah dihapus. Kembali ke ringkasan untuk mengelola
        konten lainnya.
      </p>
      <Link href="/admin/dashboard" className="button button-primary">
        Kembali ke ringkasan
      </Link>
    </div>
  );
}
