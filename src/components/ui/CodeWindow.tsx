import type { PublicProfile } from "@/types/cv";

// shortcut: stack is fixed here (resume), not read from Technology rows; pass it in if it should follow the admin.
const STACK = ["Laravel", "Flutter", "Python"];

const s = (text: string) => <span className="tok-str">&quot;{text}&quot;</span>;

/** Decorative 3D editor window that "types" a short profile object. */
export default function CodeWindow({ profile }: { profile: PublicProfile }) {
  const lines = [
    <>
      <span className="tok-key">const</span>{" "}
      <span className="tok-var">developer</span> = {"{"}
    </>,
    <>
      {"  "}name: {s(profile.fullName.split(/\s+/)[0])},
    </>,
    <>
      {"  "}role: {s(profile.professionalTitle)},
    </>,
    <>
      {"  "}stack: [
      {STACK.map((t, i) => (
        <span key={t}>
          {i > 0 && ", "}
          {s(t)}
        </span>
      ))}
      ],
    </>,
    <>
      {"  "}based: {s(profile.location)},
    </>,
    <>
      {"  "}openToWork: <span className="tok-key">true</span>,
    </>,
    <>{"};"}</>,
  ];

  return (
    <div className="code-window" aria-hidden="true">
      <div className="code-window-bar">
        <span />
        <span />
        <span />
        <p>developer.ts</p>
      </div>
      <pre className="code-window-body">
        {lines.map((line, i) => (
          <code
            key={i}
            className="code-line"
            style={{ "--i": i } as React.CSSProperties}
          >
            {line}
          </code>
        ))}
        <code
          className="code-line code-terminal"
          style={{ "--i": lines.length + 1 } as React.CSSProperties}
        >
          <span className="tok-ok">✓</span> npm run build — ready
          <span className="code-caret" />
        </code>
      </pre>
    </div>
  );
}
