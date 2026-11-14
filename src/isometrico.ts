/**
 * Vista isométrica del croquis: el plano se ve en perspectiva paralela a 30°, con los muros levantados
 * a una altura, las puertas y ventanas como huecos en el muro y el mobiliario como cajas.
 * Es solo una vista: se calcula a partir de los mismos datos del plano.
 */
import { dibujarSimbolo } from './catalogo';
import { cajaDeTodos, posEtiqueta, type Caja } from './elementos';
import { aMundo, areaPoligono, dist } from './geometria';
import type { Abertura, DatosCroquis, Elemento, Mueble, Muro, Norte, Pt } from './modelo';
import { ajustarTexto, dibujarElemento, ordenar, poligonosMuros, textoMundo, type Vista } from './render';

/** Altura de muros por defecto, en metros. */
export const ALTURA_MUROS = 2.5;
const ALTO_PUERTA = 2.1;
const ANTEPECHO = 0.9;
const DINTEL_VENTANA = 2.1;
/** Largo máximo de cada pieza al trocear muros y muebles para ordenarlos de atrás hacia adelante. */
const PIEZA = 0.4;

const C = Math.cos(Math.PI / 6);
const S = 0.5;

/** Altura típica de cada mueble del catálogo (m). Lo que no está aquí mide 0.8 m. Hasta 5 cm se dibuja plano en el piso. */
const ALTURAS: Record<string, number> = {
  silla: 0.45,
  'asiento-giratorio': 0.5,
  banqueta: 0.25,
  anaquel: 1.8,
  'anaquel-plag': 1.8,
  'gabinete-llave': 1.8,
  'casillero-epp': 1.8,
  vestidor: 1.9,
  mampara: 1.9,
  mandiles: 1.6,
  portasueros: 1.8,
  'bucky-vertical': 1.8,
  'tubo-rx': 1.9,
  mastografo: 1.7,
  panoramico: 1.7,
  refrigerador: 1.7,
  'camara-fria': 2.2,
  congelador: 0.9,
  wc: 0.4,
  bote: 0.6,
  'bote-rpbi': 0.6,
  'bote-pedal': 0.6,
  'cama-hosp': 0.6,
  camilla: 0.6,
  tarima: 0.15,
  bascula: 0.1,
  extintor: 0.6,
  'envases-vacios': 1,
  regadera: 0,
  'regadera-emerg': 0,
  coladera: 0,
  'trampa-grasa': 0,
  'lampara-quir': 0,
  'lampara-seg': 0,
  'luz-roja': 0,
  'senal-rad': 0,
  'senal-peligro': 0,
  campana: 0,
  extractor: 0,
};

export function alturaMueble(clave: string): number {
  return ALTURAS[clave] ?? 0.8;
}

export interface OpcionesIso {
  /** Giro de la vista en cuartos de vuelta (0 a 3). */
  giro: number;
  /** Altura de los muros en metros. */
  altura: number;
  /** Transparencia de los muros que dan al frente, de 0 (opacos) a 1 (solo el contorno). */
  transparencia: number;
}

export function opcionesIso(d: DatosCroquis): OpcionesIso {
  const giro = Math.round(d.opciones.giroIso ?? 0);
  const t = (d.opciones.transparenciaFrontal ?? 0) / 100;
  return { giro: ((giro % 4) + 4) % 4, altura: d.opciones.alturaMuros ?? ALTURA_MUROS, transparencia: Math.min(1, Math.max(0, t)) };
}

/** Gira un punto del plano en cuartos de vuelta (exacto, sin errores de redondeo). */
function girar(p: Pt, giro: number): Pt {
  switch (giro) {
    case 1:
      return { x: -p.y, y: p.x };
    case 2:
      return { x: -p.x, y: -p.y };
    case 3:
      return { x: p.y, y: -p.x };
    default:
      return p;
  }
}

/** Punto del plano (con altura z) en coordenadas isométricas, en metros. */
export function aIso(p: Pt, z: number, giro: number): Pt {
  const q = girar(p, giro);
  return { x: (q.x - q.y) * C, y: (q.x + q.y) * S - z };
}

