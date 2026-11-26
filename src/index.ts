/**
 * API pública de Croquis, pensada para incrustarse en otras apps (p. ej. Actas Offline).
 *
 *   const r = await Croquis.abrir({ datos: acta.croquis, titulo: 'Croquis del establecimiento' });
 *   if (r) { acta.croquis = r.datos; acta.croquisPNG = r.png; }
 */
import { Editor, type OpcionesEditor, type ResultadoCroquis } from './editor';
import { exportarPNG, type OpcionesExportar } from './exportar';
import { precargarImagenes } from './imagenes';
import { datosVacios, normalizarDatos, type DatosCroquis } from './modelo';

export type { DatosCroquis, ResultadoCroquis, OpcionesExportar };
export { Editor };

export const version = '0.2.0';

export interface OpcionesAbrir {
  /** Croquis guardado anteriormente para seguir editándolo. */
  datos?: DatosCroquis | null;
  titulo?: string;
  tema?: 'claro' | 'oscuro';
  /** Opciones de la imagen PNG que se devuelve al guardar. */
  exportar?: OpcionesExportar;
}

/**
 * Abre el editor en una ventana a pantalla completa sobre la página.
 * Resuelve con el croquis (datos + PNG) al pulsar "Guardar croquis", o con null si se cancela.
 */
export function abrir(o: OpcionesAbrir = {}): Promise<ResultadoCroquis | null> {
  return new Promise((resolver) => {
    const fondo = document.createElement('div');
    fondo.className = 'crq-modal';
    document.body.append(fondo);
    const desbordePrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const cerrar = (r: ResultadoCroquis | null) => {
      editor.destruir();
      fondo.remove();
      document.body.style.overflow = desbordePrevio;
      resolver(r);
    };
    const editor = new Editor(fondo, {
      ...o,
      modo: 'modal',
      alGuardar: (r) => cerrar(r),
      alCancelar: () => cerrar(null),
    });
  });
}

/** Monta el editor dentro de un contenedor propio (ocupa el 100% del contenedor). */
export function montar(contenedor: HTMLElement, o: OpcionesEditor = {}): Editor {
  return new Editor(contenedor, o);
}

/**
 * Genera la imagen PNG de un croquis guardado sin abrir el editor.
 * Si el croquis tiene imágenes pegadas, usa `imagenConFotos()` (la primera vez hay que esperar a que se carguen).
 */
export function imagen(datos: DatosCroquis, o?: OpcionesExportar) {
  return exportarPNG(normalizarDatos(datos), o);
}

export { datosVacios, normalizarDatos };

/** Como `imagen()`, pero espera a que se carguen las imágenes pegadas en el croquis. */
export async function imagenConFotos(datos: DatosCroquis, o?: OpcionesExportar) {
  const d = normalizarDatos(datos);
  await precargarImagenes(d);
  return exportarPNG(d, o);
}
