import type { Pt } from './modelo';

export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export function proyectar(p: Pt, a: Pt, b: Pt): { pt: Pt; t: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  let t = l2 === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return { pt: { x: a.x + dx * t, y: a.y + dy * t }, t };
}

export const distSeg = (p: Pt, a: Pt, b: Pt) => dist(p, proyectar(p, a, b).pt);

export function enPoligono(p: Pt, pts: Pt[]): boolean {
  let dentro = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) dentro = !dentro;
  }
  return dentro;
}

export function areaPoligono(pts: Pt[]): number {
  let s = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) s += (pts[j].x + pts[i].x) * (pts[j].y - pts[i].y);
  return Math.abs(s / 2);
}

/** Centroide del polígono (o promedio si es degenerado). */
export function centroide(pts: Pt[]): Pt {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const f = pts[j].x * pts[i].y - pts[i].x * pts[j].y;
    a += f;
    cx += (pts[j].x + pts[i].x) * f;
    cy += (pts[j].y + pts[i].y) * f;
  }
  if (Math.abs(a) < 1e-9) {
    const n = pts.length || 1;
    return { x: pts.reduce((s, p) => s + p.x, 0) / n, y: pts.reduce((s, p) => s + p.y, 0) / n };
  }
  return { x: cx / (3 * a), y: cy / (3 * a) };
}

/** Convierte un punto del mundo a coordenadas locales de un objeto (centro + ángulo). */
export function aLocal(p: Pt, centro: Pt, ang: number): Pt {
  const dx = p.x - centro.x;
  const dy = p.y - centro.y;
  const c = Math.cos(-ang);
  const s = Math.sin(-ang);
  return { x: dx * c - dy * s, y: dx * s + dy * c };
}

export function aMundo(p: Pt, centro: Pt, ang: number): Pt {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return { x: centro.x + p.x * c - p.y * s, y: centro.y + p.x * s + p.y * c };
}

export function formatoM(m: number): string {
  return `${m.toFixed(2)} m`;
}

/** Encoge un polígono simple `d` metros hacia adentro (esquinas en inglete). */
export function insetPoligono(pts: Pt[], d: number): Pt[] {
  const n = pts.length;
  if (n < 3 || d <= 0) return pts.map((p) => ({ ...p }));
  // Orientación: área con signo
  let s = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    s += a.x * b.y - b.x * a.y;
  }
  const sentido = s > 0 ? 1 : -1;
  const lineas = pts.map((a, i) => {
    const b = pts[(i + 1) % n];
    const l = dist(a, b) || 1;
    // Normal hacia adentro
    const nx = (-(b.y - a.y) / l) * sentido;
    const ny = ((b.x - a.x) / l) * sentido;
    return { a: { x: a.x + nx * d, y: a.y + ny * d }, b: { x: b.x + nx * d, y: b.y + ny * d } };
  });
  return lineas.map((l2, i) => {
    const l1 = lineas[(i - 1 + n) % n];
    const x1 = l1.a.x, y1 = l1.a.y, x2 = l1.b.x, y2 = l1.b.y;
    const x3 = l2.a.x, y3 = l2.a.y, x4 = l2.b.x, y4 = l2.b.y;
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(den) < 1e-9) return { ...l2.a };
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
  });
}
