export default function Loading() {
  return (
    <div
      className="container py-24"
      role="status"
      aria-label="Loading portfolio"
    >
      <div className="skeleton mb-8 h-4 w-40" />
      <div className="skeleton mb-4 h-20 w-3/4" />
      <div className="skeleton h-20 w-1/2" />
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="skeleton aspect-video" />
        <div className="skeleton aspect-video" />
      </div>
      <span className="sr-only">Loading portfolio…</span>
    </div>
  );
}
