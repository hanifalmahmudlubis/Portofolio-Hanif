/** Animated page skeleton used where a project has no screenshot. */
export default function Wireframe() {
  return (
    <div className="wireframe" aria-hidden="true">
      <div className="wf-nav">
        <i />
        <i />
        <i />
      </div>
      <div className="wf-hero">
        <i />
        <i />
      </div>
      <div className="wf-cards">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