/** Caja que ocupa el croquis ya proyectado, en metros isométricos. */
export function cajaIso(d: DatosCroquis, o: OpcionesIso): Caja | null {
  // El norte no ocupa lugar: en esta vista va fijo en una esquina
  const c = cajaDeTodos(d.elementos.filter((e) => e.tipo !== 'norte'));
  if (!c) return null;
  const alto = Math.max(o.altura, ...d.elementos.map((e) => (e.tipo === 'mueble' ? alturaMueble(e.clave) : 0)));
  const r: Caja = { minx: Infinity, miny: Infinity, maxx: -Infinity, maxy: -Infinity };
  for (const x of [c.minx, c.maxx])
    for (const y of [c.miny, c.maxy])
      for (const z of [0, alto]) {
        const q = aIso({ x, y }, z, o.giro);
        r.minx = Math.min(r.minx, q.x);
        r.miny = Math.min(r.miny, q.y);
        r.maxx = Math.max(r.maxx, q.x);
        r.maxy = Math.max(r.maxy, q.y);
      }
  return r;
}

/** Vista que encuadra todo el croquis isométrico en un lienzo de ancho × alto píxeles. */
export function encuadreIso(d: DatosCroquis, o: OpcionesIso, ancho: number, alto: number, margen: number, maxEscala = 600): Vista {
  const c = cajaIso(d, o) ?? { minx: -3, miny: -2, maxx: 3, maxy: 2 };
  const w = Math.max(c.maxx - c.minx, 1);
  const h = Math.max(c.maxy - c.miny, 1);
  const escala = Math.max(1, Math.min((ancho - margen * 2) / w, (alto - margen * 2) / h, maxEscala));
  return { escala, ox: ancho / 2 - ((c.minx + c.maxx) / 2) * escala, oy: alto / 2 - ((c.miny + c.maxy) / 2) * escala };
}

// ───────────────────────── Colores ─────────────────────────

function rgb(color: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!m) return null;
  const hx = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(hx.slice(i, i + 2), 16)) as [number, number, number];
}

/** Mezcla el color con blanco (t > 0) o con negro (t < 0). */
function aclarar(color: string, t: number): string {
  const c = rgb(color);
  if (!c) return color;
  const destino = t >= 0 ? 255 : 0;
  const k = Math.abs(t);
  const [r, g, b] = c.map((v) => Math.round(v + (destino - v) * k));
  return `rgb(${r},${g},${b})`;
}

// ───────────────────────── Prismas ─────────────────────────

/** Un volumen: polígono convexo en el plano, levantado de z0 a z1. */
interface Prisma {
  pts: Pt[];
  z0: number;
  z1: number;
  /** Lados que son cortes internos (al trocear), que no llevan línea de borde. */
  corte: boolean[];
  color: string;
  /** Cuánto se aclaran las caras laterales y la tapa (0 = color tal cual, 1 = blanco). */
  luzLados: [number, number];
  luzTapa: number;
  borde: string;
  /** Dibujo sobre la tapa (en coordenadas del plano), p. ej. el símbolo del mueble. */
  tapa?: (ctx: CanvasRenderingContext2D) => void;
  prof: number;
  /** Muro al que pertenece la pieza (para saber si da al frente). */
  muro?: Muro;
  frontal?: boolean;
}

