import { cajaDeTodos } from './elementos';
import type { DatosCroquis } from './modelo';
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
