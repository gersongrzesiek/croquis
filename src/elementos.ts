import type { Elemento, Pt } from './modelo';
import { aLocal, aMundo, distSeg, enPoligono } from './geometria';

export interface Caja {
  minx: number;
  miny: number;
  maxx: number;
  maxy: number;
}

/** Ancho aproximado de un texto (en metros) sin necesidad de un contexto. */
export function anchoTexto(texto: string, tam: number): number {
  const lineas = texto.split('\n');
  return Math.max(...lineas.map((l) => l.length)) * tam * 0.58;
}

function esquinasCaja(c: Pt, w: number, h: number, ang: number, y0 = -h / 2): Pt[] {
  return [
    { x: -w / 2, y: y0 },
    { x: w / 2, y: y0 },
    { x: w / 2, y: y0 + h },
    { x: -w / 2, y: y0 + h },
  ].map((p) => aMundo(p, c, ang));
}

/** Puntos que delimitan el elemento, para calcular su caja. */
export function contorno(el: Elemento): Pt[] {
  switch (el.tipo) {
    case 'muro':
    case 'linea':
    case 'cota':
    case 'acceso':
      return [el.a, el.b];
    case 'area':
    case 'trazo':
      return el.puntos;
    case 'mueble':
      return esquinasCaja(el.p, el.ancho, el.alto, el.ang);
    case 'puerta':
    case 'ventana': {
      const g = el.grosor / 2;
      if (el.tipo === 'ventana') return esquinasCaja(el.p, el.ancho, el.grosor, el.ang);
      const lado = el.invertir ? 1 : -1;
      const y0 = lado > 0 ? -g : -g - el.ancho;
      return esquinasCaja(el.p, el.ancho, el.grosor + el.ancho, el.ang, y0);
    }
    case 'texto': {
      const w = anchoTexto(el.texto, el.tam);
      const h = el.texto.split('\n').length * el.tam * 1.2;
      return [
        { x: 0, y: 0 },
        { x: w, y: 0 },
        { x: w, y: h },
        { x: 0, y: h },
      ].map((p) => aMundo(p, el.p, el.ang));
    }
  }
}

export function cajaDe(el: Elemento): Caja {
  const pts = contorno(el);
  const c: Caja = { minx: Infinity, miny: Infinity, maxx: -Infinity, maxy: -Infinity };
  for (const p of pts) {
    c.minx = Math.min(c.minx, p.x);
    c.miny = Math.min(c.miny, p.y);
    c.maxx = Math.max(c.maxx, p.x);
    c.maxy = Math.max(c.maxy, p.y);
  }
  if (el.tipo === 'muro') {
    const g = el.grosor / 2;
    c.minx -= g;
    c.miny -= g;
    c.maxx += g;
    c.maxy += g;
  }
  return c;
}

export function cajaDeTodos(els: Elemento[]): Caja | null {
  if (!els.length) return null;
  const c: Caja = { minx: Infinity, miny: Infinity, maxx: -Infinity, maxy: -Infinity };
  for (const el of els) {
    const k = cajaDe(el);
    c.minx = Math.min(c.minx, k.minx);
    c.miny = Math.min(c.miny, k.miny);
    c.maxx = Math.max(c.maxx, k.maxx);
    c.maxy = Math.max(c.maxy, k.maxy);
  }
  return c;
}

/** ¿El punto p (en metros) toca el elemento? `tol` también en metros. */
export function toca(el: Elemento, p: Pt, tol: number): boolean {
  switch (el.tipo) {
    case 'muro':
      return distSeg(p, el.a, el.b) <= el.grosor / 2 + tol;
    case 'linea':
    case 'cota':
    case 'acceso':
      return distSeg(p, el.a, el.b) <= tol;
    case 'trazo':
      for (let i = 1; i < el.puntos.length; i++) if (distSeg(p, el.puntos[i - 1], el.puntos[i]) <= tol + el.grosor) return true;
      return false;
    case 'area':
      if (enPoligono(p, el.puntos)) return true;
      for (let i = 0; i < el.puntos.length; i++) {
        if (distSeg(p, el.puntos[i], el.puntos[(i + 1) % el.puntos.length]) <= tol) return true;
      }
      return false;
    default:
      return enPoligono(p, contorno(el)) || contornoCerca(contorno(el), p, tol);
  }
}

function contornoCerca(pts: Pt[], p: Pt, tol: number) {
  for (let i = 0; i < pts.length; i++) if (distSeg(p, pts[i], pts[(i + 1) % pts.length]) <= tol) return true;
  return false;
}

export function mover(el: Elemento, dx: number, dy: number) {
  const m = (p: Pt) => {
    p.x += dx;
    p.y += dy;
  };
  switch (el.tipo) {
    case 'muro':
    case 'linea':
    case 'cota':
    case 'acceso':
      m(el.a);
      m(el.b);
      break;
    case 'area':
    case 'trazo':
      el.puntos.forEach(m);
      break;
    default:
      m(el.p);
  }
}

/** Puntos a los que se "pega" el cursor (extremos de muros, vértices…). */
export function puntosClave(el: Elemento): Pt[] {
  switch (el.tipo) {
    case 'muro':
    case 'cota':
    case 'linea':
      return [el.a, el.b];
    case 'area':
      return el.puntos;
    default:
      return [];
  }
}

export function puntoLocal(el: { p: Pt; ang: number }, p: Pt) {
  return aLocal(p, el.p, el.ang);
}
