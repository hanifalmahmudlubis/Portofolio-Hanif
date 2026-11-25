import Reveal from "./Reveal";
export default function SectionHeading({
  title,
  description,
  from = "left",
}: {
  from?: "left" | "up";
  title: string;
  description?: string;
}) {
  return (
    <Reveal from={from} repeat className="section-heading">
      <h2 className="section-title">{title}</h2>
      {description && (
        <p className="muted mt-3 max-w-xl text-sm leading-7">{description}</p>
      )}
    </Reveal>
  );
}