/** Recorta un polígono convexo con el semiplano dot(p, u) >= k. */
function recortar(pts: Pt[], u: Pt, k: number): Pt[] {
  const res: Pt[] = [];
  const f = (p: Pt) => p.x * u.x + p.y * u.y - k;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const fa = f(a);
    const fb = f(b);
    if (fa >= 0) res.push(a);
    if ((fa >= 0) !== (fb >= 0)) {
      const t = fa / (fa - fb);
      res.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return res;
}

const sobreRecta = (p: Pt, [a, b]: [Pt, Pt]) => {
  const l = dist(a, b);
  return l > 1e-9 && Math.abs((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) / l < 1e-6;
};

/**
 * Trozo del polígono entre dot(p,u) = s0 y s1, con qué lados son cortes (sin línea de borde):
 * los de troceo y los que caen sobre `uniones` (lados donde el muro se une con otro).
 */
function rebanada(
  pts: Pt[],
  u: Pt,
  s0: number,
  s1: number,
  esCorteInicio: boolean,
  esCorteFin: boolean,
  uniones: [Pt, Pt][],
): { pts: Pt[]; corte: boolean[] } {
  let r = recortar(pts, u, s0);
  r = recortar(r, { x: -u.x, y: -u.y }, -s1);
  const corte = r.map((a, i) => {
    const b = r[(i + 1) % r.length];
    if (uniones.some((e) => sobreRecta(a, e) && sobreRecta(b, e))) return true;
    const da = a.x * u.x + a.y * u.y;
    const db = b.x * u.x + b.y * u.y;
    if (esCorteInicio && Math.abs(da - s0) < 1e-7 && Math.abs(db - s0) < 1e-7) return true;
    if (esCorteFin && Math.abs(da - s1) < 1e-7 && Math.abs(db - s1) < 1e-7) return true;
    return false;
  });
  return { pts: r, corte };
}

/** Aberturas que están sobre el muro, como intervalos a lo largo de su eje. */
function aberturasDe(m: Muro, aberturas: Abertura[]): { s0: number; s1: number; tipo: Abertura['tipo'] }[] {
  const L = dist(m.a, m.b);
  const u = { x: (m.b.x - m.a.x) / L, y: (m.b.y - m.a.y) / L };
  const res: { s0: number; s1: number; tipo: Abertura['tipo'] }[] = [];
  for (const ab of aberturas) {
    const paralelo = Math.abs(Math.sin(ab.ang - Math.atan2(u.y, u.x))) < 0.05;
    if (!paralelo) continue;
    const dx = ab.p.x - m.a.x;
    const dy = ab.p.y - m.a.y;
    const s = dx * u.x + dy * u.y;
    const n = Math.abs(dx * -u.y + dy * u.x);
    if (n > m.grosor / 2 + 0.02 || s < -0.01 || s > L + 0.01) continue;
    res.push({ s0: Math.max(0, s - ab.ancho / 2), s1: Math.min(L, s + ab.ancho / 2), tipo: ab.tipo });
  }
  return res.sort((a, b) => a.s0 - b.s0);
}

function prismasMuros(muros: Muro[], aberturas: Abertura[], o: OpcionesIso): Prisma[] {
  const H = o.altura;
  const res: Prisma[] = [];
  const clave = (p: Pt) => `${Math.round(p.x * 1e4)},${Math.round(p.y * 1e4)}`;
  const usos = new Map<string, number>();
  for (const m of muros) for (const p of [m.a, m.b]) usos.set(clave(p), (usos.get(clave(p)) ?? 0) + 1);
  for (const { m, pts } of poligonosMuros(muros)) {
    // Los extremos que tocan otro muro son uniones: su cara queda oculta y no lleva borde
    const uniones: [Pt, Pt][] = [];
    if ((usos.get(clave(m.a)) ?? 0) > 1) uniones.push([pts[3], pts[0]]);
    if ((usos.get(clave(m.b)) ?? 0) > 1) uniones.push([pts[1], pts[2]]);
    const L = dist(m.a, m.b);
    const u = { x: (m.b.x - m.a.x) / L, y: (m.b.y - m.a.y) / L };
    const base = m.a.x * u.x + m.a.y * u.y;
    // Tramos a lo largo del muro: macizo, puerta o ventana
    const tramos: { s0: number; s1: number; tipo: 'macizo' | Abertura['tipo'] }[] = [];
    let s = -Infinity;
    for (const ab of aberturasDe(m, aberturas)) {
      if (ab.s0 > s) tramos.push({ s0: s, s1: ab.s0, tipo: 'macizo' });
      if (ab.s1 > Math.max(s, ab.s0)) tramos.push({ s0: Math.max(s, ab.s0), s1: ab.s1, tipo: ab.tipo });
      s = Math.max(s, ab.s1);
    }
    tramos.push({ s0: s, s1: Infinity, tipo: 'macizo' });
    // Las puntas en inglete se salen de [0, L]: el primer y el último tramo llegan hasta el final del polígono
    const proy = pts.map((p) => p.x * u.x + p.y * u.y - base);
    const min = Math.min(...proy);
    const max = Math.max(...proy);
    for (const t of tramos) {
      const t0 = Math.max(t.s0, min);
      const t1 = Math.min(t.s1, max);
      if (t1 - t0 < 1e-6) continue;
      const n = Math.max(1, Math.ceil((t1 - t0) / PIEZA));
      const alturas: [number, number, 'muro' | 'vidrio'][] =
        t.tipo === 'macizo'
          ? [[0, H, 'muro']]
          : t.tipo === 'puerta'
            ? [[ALTO_PUERTA, H, 'muro']]
            : [
                [0, ANTEPECHO, 'muro'],
                [ANTEPECHO, DINTEL_VENTANA, 'vidrio'],
                [DINTEL_VENTANA, H, 'muro'],
              ];
      for (let i = 0; i < n; i++) {
        const a = t0 + ((t1 - t0) * i) / n;
        const b = t0 + ((t1 - t0) * (i + 1)) / n;
        // Los lados en los extremos del tramo son caras reales (jambas) si el tramo vecino es otra cosa
        const corteIni = i > 0;
        const corteFin = i < n - 1;
        for (const [z0, z1raw, cual] of alturas) {
          const z1 = Math.min(z1raw, H);
          if (z1 - z0 < 1e-6) continue;
          if (cual === 'vidrio') {
            // Vidrio delgado al centro del muro
            const g = Math.min(0.02, m.grosor / 4);
            const n0 = { x: -u.y, y: u.x };
            const c0 = { x: m.a.x + u.x * a, y: m.a.y + u.y * a };
            const c1 = { x: m.a.x + u.x * b, y: m.a.y + u.y * b };
            const v = [
              { x: c0.x + n0.x * g, y: c0.y + n0.y * g },
              { x: c1.x + n0.x * g, y: c1.y + n0.y * g },
              { x: c1.x - n0.x * g, y: c1.y - n0.y * g },
              { x: c0.x - n0.x * g, y: c0.y - n0.y * g },
            ];
            res.push({
              pts: v,
              z0,
              z1,
              corte: [false, corteFin, false, corteIni],
              color: '#7fb4e0',
              luzLados: [0.55, 0.7],
              luzTapa: 0.4,
              borde: '#5b8fbf',
              prof: 0,
              muro: m,
            });
            continue;
          }
          const r = rebanada(pts, u, base + a, base + b, corteIni, corteFin, uniones);
          if (r.pts.length < 3) continue;
          res.push({
            pts: r.pts,
            z0,
            z1,
            corte: r.corte,
            color: m.color,
            luzLados: [0.42, 0.62],
            luzTapa: 0,
            borde: aclarar(m.color, -0.25),
            prof: 0,
            muro: m,
          });
        }
      }
    }
  }
  return res;
}

function prismasMueble(el: Mueble): Prisma[] {
  const alto = alturaMueble(el.clave);
  const nx = Math.max(1, Math.ceil(el.ancho / PIEZA));
  const ny = Math.max(1, Math.ceil(el.alto / PIEZA));
  const res: Prisma[] = [];
  const tapa = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(el.p.x, el.p.y);
    ctx.rotate(el.ang);
    ctx.fillStyle = aclarar(el.color, 0.97);
    ctx.fillRect(-el.ancho / 2, -el.alto / 2, el.ancho, el.alto);
    dibujarSimbolo(ctx, el.clave, el.ancho, el.alto, el.color, 0.02);
    ctx.restore();
  };
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < ny; j++) {
      const x0 = -el.ancho / 2 + (el.ancho * i) / nx;
      const x1 = -el.ancho / 2 + (el.ancho * (i + 1)) / nx;
      const y0 = -el.alto / 2 + (el.alto * j) / ny;
      const y1 = -el.alto / 2 + (el.alto * (j + 1)) / ny;
      const pts = [
        { x: x0, y: y0 },
        { x: x1, y: y0 },
        { x: x1, y: y1 },
        { x: x0, y: y1 },
      ].map((p) => aMundo(p, el.p, el.ang));
      res.push({
        pts,
        z0: 0,
        z1: alto,
        corte: [j > 0, i < nx - 1, j < ny - 1, i > 0],
        color: el.color,
        luzLados: [0.72, 0.86],
        luzTapa: 0.97,
        borde: el.color,
        tapa,
        prof: 0,
      });
    }
  return res;
}

