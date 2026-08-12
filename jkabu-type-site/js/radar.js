/**
 * Dependency-free SVG radar chart.
 * data: [{ axis: "G", value: 0-100 }, ...]
 * returns an SVG string.
 */
export function renderRadarSVG(data, { size = 280, color = "#B23A32" } = {}) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.32;
  const n = data.length;
  const angleFor = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  const pointAt = (i, ratio) => {
    const a = angleFor(i);
    return [cx + Math.cos(a) * maxR * ratio, cy + Math.sin(a) * maxR * ratio];
  };

  // grid rings
  const rings = [0.25, 0.5, 0.75, 1].map((ratio) => {
    const pts = data.map((_, i) => pointAt(i, ratio).join(",")).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="#2a3245" stroke-width="1" />`;
  }).join("");

  // axis lines
  const axes = data.map((_, i) => {
    const [x, y] = pointAt(i, 1);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#2a3245" stroke-width="1" />`;
  }).join("");

  // labels
  const labels = data.map((d, i) => {
    const [x, y] = pointAt(i, 1.18);
    return `<text x="${x}" y="${y}" fill="#c7cbd6" font-size="13" font-family="monospace" text-anchor="middle" dominant-baseline="middle">${d.axis}</text>`;
  }).join("");

  // data polygon
  const dataPts = data.map((d, i) => pointAt(i, Math.max(0, Math.min(100, d.value)) / 100).join(",")).join(" ");

  return `
    <svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      ${rings}
      ${axes}
      <polygon points="${dataPts}" fill="${color}" fill-opacity="0.35" stroke="${color}" stroke-width="2" />
      ${labels}
    </svg>
  `;
}
