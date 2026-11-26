import CoverImage from "./CoverImage";

/** A browser window around a project screenshot. */
export default function BrowserFrame({
  src,
  alt,
  url,
  sizes,
  fallback,
  preload = false,
}: {
  src?: string;
  alt: string;
  url: string;
  sizes: string;
  fallback: string;
  preload?: boolean;
}) {
  return (
    <div className="browser">
      <div className="browser-bar" aria-hidden="true">
        <span className="browser-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="browser-url">{url}</span>
      </div>
      <div className="browser-view">
        {src ? (
          <CoverImage src={src} alt={alt} sizes={sizes} preload={preload} />
        ) : (
          <span className="browser-empty" aria-hidden="true">
            {fallback}
          </span>
        )}
      </div>
    </div>
  );
}
