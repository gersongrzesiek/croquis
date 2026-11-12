import { dibujarSimbolo } from './catalogo';
import { contorno } from './elementos';
import { areaPoligono, centroide, dist, formatoM } from './geometria';
import type { Abertura, Area, DatosCroquis, Elemento, Patron, Pt } from './modelo';

/** pantalla = mundo * escala + o */
export interface Vista {
  escala: number;
  ox: number;
  oy: number;
}

export interface OpcionesDibujo {
  ancho: number;
  alto: number;
  cuadricula: boolean;
  fondo?: string;
  seleccion?: Set<string>;
  /** Elementos extra (vistas previas) que no forman parte de los datos. */
  extras?: Elemento[];
}

const ORDEN: Record<Elemento['tipo'], number> = {
  area: 0,
  trazo: 1,
  linea: 1,
  mueble: 2,
  muro: 3,
  puerta: 4,
  ventana: 4,
  cota: 5,
  acceso: 6,
  texto: 7,
};

const cachePatrones = new Map<string, CanvasPattern | null>();

function patron(ctx: CanvasRenderingContext2D, tipo: Patron, color: string): CanvasPattern | null {
  const clave = tipo + color;
  if (cachePatrones.has(clave)) return cachePatrones.get(clave)!;
  const n = 32;
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const g = c.getContext('2d')!;
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = 2;
  g.beginPath();
  if (tipo === 'diagonal' || tipo === 'cruzado') {
    g.moveTo(-4, n + 4);
    g.lineTo(n + 4, -4);
    g.moveTo(-4, 4);
    g.lineTo(4, -4);
    g.moveTo(n - 4, n + 4);
    g.lineTo(n + 4, n - 4);
  }
  if (tipo === 'cruzado') {
    g.moveTo(-4, -4);
    g.lineTo(n + 4, n + 4);
    g.moveTo(n - 4, -4);
    g.lineTo(n + 4, 4);
    g.moveTo(-4, n - 4);
    g.lineTo(4, n + 4);
  }
  if (tipo === 'horizontal') {
    g.moveTo(0, n / 2);
    g.lineTo(n, n / 2);
  }
  g.stroke();
  if (tipo === 'puntos') {
    g.beginPath();
    g.arc(n / 2, n / 2, 2.5, 0, Math.PI * 2);
    g.fill();
  }
  const p = ctx.createPattern(c, 'repeat');
  cachePatrones.set(clave, p);
  return p;
}