/** Transformación del plano horizontal a altura z (sobre un contexto ya en metros isométricos). */
function plano(ctx: CanvasRenderingContext2D, z: number, giro: number) {
  ctx.translate(0, -z);
  ctx.transform(C, S, -C, S, 0, 0);
  if (giro) ctx.rotate((giro * Math.PI) / 2);
}

/**
 * ¿La pieza de muro da al frente? Lo es si, mirando desde ella hacia el observador, no hay ningún otro muro:
 * son los muros exteriores del lado de la vista, los que tapan el interior.
 */
function esFrontal(p: Prisma, muros: Muro[], giro: number): boolean {
  const m = p.muro;
  if (!m) return false;
  const n = p.pts.length;
  const c = p.pts.reduce((s, q) => ({ x: s.x + q.x / n, y: s.y + q.y / n }), { x: 0, y: 0 });
  // Dirección hacia el observador, en coordenadas del plano
  const d = girar({ x: Math.SQRT1_2, y: Math.SQRT1_2 }, (4 - giro) % 4);
  const o = { x: c.x + d.x * (m.grosor * 0.75 + 0.05), y: c.y + d.y * (m.grosor * 0.75 + 0.05) };
  for (const w of muros) {
    if (w === m) continue;
    const ex = w.b.x - w.a.x;
    const ey = w.b.y - w.a.y;
    const den = d.x * ey - d.y * ex;
    if (Math.abs(den) < 1e-12) continue;
    const ax = w.a.x - o.x;
    const ay = w.a.y - o.y;
    const t = (ax * ey - ay * ex) / den;
    const u = (ax * d.y - ay * d.x) / den;
    if (t > 0 && u >= -1e-6 && u <= 1 + 1e-6) return false;
  }
  return true;
}

