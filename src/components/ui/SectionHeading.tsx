import Reveal from "./Reveal";
export default function SectionHeading({
  title,
  description,
}: {
  number?: string;
  label?: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mb-10">
      <h2 className="section-title">{title}</h2>
      {description && (
        <p className="muted mt-3 max-w-xl text-sm leading-7">{description}</p>
      )}
    </Reveal>
  );
}