/** Escribe texto con tamaño en metros sin depender de fuentes < 1px. */
export function textoMundo(
  ctx: CanvasRenderingContext2D,
  texto: string,
  p: Pt,
  tam: number,
  color: string,
  o: { ang?: number; alinear?: CanvasTextAlign; base?: CanvasTextBaseline; negrita?: boolean; halo?: boolean } = {},
) {
  const k = 100;
  ctx.save();
  ctx.translate(p.x, p.y);
  if (o.ang) ctx.rotate(o.ang);
  ctx.scale(1 / k, 1 / k);
  ctx.font = `${o.negrita ? 'bold ' : ''}${tam * k}px Arial, sans-serif`;
  ctx.textAlign = o.alinear ?? 'left';
  ctx.textBaseline = o.base ?? 'top';
  const lineas = texto.split('\n');
  const alto = o.base === 'middle' ? -((lineas.length - 1) * tam * k * 1.2) / 2 : 0;
  lineas.forEach((l, i) => {
    const y = alto + i * tam * k * 1.2;
    if (o.halo) {
      ctx.lineWidth = tam * k * 0.25;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineJoin = 'round';
      ctx.strokeText(l, 0, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(l, 0, y);
  });
  ctx.restore();
}

/** Ángulo legible (el texto nunca queda de cabeza). */
function angLegible(a: Pt, b: Pt) {
  let ang = Math.atan2(b.y - a.y, b.x - a.x);
  if (ang > Math.PI / 2) ang -= Math.PI;
  if (ang <= -Math.PI / 2) ang += Math.PI;
  return ang;
}

function dibujarArea(ctx: CanvasRenderingContext2D, el: Area, escala: number) {
  if (el.puntos.length < 2) return;
  ctx.beginPath();
  el.puntos.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
  ctx.save();
  ctx.globalAlpha = el.opacidad;
  ctx.fillStyle = el.relleno;
  ctx.fill();
  ctx.restore();
  if (el.patron !== 'ninguno') {
    const pat = patron(ctx, el.patron, el.borde);
    if (pat) {
      // Cada mosaico de 32px mide 0.4 m
      pat.setTransform(new DOMMatrix().scale(0.4 / 32));
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = pat;
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.strokeStyle = el.borde;
  ctx.lineWidth = 0.02;
  ctx.setLineDash([0.12, 0.08]);
  ctx.stroke();
  ctx.setLineDash([]);
  const etiqueta = [el.nombre, el.mostrarM2 && el.puntos.length > 2 ? `${areaPoligono(el.puntos).toFixed(2)} m²` : '']
    .filter(Boolean)
    .join('\n');
  if (etiqueta) {
    textoMundo(ctx, etiqueta, centroide(el.puntos), Math.max(0.22, 11 / escala), '#111827', {
      alinear: 'center',
      base: 'middle',
      negrita: true,
      halo: true,
    });
  }
}

function dibujarAbertura(ctx: CanvasRenderingContext2D, el: Abertura, fondo: string) {
  const w = el.ancho;
  const g = el.grosor;
  ctx.save();
  ctx.translate(el.p.x, el.p.y);
  ctx.rotate(el.ang);
  ctx.fillStyle = fondo;
  ctx.fillRect(-w / 2, -g / 2 - 0.005, w, g + 0.01);
  ctx.strokeStyle = el.color;
  ctx.lineWidth = 0.02;
  // Jambas
  ctx.beginPath();
  ctx.moveTo(-w / 2, -g / 2);
  ctx.lineTo(-w / 2, g / 2);
  ctx.moveTo(w / 2, -g / 2);
  ctx.lineTo(w / 2, g / 2);
  ctx.stroke();
  if (el.tipo === 'ventana') {
    ctx.strokeRect(-w / 2, -g / 2, w, g);
    ctx.beginPath();
    ctx.moveTo(-w / 2, -g / 6);
    ctx.lineTo(w / 2, -g / 6);
    ctx.moveTo(-w / 2, g / 6);
    ctx.lineTo(w / 2, g / 6);
    ctx.stroke();
  } else {
    const s = el.invertir ? 1 : -1;
    const hx = el.espejo ? w / 2 : -w / 2;
    const hy = (s * g) / 2;
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx, hy + s * w);
    ctx.stroke();
    const a1 = Math.atan2(s, 0);
    const a2 = hx < 0 ? 0 : Math.PI;
    let delta = a1 - a2;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta <= -Math.PI) delta += 2 * Math.PI;
    ctx.lineWidth = 0.015;
    ctx.setLineDash([0.06, 0.04]);
    ctx.beginPath();
    ctx.arc(hx, hy, w, a2, a1, delta < 0);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function flecha(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, tam: number) {
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  ctx.beginPath();
  ctx.moveTo(b.x, b.y);
  ctx.lineTo(b.x - tam * Math.cos(ang - 0.45), b.y - tam * Math.sin(ang - 0.45));
  ctx.lineTo(b.x - tam * Math.cos(ang + 0.45), b.y - tam * Math.sin(ang + 0.45));
  ctx.closePath();
  ctx.fill();
}

export function dibujarElemento(ctx: CanvasRenderingContext2D, el: Elemento, d: DatosCroquis, escala: number, fondo: string) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  switch (el.tipo) {
    case 'area':
      dibujarArea(ctx, el, escala);
      break;
    case 'muro': {
      ctx.lineCap = 'square';
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.grosor;
      ctx.beginPath();
      ctx.moveTo(el.a.x, el.a.y);
      ctx.lineTo(el.b.x, el.b.y);
      ctx.stroke();
      break;
    }
    case 'puerta':
    case 'ventana':
      dibujarAbertura(ctx, el, fondo);
      break;
    case 'mueble':
      ctx.translate(el.p.x, el.p.y);
      ctx.rotate(el.ang);
      dibujarSimbolo(ctx, el.clave, el.ancho, el.alto, el.color, 0.02);
      if (el.etiqueta) {
        ctx.rotate(-el.ang);
        textoMundo(ctx, el.etiqueta, { x: 0, y: 0 }, Math.max(0.16, 9 / escala), '#111827', {
          alinear: 'center',
          base: 'middle',
          halo: true,
        });
      }
      break;
    case 'texto':
      textoMundo(ctx, el.texto, el.p, el.tam, el.color, { ang: el.ang, negrita: el.negrita });
      break;
    case 'linea':
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.grosor;
      if (el.discontinua) ctx.setLineDash([el.grosor * 5, el.grosor * 3]);
      ctx.beginPath();
      ctx.moveTo(el.a.x, el.a.y);
      ctx.lineTo(el.b.x, el.b.y);
      ctx.stroke();
      break;
    case 'trazo':
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.grosor;
      ctx.beginPath();
      el.puntos.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      if (el.puntos.length === 1) ctx.lineTo(el.puntos[0].x + 0.001, el.puntos[0].y);
      ctx.stroke();
      break;
    case 'acceso': {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = 0.07;
      const ang = Math.atan2(el.b.y - el.a.y, el.b.x - el.a.x);
      const fin = { x: el.b.x - Math.cos(ang) * 0.15, y: el.b.y - Math.sin(ang) * 0.15 };
      ctx.beginPath();
      ctx.moveTo(el.a.x, el.a.y);
      ctx.lineTo(fin.x, fin.y);
      ctx.stroke();
      flecha(ctx, el.a, el.b, 0.35);
      if (el.texto) {
        const off = 0.12;
        const pa = { x: el.a.x - Math.cos(ang) * off, y: el.a.y - Math.sin(ang) * off };
        const izq = Math.cos(ang) > 0.3 ? 'right' : Math.cos(ang) < -0.3 ? 'left' : 'center';
        const base = Math.sin(ang) > 0.3 ? 'bottom' : Math.sin(ang) < -0.3 ? 'top' : 'middle';
        textoMundo(ctx, el.texto, pa, 0.25, el.color, { alinear: izq, base, negrita: true, halo: true });
      }
      break;
    }
    case 'cota': {
      const l = dist(el.a, el.b);
      const ang = Math.atan2(el.b.y - el.a.y, el.b.x - el.a.x);
      const t = 0.1;
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = 0.015;
      ctx.beginPath();
      ctx.moveTo(el.a.x, el.a.y);
      ctx.lineTo(el.b.x, el.b.y);
      for (const p of [el.a, el.b]) {
        ctx.moveTo(p.x - Math.cos(ang + Math.PI / 4) * t, p.y - Math.sin(ang + Math.PI / 4) * t);
        ctx.lineTo(p.x + Math.cos(ang + Math.PI / 4) * t, p.y + Math.sin(ang + Math.PI / 4) * t);
        ctx.moveTo(p.x - Math.cos(ang + Math.PI / 2) * t, p.y - Math.sin(ang + Math.PI / 2) * t);
        ctx.lineTo(p.x + Math.cos(ang + Math.PI / 2) * t, p.y + Math.sin(ang + Math.PI / 2) * t);
      }
      ctx.stroke();
      const m = { x: (el.a.x + el.b.x) / 2, y: (el.a.y + el.b.y) / 2 };
      textoMundo(ctx, formatoM(l), m, Math.max(0.18, 10 / escala), el.color, {
        ang: angLegible(el.a, el.b),
        alinear: 'center',
        base: 'bottom',
        halo: true,
      });
      break;
    }
  }
  ctx.restore();
  // Medidas de muros
  if (el.tipo === 'muro' && d.opciones.medidasMuros) {
    const l = dist(el.a, el.b);
    if (l > 0.3) {
      const ang = angLegible(el.a, el.b);
      const n = { x: Math.sin(ang), y: -Math.cos(ang) };
      const off = el.grosor / 2 + 0.05;
      const m = { x: (el.a.x + el.b.x) / 2 + n.x * off, y: (el.a.y + el.b.y) / 2 + n.y * off };
      textoMundo(ctx, l.toFixed(2), m, Math.max(0.16, 9 / escala), '#6b7280', { ang, alinear: 'center', base: 'bottom' });
    }
  }
}

function dibujarCuadricula(ctx: CanvasRenderingContext2D, v: Vista, ancho: number, alto: number) {
  const x0 = -v.ox / v.escala;
  const y0 = -v.oy / v.escala;
  const x1 = (ancho - v.ox) / v.escala;
  const y1 = (alto - v.oy) / v.escala;
  const niveles: [number, string][] = [];
  if (0.5 * v.escala >= 8) niveles.push([0.5, '#f1f3f5']);
  if (v.escala >= 6) niveles.push([1, '#e3e6ea']);
  niveles.push([5, '#cfd4da']);
  ctx.lineWidth = 1 / v.escala;
  for (const [paso, color] of niveles) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (let x = Math.floor(x0 / paso) * paso; x <= x1; x += paso) {
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
    }
    for (let y = Math.floor(y0 / paso) * paso; y <= y1; y += paso) {
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
    }
    ctx.stroke();
  }
}

export function ordenar(els: Elemento[]): Elemento[] {
  return els
    .map((el, i) => ({ el, i }))
    .sort((a, b) => ORDEN[a.el.tipo] - ORDEN[b.el.tipo] || a.i - b.i)
    .map((x) => x.el);
}

/** Dibuja toda la escena. El contexto debe venir en píxeles CSS (sin escala de mundo). */
export function dibujarEscena(ctx: CanvasRenderingContext2D, d: DatosCroquis, v: Vista, o: OpcionesDibujo) {
  const fondo = o.fondo ?? '#ffffff';
  ctx.save();
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, o.ancho, o.alto);
  ctx.translate(v.ox, v.oy);
  ctx.scale(v.escala, v.escala);
  if (o.cuadricula) dibujarCuadricula(ctx, v, o.ancho, o.alto);
  for (const el of ordenar([...d.elementos, ...(o.extras ?? [])])) dibujarElemento(ctx, el, d, v.escala, fondo);
  if (o.seleccion?.size) {
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5 / v.escala;
    ctx.setLineDash([5 / v.escala, 4 / v.escala]);
    for (const el of d.elementos) {
      if (!o.seleccion.has(el.id)) continue;
      const pts = contorno(el);
      ctx.beginPath();
      if (pts.length === 2) {
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        if (el.tipo === 'muro') {
          ctx.lineWidth = el.grosor + 4 / v.escala;
          ctx.strokeStyle = 'rgba(37,99,235,0.35)';
          ctx.setLineDash([]);
          ctx.lineCap = 'square';
          ctx.stroke();
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 1.5 / v.escala;
          ctx.setLineDash([5 / v.escala, 4 / v.escala]);
          ctx.lineCap = 'butt';
          continue;
        }
      } else {
        pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        if (el.tipo !== 'trazo') ctx.closePath();
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
  ctx.restore();
}

/** Barra de escala gráfica (en píxeles de la imagen). `anchoImg` ajusta su tamaño a la imagen. */
export function dibujarBarraEscala(ctx: CanvasRenderingContext2D, escala: number, x: number, y: number, anchoImg = 800) {
  const opciones = [0.5, 1, 2, 5, 10, 20, 50, 100];
  const largo = opciones.find((m) => m * escala >= anchoImg * 0.12) ?? 100;
  const px = largo * escala;
  const f = Math.max(12, Math.round(anchoImg * 0.014));
  const alto = Math.round(f * 0.5);
  ctx.save();
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = Math.max(1.5, f / 10);
  ctx.fillRect(x, y - alto, px / 2, alto);
  ctx.strokeRect(x, y - alto, px, alto);
  ctx.font = `${f}px Arial, sans-serif`;
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'center';
  ctx.fillText('0', x, y - alto - f * 0.3);
  ctx.fillText(`${largo} m`, x + px, y - alto - f * 0.3);
  ctx.restore();
}