function dibujarPrisma(ctx: CanvasRenderingContext2D, p: Prisma, giro: number, pelo: number, modo: 'todo' | 'relleno' | 'bordes' = 'todo') {
  const rellenar = modo !== 'bordes';
  const bordes = modo !== 'relleno';
  const n = p.pts.length;
  const r = p.pts.map((q) => girar(q, giro));
  const cx = r.reduce((s, q) => s + q.x, 0) / n;
  const cy = r.reduce((s, q) => s + q.y, 0) / n;
  const iso = (i: number, z: number) => aIso(p.pts[i % n], z, giro);
  const camino = (qs: Pt[]) => {
    ctx.beginPath();
    qs.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
    ctx.closePath();
  };
  ctx.save();
  ctx.lineJoin = 'round';
  // Caras laterales que miran hacia el observador
  for (let i = 0; i < n; i++) {
    const a = r[i];
    const b = r[(i + 1) % n];
    let nx = b.y - a.y;
    let ny = -(b.x - a.x);
    const l = Math.hypot(nx, ny);
    if (l < 1e-9) continue;
    nx /= l;
    ny /= l;
    if (nx * ((a.x + b.x) / 2 - cx) + ny * ((a.y + b.y) / 2 - cy) < 0) {
      nx = -nx;
      ny = -ny;
    }
    // Las caras de los cortes internos quedan tapadas por la pieza vecina: dibujarlas deja costuras
    if (nx + ny <= 1e-6 || p.corte[i]) continue;
    const cara = [iso(i, p.z0), iso(i + 1, p.z0), iso(i + 1, p.z1), iso(i, p.z1)];
    // La cara que mira a la derecha queda más clara que la que mira a la izquierda
    const luz = p.luzLados[0] + (p.luzLados[1] - p.luzLados[0]) * ((nx - ny + 1) / 2);
    const relleno = aclarar(p.color, luz);
    if (rellenar) {
      camino(cara);
      ctx.fillStyle = relleno;
      ctx.fill();
      ctx.strokeStyle = relleno;
      ctx.lineWidth = pelo;
      ctx.stroke();
    }
    if (bordes) {
      ctx.strokeStyle = p.borde;
      ctx.lineWidth = pelo;
      ctx.beginPath();
      ctx.moveTo(cara[0].x, cara[0].y);
      ctx.lineTo(cara[1].x, cara[1].y);
      ctx.moveTo(cara[3].x, cara[3].y);
      ctx.lineTo(cara[2].x, cara[2].y);
      // Aristas verticales solo en esquinas reales (no donde se troceó)
      if (!p.corte[(i + n - 1) % n]) {
        ctx.moveTo(cara[0].x, cara[0].y);
        ctx.lineTo(cara[3].x, cara[3].y);
      }
      if (!p.corte[(i + 1) % n]) {
        ctx.moveTo(cara[1].x, cara[1].y);
        ctx.lineTo(cara[2].x, cara[2].y);
      }
      ctx.stroke();
    }
  }
  // Tapa
  const tapa = p.pts.map((_, i) => iso(i, p.z1));
  const colorTapa = aclarar(p.color, p.luzTapa);
  if (rellenar) {
    camino(tapa);
    ctx.fillStyle = colorTapa;
    ctx.fill();
    ctx.strokeStyle = colorTapa;
    ctx.lineWidth = pelo;
    ctx.stroke();
  }
  if (p.tapa && rellenar) {
    ctx.save();
    camino(tapa);
    ctx.clip();
    plano(ctx, p.z1, giro);
    p.tapa(ctx);
    ctx.restore();
  }
  if (!bordes) {
    ctx.restore();
    return;
  }
  ctx.strokeStyle = p.borde;
  ctx.lineWidth = pelo;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    if (p.corte[i]) continue;
    ctx.moveTo(tapa[i].x, tapa[i].y);
    ctx.lineTo(tapa[(i + 1) % n].x, tapa[(i + 1) % n].y);
  }
  ctx.stroke();
  ctx.restore();
}

