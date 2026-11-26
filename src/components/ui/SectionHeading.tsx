import Reveal from "./Reveal";
import SplitText from "./SplitText";
export default function SectionHeading({
  title,
  index,
  description,
  from = "up",
}: {
  from?: "left" | "up";
  title: string;
  index?: string;
  description?: string;
}) {
  return (
    <Reveal from={from} className="section-heading">
      {index && <span className="eyebrow section-index">{index}</span>}
      <h2 className="section-title">
        <SplitText text={title} />
      </h2>
      {description && (
        <p className="muted mt-4 max-w-xl text-base leading-7">{description}</p>
      )}
    </Reveal>
  );
}
