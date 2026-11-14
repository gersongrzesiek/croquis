import { cajaDeTodos } from './elementos';
import type { DatosCroquis } from './modelo';
import { cajaIso, dibujarIsometrico, opcionesIso } from './isometrico';
import { dibujarBarraEscala, dibujarEscena } from './render';

export interface OpcionesExportar {
  /** Ancho máximo de la imagen en píxeles (por defecto 2000). */
  anchoMax?: number;
  /** Alto máximo de la imagen en píxeles (por defecto 2000). */
  altoMax?: number;
  /** Dibuja la cuadrícula de fondo (por defecto no). */
  cuadricula?: boolean;
  /** Dibuja la barra de escala (por defecto sí). */
  barraEscala?: boolean;
  /** Margen alrededor del dibujo, en metros (por defecto 0.5). */
  margen?: number;
  /** Vista de la imagen; por defecto la que tenga guardada el croquis (plano o isométrica). */
  vista?: 'plano' | 'isometrico';
}

export interface ImagenCroquis {
  /** Imagen PNG como data URL, lista para jsPDF.addImage(). */
  png: string;
  ancho: number;
  alto: number;
}

/** Genera la imagen PNG del croquis ajustada a su contenido. */
export function exportarPNG(datos: DatosCroquis, o: OpcionesExportar = {}): ImagenCroquis {
  const anchoMax = o.anchoMax ?? 2000;
  const altoMax = o.altoMax ?? 2000;
  const margen = o.margen ?? 0.5;
  if ((o.vista ?? datos.opciones.vista) === 'isometrico') return exportarIso(datos, anchoMax, altoMax, margen);
  const barra = o.barraEscala ?? true;
  const caja = cajaDeTodos(datos.elementos) ?? { minx: 0, miny: 0, maxx: 4, maxy: 3 };
  const w = caja.maxx - caja.minx + margen * 2;
  const h = caja.maxy - caja.miny + margen * 2 + (barra ? 0.9 : 0);
  const escala = Math.min(anchoMax / w, altoMax / h, 200);
  const ancho = Math.max(1, Math.round(w * escala));
  const alto = Math.max(1, Math.round(h * escala));
  const c = document.createElement('canvas');
  c.width = ancho;
  c.height = alto;
  const ctx = c.getContext('2d')!;
  const vista = { escala, ox: (margen - caja.minx) * escala, oy: (margen - caja.miny) * escala };
  dibujarEscena(ctx, datos, vista, { ancho, alto, cuadricula: !!o.cuadricula });
  if (barra) dibujarBarraEscala(ctx, escala, margen * escala, alto - 0.15 * escala, ancho);
  return { png: c.toDataURL('image/png'), ancho, alto };
}

/** Imagen de la vista isométrica, ajustada a su contenido (sin barra de escala: la isométrica no tiene una sola escala). */
function exportarIso(datos: DatosCroquis, anchoMax: number, altoMax: number, margen: number): ImagenCroquis {
  const iso = opcionesIso(datos);
  const caja = cajaIso(datos, iso) ?? { minx: -3, miny: -2, maxx: 3, maxy: 2 };
  const w = caja.maxx - caja.minx + margen * 2;
  const h = caja.maxy - caja.miny + margen * 2;
  const escala = Math.min(anchoMax / w, altoMax / h, 200);
  const ancho = Math.max(1, Math.round(w * escala));
  const alto = Math.max(1, Math.round(h * escala));
  const c = document.createElement('canvas');
  c.width = ancho;
  c.height = alto;
  const ctx = c.getContext('2d')!;
  const vista = { escala, ox: (margen - caja.minx) * escala, oy: (margen - caja.miny) * escala };
  dibujarIsometrico(ctx, datos, vista, { ancho, alto });
  return { png: c.toDataURL('image/png'), ancho, alto };
}