export interface OpcionesDibujoIso {
  ancho: number;
  alto: number;
  fondo?: string;
}

/**
 * Indicador de orientación para la vista isométrica: junto a la esquina superior derecha del dibujo
 * (dentro del lienzo, para que siempre se vea), con la flecha apuntando al punto cardinal ya proyectado.
 * `esquina` es la esquina superior derecha del dibujo en píxeles. Medidas en píxeles.
 */
function rosaIso(ctx: CanvasRenderingContext2D, n: Norte, giro: number, ancho: number, alto: number, esquina: Pt) {
  const r = Math.max(20, Math.min(ancho, alto) * 0.045);
  const m = r * 1.9;
  const c = {
    x: Math.min(ancho - m, Math.max(m, esquina.x - r * 1.2)),
    y: Math.min(alto - m, Math.max(m, esquina.y + r * 1.4)),
  };
  // Dirección del norte en el plano, proyectada
  const o = aIso({ x: 0, y: 0 }, 0, giro);
  const q = aIso({ x: Math.sin(n.ang), y: -Math.cos(n.ang) }, 0, giro);
  const l = Math.hypot(q.x - o.x, q.y - o.y) || 1;
  const d = { x: (q.x - o.x) / l, y: (q.y - o.y) / l };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Elipse del piso, como un plato visto en isométrico
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, r, r * S / C, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(17,24,39,0.22)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Flecha: la mitad sur gris, la mitad norte roja
  const largo = r * 0.85;
  const punta = { x: c.x + d.x * largo, y: c.y + d.y * largo };
  const cola = { x: c.x - d.x * largo * 0.7, y: c.y - d.y * largo * 0.7 };
  ctx.strokeStyle = 'rgba(17,24,39,0.35)';
  ctx.lineWidth = Math.max(1.5, r * 0.09);
  ctx.beginPath();
  ctx.moveTo(cola.x, cola.y);
  ctx.lineTo(c.x, c.y);
  ctx.stroke();
  ctx.strokeStyle = '#dc2626';
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(punta.x - d.x * r * 0.25, punta.y - d.y * r * 0.25);
  ctx.stroke();
  const w = r * 0.18;
  ctx.beginPath();
  ctx.moveTo(punta.x, punta.y);
  ctx.lineTo(punta.x - d.x * r * 0.32 - d.y * w, punta.y - d.y * r * 0.32 + d.x * w);
  ctx.lineTo(punta.x - d.x * r * 0.32 + d.y * w, punta.y - d.y * r * 0.32 - d.x * w);
  ctx.closePath();
  ctx.fill();
  // Letra junto a la punta, siempre derecha
  const f = Math.round(r * 0.62);
  ctx.font = `bold ${f}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const pn = { x: c.x + d.x * (largo + f * 0.75), y: c.y + d.y * (largo + f * 0.75) };
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  const letra = n.punto ?? 'N';
  ctx.strokeText(letra, pn.x, pn.y);
  ctx.fillStyle = '#111827';
  ctx.fillText(letra, pn.x, pn.y);
  ctx.restore();
}

/** Dibuja el croquis en vista isométrica. El contexto debe venir en píxeles CSS (sin escala de mundo). */
export function dibujarIsometrico(ctx: CanvasRenderingContext2D, d: DatosCroquis, v: Vista, o: OpcionesDibujoIso) {
  const fondo = o.fondo ?? '#ffffff';
  const iso = opcionesIso(d);
  const g = iso.giro;
  const todos = ordenar(d.elementos);
  const muros = todos.filter((e): e is Muro => e.tipo === 'muro');
  const aberturas = todos.filter((e): e is Abertura => e.tipo === 'puerta' || e.tipo === 'ventana');
  const enMuro = new Set(
    aberturas.filter((ab) => muros.some((m) => dist(m.a, m.b) > 1e-9 && aberturasDe(m, [ab]).length)).map((ab) => ab.id),
  );
  const pelo = 1 / v.escala;

  ctx.save();
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, o.ancho, o.alto);
  ctx.translate(v.ox, v.oy);
  ctx.scale(v.escala, v.escala);

  // 1. Piso: áreas, líneas, cotas, accesos, giros de puertas y muebles planos, como pintados en el suelo
  ctx.save();
  plano(ctx, 0, g);
  for (const el of todos) {
    let piso: Elemento | null = null;
    if (el.tipo === 'area') piso = { ...el, nombre: '', mostrarM2: false };
    else if (el.tipo === 'acceso') piso = { ...el, texto: '' };
    else if (el.tipo === 'mueble') piso = alturaMueble(el.clave) <= 0.05 ? { ...el, etiqueta: '' } : null;
    else if (el.tipo === 'puerta') piso = el;
    else if (el.tipo === 'ventana') piso = enMuro.has(el.id) ? null : el;
    else if (el.tipo === 'linea' || el.tipo === 'trazo' || el.tipo === 'cota') piso = el;
    if (piso) dibujarElemento(ctx, piso, { ...d, opciones: { ...d.opciones, medidasMuros: false } }, v.escala, fondo);
  }
  ctx.restore();

  // 2. Volúmenes, de atrás hacia adelante
  const prismas = prismasMuros(muros, aberturas, iso);
  for (const el of todos) if (el.tipo === 'mueble' && alturaMueble(el.clave) > 0.05) prismas.push(...prismasMueble(el));
  for (const p of prismas) {
    const c = p.pts.reduce((s, q) => ({ x: s.x + q.x / p.pts.length, y: s.y + q.y / p.pts.length }), { x: 0, y: 0 });
    const r = girar(c, g);
    p.prof = r.x + r.y;
  }
  prismas.sort((a, b) => a.prof - b.prof || a.z0 - b.z0);
  const frontales = iso.transparencia > 0 ? prismas.filter((p) => (p.frontal = esFrontal(p, muros, g))) : [];
  for (const p of prismas) if (!p.frontal) dibujarPrisma(ctx, p, g, pelo);
  if (frontales.length) {
    // Planta de los muros frontales en el piso: queda como la franja del corte, como en un plano
    ctx.save();
    for (const p of frontales) {
      if (p.z0 > 1e-6 || p.color !== p.muro?.color) continue;
      ctx.beginPath();
      p.pts.forEach((q, i) => {
        const s = aIso(q, 0, g);
        if (i) ctx.lineTo(s.x, s.y);
        else ctx.moveTo(s.x, s.y);
      });
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = pelo;
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    // Los muros frontales se pintan opacos en una capa aparte y se pegan con transparencia,
    // para que las caras que se enciman no se vean más oscuras; luego van sus contornos completos.
    const capa = document.createElement('canvas');
    capa.width = ctx.canvas.width;
    capa.height = ctx.canvas.height;
    const cc = capa.getContext('2d')!;
    cc.setTransform(ctx.getTransform());
    for (const p of frontales) dibujarPrisma(cc, p, g, pelo, 'relleno');
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1 - iso.transparencia;
    ctx.drawImage(capa, 0, 0);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = Math.max(0.55, 1 - iso.transparencia);
    for (const p of frontales) dibujarPrisma(ctx, p, g, pelo, 'bordes');
    ctx.restore();
  }

  // 3. Etiquetas, siempre de frente y encima de todo
  const tamMin = Math.max(0.16, 9 / v.escala);
  for (const el of todos) {
    if (el.tipo === 'area') {
      const etq = [el.nombre, el.mostrarM2 && el.puntos.length > 2 ? `${areaPoligono(el.puntos).toFixed(2)} m²` : ''].filter(Boolean).join('\n');
      if (etq && el.puntos.length > 1)
        textoMundo(ctx, etq, aIso(posEtiqueta(el), 0, g), el.tamEtq ?? 0.3, el.colorEtq ?? '#111827', {
          alinear: 'center',
          base: 'middle',
          negrita: true,
          halo: true,
        });
    } else if (el.tipo === 'texto') {
      textoMundo(ctx, el.texto, aIso(el.p, 0, g), el.tam, el.color, { negrita: el.negrita, halo: true });
    } else if (el.tipo === 'mueble' && el.etiqueta) {
      let texto = el.etiqueta;
      let tam = tamMin;
      if (el.ajustarEtq) {
        const r = ajustarTexto(ctx, el.etiqueta, Math.max(el.ancho, el.alto) * 0.92, Math.min(el.ancho, el.alto) * 0.92 + 0.3, tam);
        texto = r.lineas.join('\n');
        tam = r.tam;
      }
      const z = alturaMueble(el.clave);
      textoMundo(ctx, texto, aIso(el.p, z > 0.05 ? z : 0, g), tam, '#111827', { alinear: 'center', base: 'middle', halo: true });
    } else if (el.tipo === 'acceso' && el.texto) {
      const ang = Math.atan2(el.b.y - el.a.y, el.b.x - el.a.x);
      const pa = { x: el.a.x - Math.cos(ang) * 0.12, y: el.a.y - Math.sin(ang) * 0.12 };
      textoMundo(ctx, el.texto, aIso(pa, 0, g), 0.25, el.color, { alinear: 'center', base: 'middle', negrita: true, halo: true });
    }
  }
  ctx.restore();
  const norte = d.elementos.find((e): e is Norte => e.tipo === 'norte');
  if (norte) {
    const c = cajaIso(d, iso) ?? { minx: 0, miny: 0, maxx: 0, maxy: 0 };
    rosaIso(ctx, norte, g, o.ancho, o.alto, { x: c.maxx * v.escala + v.ox, y: c.miny * v.escala + v.oy });
  }
}
