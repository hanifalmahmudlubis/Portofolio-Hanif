import Image from "next/image";
import SplitText from "../ui/SplitText";
import SplashDepth from "../ui/SplashDepth";
import {
  DEFAULT_INTRO_CUTOUT,
  DEFAULT_INTRO_IMAGE,
  initialPublicProfile,
} from "@/lib/site";

/**
 * Full-screen opening: an extruded backdrop word, the portrait standing in front
 * of it and the greeting on top. Layers move at different depths for a 3D feel.
 */
export default function Splash({
  photoUrl = DEFAULT_INTRO_IMAGE,
  name = initialPublicProfile.fullName,
}: {
  photoUrl?: string;
  name?: string;
}) {
  // The bundled portrait has a background-free version; other photos fade at the edges.
  const cutout = photoUrl === DEFAULT_INTRO_IMAGE;
  const word = name.split(/\s+/)[0];
  // Two identical halves let the track loop seamlessly at -50%.
  const half = Array.from({ length: 4 }, () => word);
  return (
    <SplashDepth id="home" className="splash">
      <div className="splash-layer splash-layer-back" aria-hidden="true">
        <div className="splash-marquee">
          <div className="splash-marquee-track">
            {[...half, ...half].map((item, index) => (
              <span key={index}>{item}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="splash-layer splash-layer-photo">
        <span className="splash-floor" aria-hidden="true" />
        <div className={`splash-photo ${cutout ? "" : "splash-photo-faded"}`}>
          <Image
            src={cutout ? DEFAULT_INTRO_CUTOUT : photoUrl}
            alt={name}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 767px) 100vw, 720px"
          />
        </div>
      </div>
      <div className="splash-layer splash-layer-front">
        <h1 className="splash-title">
          <SplitText text="Hello," delay={0.5} />
          <SplitText
            text={`I’m ${name}`}
            delay={0.75}
            gradient={["#fbf8f3", "#c6a27c"]}
          />
        </h1>
      </div>
      <a href="#intro" className="splash-scroll" aria-label="Scroll to intro" />
    </SplashDepth>
  );
}
