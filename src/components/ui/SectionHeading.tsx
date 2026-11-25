import Reveal from "./Reveal";
export default function SectionHeading({
  title,
  description,
  command,
  from = "left",
}: {
  from?: "left" | "up";
  title: string;
  description?: string;
  /** Decorative terminal command shown above the title. */
  command?: string;
}) {
  return (
    <Reveal from={from} repeat className="section-heading">
      {command && (
        <p className="section-cmd" aria-hidden="true">
          <span>$</span> {command}
        </p>
      )}
      <h2 className="section-title">{title}</h2>
      {description && (
        <p className="muted mt-3 max-w-xl text-sm leading-7">{description}</p>
      )}
    </Reveal>
  );
}
