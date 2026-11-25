/** Decorative browser chrome: traffic lights + address bar. */
export default function BrowserBar({ url }: { url: string }) {
  return (
    <div className="browser-bar" aria-hidden="true">
      <span />
      <span />
      <span />
      <p>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        {url}
      </p>
    </div>
  );
}
