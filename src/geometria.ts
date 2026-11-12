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
