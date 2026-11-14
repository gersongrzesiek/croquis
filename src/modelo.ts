/** Todas las coordenadas y medidas del croquis están en metros. */
export type Pt = { x: number; y: number };
export type Patron = 'ninguno' | 'diagonal' | 'cruzado' | 'horizontal' | 'puntos';

interface Base {
  id: string;
}
export interface Muro extends Base {
  tipo: 'muro';
  a: Pt;
  b: Pt;
  grosor: number;
  color: string;
  /** Si el muro es el corte diagonal de una esquina: la esquina original y los muros vecinos (en a y en b). */
  chaflan?: { q: Pt; muros: [string, string] };
}
export interface Abertura extends Base {
  tipo: 'puerta' | 'ventana';
  /** Centro de la abertura. */
  p: Pt;
  /** Ángulo del muro en radianes. */
  ang: number;
  ancho: number;
  /** Grosor del muro donde está colocada. */
  grosor: number;
  /** Abre hacia el otro lado del muro. */
  invertir: boolean;
  /** Bisagra del otro lado. */
  espejo: boolean;
  /** Doble abatimiento (abre hacia ambos lados, de vaivén). */
  vaiven?: boolean;
  /** Número de hojas: 2 = doble puerta (tipo quirófano). */
  hojas?: 1 | 2;
  color: string;
}
export interface Area extends Base {
  tipo: 'area';
  puntos: Pt[];
  relleno: string;
  opacidad: number;
  patron: Patron;
  borde: string;
  /** Texto de la etiqueta del área o cuarto. */
  nombre: string;
  mostrarM2: boolean;
  /** Tamaño de letra de la etiqueta, en metros (0.3 por defecto). */
  tamEtq?: number;
  colorEtq?: string;
  /** Posición de la etiqueta; si no hay, va en el centro del área. */
  etqPos?: Pt | null;
  /** Si es el piso de un cuarto: ids de sus muros, en orden. El área sigue a los muros. */
  muros?: string[];
}
export interface Mueble extends Base {
  tipo: 'mueble';
  clave: string;
  p: Pt;
  ancho: number;
  alto: number;
  ang: number;
  color: string;
  etiqueta: string;
  /** Acomoda la etiqueta en varias líneas y achica la letra para que quepa dentro del mueble. */
  ajustarEtq?: boolean;
}
export interface Texto extends Base {
  tipo: 'texto';
  p: Pt;
  texto: string;
  tam: number;
  color: string;
  negrita: boolean;
  ang: number;
}
export interface Acceso extends Base {
  tipo: 'acceso';
  a: Pt;
  b: Pt;
  color: string;
  texto: string;
}
export interface Cota extends Base {
  tipo: 'cota';
  a: Pt;
  b: Pt;
  color: string;
}
export interface Linea extends Base {
  tipo: 'linea';
  a: Pt;
  b: Pt;
  color: string;
  grosor: number;
  discontinua: boolean;
}
export interface Trazo extends Base {
  tipo: 'trazo';
  puntos: Pt[];
  color: string;
  grosor: number;
}

/** Indicador del norte: una N con una flecha roja que apunta al norte. */
export interface Norte extends Base {
  tipo: 'norte';
  p: Pt;
  /** Hacia dónde apunta la flecha, en radianes (0 = hacia arriba del plano, sentido horario). */
  ang: number;
  /** Alto de la N, en metros. */
  tam: number;
}

export type Elemento = Muro | Abertura | Area | Mueble | Texto | Acceso | Cota | Linea | Trazo | Norte;
export type ConDosPuntos = Muro | Acceso | Cota | Linea;

export interface DatosCroquis {
  version: 1;
  elementos: Elemento[];
  opciones: {
    /** Muestra la longitud de cada muro. */
    medidasMuros: boolean;
    /** Vista con la que se muestra y exporta el croquis (por defecto el plano). */
    vista?: 'plano' | 'isometrico';
    /** Altura de los muros en la vista isométrica, en metros (2.5 por defecto). */
    alturaMuros?: number;
    /** Giro de la vista isométrica en cuartos de vuelta (0 a 3). */
    giroIso?: number;
    /** Transparencia de los muros frontales en la vista isométrica, en % (0 = opacos). */
    transparenciaFrontal?: number;
  };
}

export function datosVacios(): DatosCroquis {
  return { version: 1, elementos: [], opciones: { medidasMuros: true } };
}

/** Acepta datos guardados (o nada) y devuelve un croquis válido. */
export function normalizarDatos(d: unknown): DatosCroquis {
  const base = datosVacios();
  if (!d || typeof d !== 'object') return base;
  const o = d as Partial<DatosCroquis>;
  return {
    version: 1,
    elementos: Array.isArray(o.elementos) ? o.elementos : [],
    opciones: { ...base.opciones, ...(o.opciones ?? {}) },
  };
}

let contador = 0;
export function nuevoId(): string {
  contador++;
  return Date.now().toString(36) + contador.toString(36) + Math.random().toString(36).slice(2, 6);
}

export function tieneDosPuntos(el: Elemento): el is ConDosPuntos {
  return el.tipo === 'muro' || el.tipo === 'acceso' || el.tipo === 'cota' || el.tipo === 'linea';
}
