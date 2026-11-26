/**
 * Imágenes del croquis: caché de las imágenes ya decodificadas (el dibujo es síncrono)
 * y preparación de los archivos que se pegan o se arrastran al editor.
 */
import type { DatosCroquis } from './modelo';

const cache = new Map<string, HTMLImageElement>();
const avisos = new Set<() => void>();

/** Llama a `fn` cada vez que termina de cargar una imagen (para volver a dibujar). Devuelve cómo dejar de escuchar. */
export function alCargarImagen(fn: () => void): () => void {
  avisos.add(fn);
  return () => avisos.delete(fn);
}

/** Imagen lista para dibujar, o null mientras se decodifica. */
export function imagenLista(url: string | undefined): HTMLImageElement | null {
  if (!url) return null;
  let img = cache.get(url);
  if (!img) {
    img = new Image();
    img.onload = () => avisos.forEach((f) => f());
    img.src = url;
    cache.set(url, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

/** Espera a que estén cargadas todas las imágenes del croquis (antes de exportar sin el editor abierto). */
export async function precargarImagenes(d: DatosCroquis): Promise<void> {
  const urls = d.elementos.flatMap((e) => (e.tipo === 'imagen' && d.imagenes?.[e.img] ? [d.imagenes[e.img]] : []));
  await Promise.all(
    urls.map((u) => {
      imagenLista(u);
      const img = cache.get(u)!;
      return img.decode().catch(() => undefined);
    }),
  );
}

/** Lado máximo, en píxeles, con el que se guarda una imagen pegada (las fotos grandes se achican). */
const LADO_MAX = 2400;

export interface ImagenPreparada {
  url: string;
  ancho: number;
  alto: number;
}

/** Lee un archivo de imagen y lo deja como data URL, achicándolo si es muy grande. */
export async function prepararImagen(archivo: Blob): Promise<ImagenPreparada> {
  const original = await new Promise<string>((ok, mal) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => mal(r.error);
    r.readAsDataURL(archivo);
  });
  const img = new Image();
  img.src = original;
  await img.decode();
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const k = Math.min(1, LADO_MAX / Math.max(w, h));
  // Las imágenes chicas (y los SVG o GIF) se guardan tal cual
  if (k === 1 && original.length < 3_000_000) return { url: original, ancho: w, alto: h };
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * k));
  c.height = Math.max(1, Math.round(h * k));
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  // Las fotos van en JPEG (pesan mucho menos); las que pueden tener partes transparentes, en PNG
  const conAlfa = /^data:image\/(png|gif|webp|svg)/.test(original);
  const url = conAlfa ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.88);
  return { url, ancho: c.width, alto: c.height };
}
