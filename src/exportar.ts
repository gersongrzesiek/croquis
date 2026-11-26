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
  /**
   * Píxeles por metro de la imagen (p. ej. los del zoom con que se está viendo el croquis).
   * Si se da, la imagen sale a ese tamaño en vez de ajustarse a anchoMax × altoMax
   * (solo se reduce si pasa del límite que admite el navegador).
   */
  escala?: number;
}

/** Lado máximo y área máxima de un lienzo que los navegadores dibujan sin problemas. */
const LADO_LIMITE = 16000;
const AREA_LIMITE = 120_000_000;

/** Escala de la imagen: la pedida (limitada a lo que cabe en un lienzo) o la que ajusta al tamaño máximo. */
function escalaImagen(w: number, h: number, anchoMax: number, altoMax: number, fija?: number) {
  if (fija && fija > 0) return Math.min(fija, LADO_LIMITE / w, LADO_LIMITE / h, Math.sqrt(AREA_LIMITE / (w * h)));
  return Math.min(anchoMax / w, altoMax / h, 200);
}

/** Tamaño en píxeles que tendría la imagen a una escala dada (para avisar antes de descargar). */
export function tamanoImagen(datos: DatosCroquis, escala: number, margen = 0.5, vista = datos.opciones.vista): { ancho: number; alto: number; reducida: boolean } {
  let w: number;
  let h: number;
  if (vista === 'isometrico') {
    const caja = cajaIso(datos, opcionesIso(datos)) ?? { minx: -3, miny: -2, maxx: 3, maxy: 2 };
    w = caja.maxx - caja.minx + margen * 2;
    h = caja.maxy - caja.miny + margen * 2;
  } else {
    const caja = cajaDeTodos(datos.elementos) ?? { minx: 0, miny: 0, maxx: 4, maxy: 3 };
    w = caja.maxx - caja.minx + margen * 2;
    h = caja.maxy - caja.miny + margen * 2 + 0.9;
  }
  const k = escalaImagen(w, h, 0, 0, escala);
  return { ancho: Math.max(1, Math.round(w * k)), alto: Math.max(1, Math.round(h * k)), reducida: k < escala - 1e-9 };
}

export interface ImagenCroquis {
  /** Imagen PNG como data URL, lista para jsPDF.addImage(). */
  png: string;
  ancho: number;
  alto: number;
}

/** Genera la imagen PNG del croquis ajustada a su contenido. */
export function exportarPNG(datos: DatosCroquis, o: OpcionesExportar = {}): ImagenCroquis {
  // Con las imágenes ocultas, tampoco cuentan para el tamaño de la imagen
  if (datos.opciones.ocultarImagenes) datos = { ...datos, elementos: datos.elementos.filter((e) => e.tipo !== 'imagen') };
  const anchoMax = o.anchoMax ?? 2000;
  const altoMax = o.altoMax ?? 2000;
  const margen = o.margen ?? 0.5;
  if ((o.vista ?? datos.opciones.vista) === 'isometrico') return exportarIso(datos, anchoMax, altoMax, margen, o.escala);
  const barra = o.barraEscala ?? true;
  const caja = cajaDeTodos(datos.elementos) ?? { minx: 0, miny: 0, maxx: 4, maxy: 3 };
  const w = caja.maxx - caja.minx + margen * 2;
  const h = caja.maxy - caja.miny + margen * 2 + (barra ? 0.9 : 0);
  const escala = escalaImagen(w, h, anchoMax, altoMax, o.escala);
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
function exportarIso(datos: DatosCroquis, anchoMax: number, altoMax: number, margen: number, fija?: number): ImagenCroquis {
  const iso = opcionesIso(datos);
  const caja = cajaIso(datos, iso) ?? { minx: -3, miny: -2, maxx: 3, maxy: 2 };
  const w = caja.maxx - caja.minx + margen * 2;
  const h = caja.maxy - caja.miny + margen * 2;
  const escala = escalaImagen(w, h, anchoMax, altoMax, fija);
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
