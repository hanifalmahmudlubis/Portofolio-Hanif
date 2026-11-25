/** Short CSS-only "dev server boot" intro on the home page. Never blocks input; hidden for reduced motion. */
export default function BootScreen() {
  return (
    <div className="boot-screen" aria-hidden="true">
      <div className="boot-lines">
        <p>
          <span className="tok-ok">$</span> npm run dev
        </p>
        <p>▲ compiling portfolio…</p>
        <p>
          <span className="tok-ok">✓</span> ready on hanif.dev
        </p>
      </div>
    </div>
  );
}
