import * as THREE from "three";

export type SceneVariant = "light" | "dark";

const tones = {
  light: { base: "#f3ede4", stripe: "#c9a57e", deep: "#7a5636", opacity: 0.9 },
  dark: { base: "#241b15", stripe: "#6b4a30", deep: "#c6a27c", opacity: 0.95 },
};

const waveVertex = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vHeight;
  void main() {
    vUv = uv;
    vec3 p = position;
    float h = sin(p.x * 0.26 + uTime * 0.32) * 0.95
      + sin(p.y * 0.4 - uTime * 0.26 + p.x * 0.12) * 0.7
      + sin((p.x + p.y) * 0.17 + uTime * 0.18) * 0.6;
    p.z += h;
    vHeight = h;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

// Flowing contour stripes, shaded by the surface height so they read as 3D folds.
// Smoothstep edges are kept strictly apart: equal edges divide by zero on some GPUs.
const waveFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uBase;
  uniform vec3 uStripe;
  uniform vec3 uDeep;
  varying vec2 vUv;
  varying float vHeight;
  void main() {
    vec2 q = vUv * vec2(6.0, 3.4);
    float warp = sin(q.y * 1.6 + uTime * 0.16) * 0.6
      + sin(q.x * 0.85 - uTime * 0.11) * 0.45
      + vHeight * 0.32;
    float f = sin((q.x * 1.5 + q.y * 0.55 + warp * 1.5) * 7.54);
    float w = max(fwidth(f) * 1.2, 0.002);
    float stripe = smoothstep(0.45 - w, 0.45 + w, f);
    float shade = clamp(0.55 + vHeight * 0.24, 0.0, 1.0);
    vec3 ink = mix(uDeep, uStripe, shade);
    vec3 color = mix(uBase, ink, stripe);
    float edge = smoothstep(0.0, 0.16, vUv.x) * (1.0 - smoothstep(0.84, 1.0, vUv.x))
      * smoothstep(0.0, 0.22, vUv.y) * (1.0 - smoothstep(0.7, 1.0, vUv.y));
    gl_FragColor = vec4(color, uOpacity * edge * (0.28 + 0.72 * stripe));
    #include <colorspace_fragment>
  }
`;

/** Builds the wave scene inside `host` and returns a cleanup function. */
export function createScene(host: HTMLElement, variant: SceneVariant) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.className = "scene-canvas";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const tone = tones[variant];
  const uniforms = {
    uTime: { value: 0 },
    uOpacity: { value: tone.opacity },
    uBase: { value: new THREE.Color(tone.base) },
    uStripe: { value: new THREE.Color(tone.stripe) },
    uDeep: { value: new THREE.Color(tone.deep) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: waveVertex,
    fragmentShader: waveFragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const geometry = new THREE.PlaneGeometry(40, 24, 220, 132);
  const wave = new THREE.Mesh(geometry, material);
  wave.rotation.set(-0.95, 0, 0.22);
  wave.position.set(0, -1.2, -5);
  scene.add(wave);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (event: PointerEvent) => {
    pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
  };

  let frame = 0;
  let lastTime = 8000;
  let visible = true;
  function render(time: number) {
    uniforms.uTime.value = time / 1000;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    camera.position.x = pointer.x * 0.5;
    camera.position.y = -pointer.y * 0.3;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  const resize = () => {
    const width = host.clientWidth || 1;
    const height = host.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render(lastTime);
  };
  const loop = (time: number) => {
    lastTime = time;
    render(time);
    frame = requestAnimationFrame(loop);
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    if (visible && !document.hidden && !motion.matches) {
      frame = requestAnimationFrame(loop);
    } else {
      render(lastTime);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    sync();
  });
  observer.observe(host);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", sync);
  resize();
  sync();

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener("pointermove", onPointer);
    document.removeEventListener("visibilitychange", sync);
    motion.removeEventListener("change", sync);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    canvas.remove();
  };
}
