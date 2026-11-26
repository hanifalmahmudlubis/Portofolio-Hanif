export default function Loading() {
  return (
    <div
      className="container py-20"
      role="status"
      aria-label="Loading portfolio"
    >
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="skeleton mb-8 h-3 w-32" />
          <div className="skeleton mb-4 h-20 w-11/12" />
          <div className="skeleton mb-10 h-20 w-3/4" />
          <div className="skeleton mb-3 h-4 w-2/3" />
          <div className="skeleton h-4 w-1/2" />
          <div className="mt-10 flex gap-3">
            <div className="skeleton h-12 w-44 !rounded-full" />
            <div className="skeleton h-12 w-36 !rounded-full" />
          </div>
        </div>
        <div className="skeleton mx-auto aspect-[470/560] w-full max-w-[420px] !rounded-t-full" />
      </div>
      <span className="sr-only">Loading portfolio…</span>
    </div>
  );
}
