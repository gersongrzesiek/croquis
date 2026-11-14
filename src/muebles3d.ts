/**
 * Modelos 3D sencillos del mobiliario para la vista isométrica: cada mueble se arma con piezas
 * (cubiertas, patas, respaldos, entrepaños, cilindros…) en lugar de una sola caja.
 *
 * Convención del catálogo: en coordenadas locales del mueble, el lado de y negativa es la parte
 * de atrás (respaldo de la silla, tanque del WC, cabecera de la cama). Medidas en metros.
 */
import { aMundo } from './geometria';
import type { Mueble, Pt } from './modelo';

export interface Material {
  color: string;
  /** Cuánto se aclaran las caras laterales (de la más oscura a la más clara) y la tapa. */
  luzLados: [number, number];
  luzTapa: number;
}

export const MAT = {
  blanco: { color: '#cbd2da', luzLados: [0.45, 0.7], luzTapa: 0.9 },
  metal: { color: '#94a3b8', luzLados: [0.25, 0.5], luzTapa: 0.62 },
  oscuro: { color: '#374151', luzLados: [0.08, 0.28], luzTapa: 0.2 },
  negro: { color: '#1f2937', luzLados: [0, 0.15], luzTapa: 0.12 },
  madera: { color: '#a47551', luzLados: [0.15, 0.35], luzTapa: 0.42 },
  rojo: { color: '#dc2626', luzLados: [0.08, 0.3], luzTapa: 0.38 },
  verde: { color: '#16a34a', luzLados: [0.1, 0.3], luzTapa: 0.4 },
  amarillo: { color: '#eab308', luzLados: [0.1, 0.3], luzTapa: 0.4 },
  tapiz: { color: '#5b8fd6', luzLados: [0.3, 0.5], luzTapa: 0.6 },
  cristal: { color: '#7fb4e0', luzLados: [0.5, 0.65], luzTapa: 0.45 },
  piel: { color: '#c99a74', luzLados: [0.1, 0.3], luzTapa: 0.4 },
  bota: { color: '#60a5fa', luzLados: [0.15, 0.4], luzTapa: 0.5 },
  maniqui: { color: '#8f949c', luzLados: [0.02, 0.5], luzTapa: 0.62 },
} satisfies Record<string, Material>;

export interface Pieza {
  /** Polígono convexo en el plano (coordenadas del croquis). */
  pts: Pt[];
  z0: number;
  z1: number;
  mat: Material;
  /** Dibujar el símbolo del plano sobre esta pieza (estufas, tarjas, consolas…). */
  simbolo?: boolean;
  /** Superficie curva (cilindro): sin aristas verticales entre sus caras. */
  liso?: boolean;
  /** Lados que son uniones con otra pieza (sin línea de borde). Si se da, la pieza no se trocea. */
  corte?: boolean[];
  /**
   * Superficie libre (caras planas en 3D, en coordenadas del plano) para formas que no son
   * extrusiones verticales, como el arco en C. `pts` queda como la huella que la contiene.
   */
  malla?: CaraMalla[];
}

export interface CaraMalla {
  pts: { p: Pt; z: number }[];
  /** Qué lados llevan línea de borde (por omisión, todos). */
  bordes?: boolean[];
  /** Normal hacia afuera (en coordenadas del plano): con ella se ocultan las caras de atrás. */
  n?: { x: number; y: number; z: number };
  /** Material propio de la cara (si no, el de la pieza). */
  mat?: Material;
  /** Dibuja la retícula de la malla con un tono más oscuro (aspecto de maniquí). */
  trama?: boolean;
}

/** Punto de salida del haz de rayos X (centro de la cara frontal del tubo), en el plano y su altura. */
export function focoRayos(el: Mueble): { p: Pt; z: number } {
  return { p: aMundo({ x: 0, y: el.alto / 2 }, el.p, el.ang), z: 1.3 };
}

/** Piezas que forman el mueble. Una lista vacía significa que va plano en el piso (señales, coladeras…). */
export function modeloMueble(el: Mueble): Pieza[] {
  const W = el.ancho;
  const D = el.alto;
  const m = Math.min(W, D);
  const piezas: Pieza[] = [];
  const mundo = (x: number, y: number) => aMundo({ x, y }, el.p, el.ang);

  /** Caja en metros locales (x0..x1 a lo ancho, y0..y1 de atrás hacia adelante, medidos desde el centro). */
  const cajaM = (x0: number, y0: number, x1: number, y1: number, z0: number, z1: number, mat: Material, simbolo = false) => {
    if (x1 - x0 < 1e-4 || y1 - y0 < 1e-4 || z1 - z0 < 1e-4) return;
    piezas.push({ pts: [mundo(x0, y0), mundo(x1, y0), mundo(x1, y1), mundo(x0, y1)], z0, z1, mat, simbolo });
  };
  /** Caja en fracciones de la huella (0..1; fy = 0 es la parte de atrás). */
  const caja = (fx0: number, fy0: number, fx1: number, fy1: number, z0: number, z1: number, mat: Material, simbolo = false) =>
    cajaM(-W / 2 + W * fx0, -D / 2 + D * fy0, -W / 2 + W * fx1, -D / 2 + D * fy1, z0, z1, mat, simbolo);
  /** Cilindro (o elipse) con centro en metros locales. */
  const cil = (cx: number, cy: number, rx: number, ry: number, z0: number, z1: number, mat: Material, lados = 14) => {
    const pts: Pt[] = [];
    for (let i = 0; i < lados; i++) {
      const a = (i / lados) * Math.PI * 2;
      pts.push(mundo(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry));
    }
    piezas.push({ pts, z0, z1, mat, liso: true });
  };
  /** Cilindro con centro en fracciones de la huella. */
  const cilF = (fx: number, fy: number, rx: number, ry: number, z0: number, z1: number, mat: Material, lados = 14) =>
    cil(-W / 2 + W * fx, -D / 2 + D * fy, rx, ry, z0, z1, mat, lados);
  /** Cuatro patas cuadradas metidas `ins` desde las esquinas. */
  const patas = (lado: number, ins: number, z1: number, mat: Material, z0 = 0) => {
    for (const sx of [-1, 1])
      for (const sy of [-1, 1]) {
        const cx = sx * (W / 2 - ins - lado / 2);
        const cy = sy * (D / 2 - ins - lado / 2);
        cajaM(cx - lado / 2, cy - lado / 2, cx + lado / 2, cy + lado / 2, z0, z1, mat);
      }
  };
  /** Cuatro ruedas (cilindros bajos) en las esquinas. */
  const ruedas = (r = 0.05) => {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) cil(sx * (W / 2 - r * 1.4), sy * (D / 2 - r * 1.4), r, r, 0, r * 1.6, MAT.negro, 8);
  };
  /** Mesa: cubierta y cuatro patas; con entrepaño bajo si se pide. */
  const mesa = (alto: number, cubierta: Material, pata: Material, grueso = 0.04, entrepano = false) => {
    patas(0.05, 0.03, alto - grueso, pata);
    if (entrepano) caja(0.04, 0.06, 0.96, 0.94, 0.18, 0.21, cubierta);
    caja(0, 0, 1, 1, alto - grueso, alto, cubierta);
  };
  /** Mueble alto con puertas: cuerpo partido en `n` hojas con una ranura entre ellas. */
  const gabinete = (alto: number, n: number, mat: Material, z0 = 0) => {
    const r = 0.012;
    for (let i = 0; i < n; i++) {
      const a = i / n;
      const b = (i + 1) / n;
      caja(a + (i ? r / W : 0), 0, b - (i < n - 1 ? r / W : 0), 1, z0, alto, mat);
    }
  };
  /** Llave de agua (cuello y caño) en la parte de atrás, a la altura de la cubierta. */
  const llave = (fx: number, z: number) => {
    const cy = -D / 2 + Math.min(0.08, D * 0.15);
    const cx = -W / 2 + W * fx;
    cil(cx, cy, 0.018, 0.018, z, z + 0.22, MAT.metal, 8);
    cajaM(cx - 0.015, cy, cx + 0.015, cy + 0.14, z + 0.18, z + 0.22, MAT.metal);
  };
  /** Anaquel abierto: costados, fondo y entrepaños. */
  const anaquel = (alto: number, mat: Material, niveles = 5) => {
    const t = 0.025;
    cajaM(-W / 2, -D / 2, -W / 2 + t, D / 2, 0, alto, mat);
    cajaM(W / 2 - t, -D / 2, W / 2, D / 2, 0, alto, mat);
    cajaM(-W / 2 + t, -D / 2, W / 2 - t, -D / 2 + 0.015, 0, alto, mat);
    for (let i = 0; i < niveles; i++) {
      const z = 0.06 + ((alto - 0.06 - t) * i) / (niveles - 1);
      cajaM(-W / 2 + t, -D / 2 + 0.015, W / 2 - t, D / 2, z, z + t, mat);
    }
  };
  /** Cama o camilla: patas, base, colchón, almohada, cabecera y barandales. */
  const cama = (zBase: number, colchon: Material, cabecera: number, barandales: boolean) => {
    patas(0.05, 0.06, zBase, MAT.metal);
    caja(0.02, 0.01, 0.98, 0.99, zBase, zBase + 0.12, MAT.metal);
    caja(0.03, 0.03, 0.97, 0.97, zBase + 0.12, zBase + 0.27, colchon);
    caja(0.15, 0.04, 0.85, 0.16, zBase + 0.27, zBase + 0.35, MAT.blanco);
    if (cabecera > 0) {
      caja(0, 0, 1, 0.025, zBase, zBase + cabecera, MAT.blanco);
      caja(0, 0.975, 1, 1, zBase, zBase + cabecera * 0.7, MAT.blanco);
    }
    if (barandales) {
      caja(0, 0.22, 0.03, 0.68, zBase + 0.27, zBase + 0.5, MAT.metal);
      caja(0.97, 0.22, 1, 0.68, zBase + 0.27, zBase + 0.5, MAT.metal);
    }
  };
  /** Tarja o lavabo sobre patas o mueble: cubierta con el símbolo y una llave por tina. */
  const tarja = (tinas: number, conMueble: boolean) => {
    const z = 0.9;
    if (conMueble) caja(0, 0.02, 1, 1, 0, z - 0.04, MAT.blanco);
    else patas(0.04, 0.04, z - 0.04, MAT.metal);
    caja(0, 0, 1, 1, z - 0.04, z, MAT.metal, true);
    caja(0, 0, 1, 0.05, z, z + 0.12, MAT.metal);
    for (let i = 0; i < tinas; i++) llave((i + 0.5) / tinas, z);
  };

  switch (el.clave) {
    // ───── General ─────
    case 'mesa':
      mesa(0.75, MAT.madera, MAT.oscuro);
      break;
    case 'mesa-trabajo':
    case 'mesa-chasis':
      mesa(0.9, MAT.blanco, MAT.metal, 0.04, true);
      break;
    case 'mesa-inox':
    case 'mesa-mezclas':
      mesa(0.9, MAT.metal, MAT.metal, 0.03, true);
      break;
    case 'silla':
      patas(0.035, 0.02, 0.43, MAT.oscuro);
      caja(0, 0.08, 1, 1, 0.43, 0.47, MAT.tapiz);
      caja(0.04, 0, 0.96, 0.1, 0.47, 0.88, MAT.tapiz);
      break;
    case 'escritorio': {
      caja(0, 0, 0.03, 1, 0, 0.72, MAT.blanco);
      caja(0.66, 0.02, 0.98, 1, 0, 0.72, MAT.blanco);
      for (let i = 1; i < 3; i++) caja(0.66, 0.995, 0.98, 1.0, (0.72 * i) / 3 - 0.006, (0.72 * i) / 3 + 0.006, MAT.oscuro);
      caja(0.03, 0.02, 0.66, 0.05, 0.35, 0.72, MAT.blanco);
      caja(0, 0, 1, 1, 0.72, 0.76, MAT.madera);
      break;
    }
    case 'anaquel':
      anaquel(1.8, MAT.metal);
      break;
    case 'anaquel-plag':
      anaquel(1.8, MAT.metal);
      caja(0.75, 0.97, 0.95, 1, 1.2, 1.4, MAT.rojo);
      break;
    case 'mostrador':
      caja(0, 0.15, 1, 1, 0, 0.9, MAT.blanco);
      caja(0, 0, 1, 1, 0.9, 0.94, MAT.madera);
      caja(0, 0.75, 1, 1, 0.94, 1.1, MAT.madera);
      break;
    case 'refrigerador':
      caja(0, 0, 1, 1, 0, 1.05, MAT.blanco);
      caja(0, 0, 1, 1, 1.07, 1.75, MAT.blanco);
      caja(0.08, 1, 0.12, 1.04, 0.65, 0.98, MAT.metal);
      caja(0.08, 1, 0.12, 1.04, 1.15, 1.4, MAT.metal);
      break;
    case 'congelador':
      caja(0, 0, 1, 1, 0, 0.82, MAT.blanco);
      caja(0, 0, 1, 1.02, 0.82, 0.88, MAT.blanco);
      caja(0.4, 1.02, 0.6, 1.06, 0.78, 0.84, MAT.metal);
      break;
    case 'estufa':
      caja(0, 0, 1, 1, 0, 0.86, MAT.blanco);
      caja(0.1, 1, 0.9, 1.01, 0.15, 0.6, MAT.oscuro);
      caja(0, 0, 1, 1, 0.86, 0.9, MAT.blanco, true);
      caja(0, 0, 1, 0.06, 0.9, 1.05, MAT.blanco);
      break;
    case 'estufa-ind':
      patas(0.05, 0.03, 0.2, MAT.metal);
      caja(0, 0, 1, 1, 0.2, 0.86, MAT.metal);
      caja(0, 0, 1, 1, 0.86, 0.9, MAT.metal, true);
      caja(0, 0, 1, 0.05, 0.9, 1.1, MAT.metal);
      break;
    case 'horno':
      caja(0, 0, 1, 1, 0, 0.95, MAT.metal);
      caja(0.1, 1, 0.9, 1.01, 0.2, 0.75, MAT.oscuro);
      caja(0.15, 1.01, 0.85, 1.05, 0.78, 0.81, MAT.metal);
      break;
    case 'freidora':
      caja(0, 0, 1, 1, 0, 0.88, MAT.metal);
      caja(0, 0, 1, 1, 0.88, 0.92, MAT.metal, true);
      caja(0, 0, 1, 0.08, 0.92, 1.05, MAT.metal);
      break;
    case 'tarja':
      tarja(1, true);
      break;
    case 'tarja-doble':
    case 'lavabo-cirujano':
      tarja(2, false);
      break;
    case 'tarja-lavado':
      tarja(3, false);
      break;
    case 'lavabo':
    case 'lavamanos':
      cil(0, D * 0.05, Math.min(0.09, W * 0.2), Math.min(0.09, D * 0.2), 0, 0.68, MAT.blanco, 10);
      caja(0, 0, 1, 1, 0.68, 0.84, MAT.blanco, true);
      llave(0.5, 0.84);
      break;
    case 'wc':
      caja(0.04, 0, 0.96, 0.28, 0, 0.78, MAT.blanco);
      cil(0, -D / 2 + D * 0.62, W * 0.3, D * 0.24, 0, 0.36, MAT.blanco);
      cil(0, -D / 2 + D * 0.62, W * 0.45, D * 0.34, 0.36, 0.42, MAT.blanco);
      break;
    case 'tarima':
      for (let i = 0; i < 5; i++) caja(i / 5 + 0.005, 0, (i + 1) / 5 - 0.005, 1, 0.1, 0.14, MAT.madera);
      caja(0, 0.05, 1, 0.15, 0, 0.1, MAT.madera);
      caja(0, 0.45, 1, 0.55, 0, 0.1, MAT.madera);
      caja(0, 0.85, 1, 0.95, 0, 0.1, MAT.madera);
      break;
    case 'caja':
      caja(0, 0, 1, 1, 0, 0.6, MAT.madera);
      break;
    case 'extintor':
      cil(0, 0, m * 0.3, m * 0.3, 0, 0.55, MAT.rojo, 12);
      cil(0, 0, m * 0.12, m * 0.12, 0.55, 0.62, MAT.negro, 8);
      cajaM(-0.02, -0.02, m * 0.35, 0.02, 0.6, 0.63, MAT.negro);
      break;
    case 'botiquin':
      caja(0, 0, 1, 1, 1.2, 1.65, MAT.blanco);
      caja(0.42, 1, 0.58, 1.01, 1.3, 1.55, MAT.verde);
      caja(0.3, 1, 0.7, 1.01, 1.39, 1.46, MAT.verde);
      break;
    case 'bote':
      cil(0, 0, m * 0.45, m * 0.45, 0, 0.55, MAT.metal);
      cil(0, 0, m * 0.48, m * 0.48, 0.55, 0.6, MAT.oscuro);
      break;
    case 'bote-rpbi':
      cil(0, 0, m * 0.45, m * 0.45, 0, 0.55, MAT.rojo);
      cil(0, 0, m * 0.48, m * 0.48, 0.55, 0.6, MAT.rojo);
      break;
    case 'bote-pedal':
      cil(0, -m * 0.05, m * 0.42, m * 0.42, 0, 0.55, MAT.metal);
      cil(0, -m * 0.05, m * 0.44, m * 0.44, 0.55, 0.6, MAT.metal);
      caja(0.35, 0.9, 0.65, 1, 0, 0.04, MAT.negro);
      break;

    // ───── Hospitalario ─────
    case 'cama-hosp':
      cama(0.35, MAT.tapiz, 0.75, true);
      break;
    case 'camilla':
      ruedas();
      caja(0.06, 0.04, 0.94, 0.96, 0.08, 0.55, MAT.metal);
      cama(0.55, MAT.tapiz, 0, true);
      break;
    case 'mesa-exploracion':
      caja(0.02, 0.02, 0.98, 0.98, 0, 0.6, MAT.blanco);
      caja(0.2, 0.98, 0.8, 1, 0.2, 0.3, MAT.metal);
      caja(0, 0.3, 1, 1, 0.6, 0.72, MAT.tapiz);
      caja(0, 0, 1, 0.3, 0.6, 0.72, MAT.tapiz);
      caja(0, 0, 1, 0.16, 0.72, 0.9, MAT.tapiz);
      break;
    case 'transfer-barrera':
      // Solo la barrera fija de acero inoxidable, sin la persona
      cajaM(-W / 2, -D / 2, W / 2, D / 2, 0, 0.47, MAT.metal);
      cajaM(-W / 2 - 0.01, -D / 2 - 0.01, W / 2 + 0.01, D / 2 + 0.01, 0.47, 0.5, MAT.metal);
      break;
    case 'transfer': {
      // Barrera fija de acero inoxidable (para sentarse) y un maniquí liso sentado a horcajadas
      // cambiándose las botas: un pie en el piso y el otro levantado del lado limpio, con las manos en la bota.
      // Todo va en una sola malla para que las caras de la persona y de la barrera se ordenen entre sí.
      const malla = mallaTransfer(W, D, mundo);
      piezas.push({ pts: [mundo(-W / 2, -0.48), mundo(W / 2, -0.48), mundo(W / 2, 0.48), mundo(-W / 2, 0.48)], z0: 0, z1: 1.42, mat: MAT.maniqui, malla });
      break;
    }
    case 'mesa-quirurgica': {
      // Base rectangular, columna, chasis de acero y colchón en secciones (cabeza, espalda, asiento, piernas)
      caja(0.12, 0.38, 0.88, 0.78, 0, 0.12, MAT.metal);
      caja(0.3, 0.3, 0.7, 0.38, 0, 0.08, MAT.metal);
      cil(0, D * 0.02, m * 0.13, m * 0.13, 0.12, 0.62, MAT.metal, 14);
      cil(0, D * 0.02, m * 0.17, m * 0.17, 0.42, 0.46, MAT.metal, 14);
      caja(0.2, 0.3, 0.8, 0.72, 0.62, 0.72, MAT.metal);
      const secciones: [number, number, number][] = [
        [0, 0.13, -0.05],
        [0.15, 0.42, 0],
        [0.43, 0.5, 0],
        [0.51, 0.66, 0],
        [0.68, 1, 0],
      ];
      for (const [a, b, dz] of secciones) {
        caja(0.03, a, 0.97, b, 0.72 + dz, 0.77 + dz, MAT.metal);
        caja(0, a, 1, b, 0.77 + dz, 0.86 + dz, MAT.negro);
      }
      break;
    }
    case 'mesa-rx':
      caja(0.1, 0.25, 0.9, 0.4, 0, 0.7, MAT.blanco);
      caja(0.1, 0.6, 0.9, 0.75, 0, 0.7, MAT.blanco);
      caja(0, 0, 1, 1, 0.7, 0.8, MAT.blanco);
      caja(0.15, 0.35, 0.85, 0.65, 0.8, 0.81, MAT.oscuro);
      break;
    case 'anestesia':
      ruedas();
      caja(0.05, 0.05, 0.95, 0.95, 0.08, 1.0, MAT.blanco);
      caja(0, 0, 1, 1, 1.0, 1.03, MAT.metal);
      caja(0.15, 0.05, 0.85, 0.2, 1.03, 1.45, MAT.oscuro);
      caja(0.18, 0.2, 0.82, 0.21, 1.08, 1.4, MAT.cristal);
      break;
    case 'mesa-mayo':
      caja(0.5, 0.55, 1, 0.65, 0, 0.04, MAT.metal);
      caja(0.5, 0.9, 1, 1, 0, 0.04, MAT.metal);
      caja(0.8, 0.55, 0.9, 1, 0, 0.04, MAT.metal);
      cilF(0.85, 0.75, 0.02, 0.02, 0.04, 0.95, MAT.metal, 8);
      caja(0, 0, 1, 0.55, 0.95, 0.98, MAT.metal);
      break;
    case 'mesa-rinon': {
      // Banda en arco (forma de riñón): la curva abre hacia el frente
      const sag = D * 0.25;
      const banda = D * 0.72;
      const R = (W * W) / 4 / (2 * sag) + sag / 2;
      const cy = -D / 2 + R;
      const amax = Math.asin(Math.min(1, W / 2 / R));
      const N = 10;
      const arco = (r: number, a: number) => ({ x: Math.sin(a) * r, y: cy - Math.cos(a) * r });
      const segmentos = (r0: number, r1: number, z0: number, z1: number, mat: Material) => {
        for (let i = 0; i < N; i++) {
          const a0 = -amax + (2 * amax * i) / N;
          const a1 = -amax + (2 * amax * (i + 1)) / N;
          const q = [arco(r1, a0), arco(r1, a1), arco(r0, a1), arco(r0, a0)];
          piezas.push({ pts: q.map((v) => mundo(v.x, v.y)), z0, z1, mat, corte: [false, i < N - 1, false, i > 0] });
        }
      };
      const ro = R - 0.02;
      const ri = R - banda + 0.02;
      // Patas con ruedas en los extremos y al centro, por fuera y por dentro
      for (const a of [-amax + 0.04, 0, amax - 0.04])
        for (const r of [ro - 0.03, ri + 0.03]) {
          const c = arco(r, a);
          cil(c.x, c.y, 0.018, 0.018, 0.09, 0.95, MAT.metal, 8);
          cil(c.x, c.y, 0.035, 0.035, 0, 0.07, MAT.negro, 8);
        }
      segmentos(R - banda, R, 0.3, 0.33, MAT.metal);
      segmentos(R - banda, R, 0.85, 0.88, MAT.metal);
      // Barandal en el borde de atrás y en los extremos
      segmentos(R - 0.015, R, 0.88, 0.97, MAT.metal);
      for (const s of [-1, 1]) {
        const a = s * (amax - 0.01);
        const p0 = arco(R - banda, a);
        const p1 = arco(R, a);
        const n = { x: Math.cos(a) * 0.008, y: Math.sin(a) * 0.008 };
        piezas.push({
          pts: [mundo(p0.x - n.x, p0.y - n.y), mundo(p1.x - n.x, p1.y - n.y), mundo(p1.x + n.x, p1.y + n.y), mundo(p0.x + n.x, p0.y + n.y)],
          z0: 0.88,
          z1: 0.97,
          mat: MAT.metal,
        });
      }
      break;
    }
    case 'mesa-pasteur':
      mesa(0.85, MAT.metal, MAT.metal, 0.03, true);
      break;
    case 'carro-rojo':
      ruedas();
      caja(0, 0, 1, 1, 0.08, 1.0, MAT.rojo);
      for (let i = 1; i < 5; i++) caja(0.04, 1, 0.96, 1.005, 0.08 + i * 0.18 - 0.006, 0.08 + i * 0.18 + 0.006, MAT.oscuro);
      caja(0, 0, 1, 1, 1.0, 1.03, MAT.oscuro);
      break;
    case 'carro-curacion':
      ruedas();
      patas(0.03, 0.03, 0.88, MAT.metal, 0.08);
      caja(0, 0, 1, 1, 0.3, 0.33, MAT.metal);
      caja(0, 0, 1, 1, 0.85, 0.88, MAT.metal);
      break;
    case 'portasueros':
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        cil(Math.cos(a) * m * 0.4, Math.sin(a) * m * 0.4, 0.03, 0.03, 0, 0.06, MAT.negro, 6);
      }
      cil(0, 0, m * 0.12, m * 0.12, 0.04, 0.1, MAT.metal, 10);
      cil(0, 0, 0.015, 0.015, 0.1, 1.9, MAT.metal, 6);
      cajaM(-0.15, -0.01, 0.15, 0.01, 1.86, 1.89, MAT.metal);
      break;
    case 'asiento-giratorio':
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        cil(Math.cos(a) * m * 0.38, Math.sin(a) * m * 0.38, 0.03, 0.03, 0, 0.05, MAT.negro, 6);
      }
      cil(0, 0, 0.03, 0.03, 0.04, 0.45, MAT.metal, 8);
      cil(0, 0, m * 0.48, m * 0.48, 0.45, 0.52, MAT.tapiz);
      break;
    case 'banqueta':
      caja(0, 0, 1, 1, 0, 0.12, MAT.metal);
      caja(0, 0, 1, 0.5, 0.12, 0.24, MAT.metal);
      break;
    case 'negatoscopio':
      caja(0, 0, 1, 1, 1.1, 1.65, MAT.blanco);
      caja(0.05, 1, 0.95, 1.01, 1.15, 1.6, MAT.cristal);
      break;

    // ───── Rayos X ─────
    case 'tubo-rx':
      caja(0, 0, 1, 1, 0, 0.06, MAT.metal);
      cajaM(-0.08, -D / 2, 0.08, -D / 2 + 0.16, 0.06, 2.1, MAT.blanco);
      cajaM(-0.06, -D / 2 + 0.16, 0.06, D / 2 - 0.05, 1.45, 1.55, MAT.blanco);
      cajaM(-0.18, D / 2 - 0.3, 0.18, D / 2, 1.15, 1.45, MAT.blanco);
      break;
    case 'arco-c': {
      // Arco en C móvil: carro con base y ruedas atrás, brazo horizontal y el arco hacia el frente
      const yb = -D / 2;
      cajaM(-W / 2, yb + 0.04, W / 2, yb + 0.36, 0, 0.13, MAT.oscuro);
      cajaM(-W / 2, yb + 0.36, -W / 2 + 0.13, Math.min(D / 2 - 0.1, 0.25), 0, 0.1, MAT.oscuro);
      cajaM(W / 2 - 0.13, yb + 0.36, W / 2, Math.min(D / 2 - 0.1, 0.25), 0, 0.1, MAT.oscuro);
      for (const sx of [-1, 1]) {
        cil(sx * (W / 2 - 0.065), yb + 0.1, 0.055, 0.055, 0, 0.11, MAT.negro, 8);
        cil(sx * (W / 2 - 0.065), Math.min(D / 2 - 0.1, 0.25) - 0.05, 0.045, 0.045, 0, 0.09, MAT.negro, 8);
      }
      cajaM(-0.33, yb + 0.07, 0.33, yb + 0.71, 0.13, 0.32, MAT.metal);
      cajaM(-0.32, yb + 0.08, 0.32, yb + 0.7, 0.32, 0.95, MAT.blanco);
      cil(0, yb + 0.45, 0.07, 0.07, 0.95, 1.0, MAT.metal);
      cajaM(-0.1, yb + 0.3, 0.1, -0.33, 1.0, 1.14, MAT.blanco);
      cil(0.22, yb + 0.25, 0.025, 0.025, 0.95, 1.25, MAT.metal, 8);
      cajaM(0.1, yb + 0.2, 0.34, yb + 0.26, 1.25, 1.45, MAT.oscuro);
      // El arco: tramos en el plano vertical, abierto hacia el frente
      const yc = 0.25;
      const zc = 1.05;
      const ro = 0.62;
      const ri = 0.53;
      const n = 32;
      const t = 0.07;
      const pt = (r: number, a: number, x: number) => ({ p: mundo(x, yc + r * Math.cos(a)), z: zc + r * Math.sin(a) });
      const angulo = (i: number) => Math.PI / 3 + (i / n) * ((4 * Math.PI) / 3);
      // Tramos agrupados de 4 en 4: cada grupo es una pieza para ordenarse con el resto
      for (let g0 = 0; g0 < n; g0 += 4) {
        const caras: CaraMalla[] = [];
        let y0 = Infinity;
        let y1 = -Infinity;
        let z0 = Infinity;
        let z1 = -Infinity;
        for (let i = g0; i < g0 + 4; i++) {
          const a0 = angulo(i);
          const a1 = angulo(i + 1);
          for (const [r, a] of [[ro, a0], [ro, a1], [ri, a0], [ri, a1]]) {
            y0 = Math.min(y0, yc + r * Math.cos(a));
            y1 = Math.max(y1, yc + r * Math.cos(a));
            z0 = Math.min(z0, zc + r * Math.sin(a));
            z1 = Math.max(z1, zc + r * Math.sin(a));
          }
          // Caras laterales (con borde solo en las curvas), superficie exterior e interior (sin bordes)
          for (const x of [-t, t]) caras.push({ pts: [pt(ro, a0, x), pt(ro, a1, x), pt(ri, a1, x), pt(ri, a0, x)], bordes: [true, false, true, false] });
          for (const r of [ro, ri]) caras.push({ pts: [pt(r, a0, -t), pt(r, a1, -t), pt(r, a1, t), pt(r, a0, t)], bordes: [false, false, false, false] });
        }
        for (const i of [0, n]) if (i === g0 || i === g0 + 4) caras.push({ pts: [pt(ro, angulo(i), -t), pt(ro, angulo(i), t), pt(ri, angulo(i), t), pt(ri, angulo(i), -t)] });
        piezas.push({ pts: [mundo(-t, y0), mundo(t, y0), mundo(t, y1), mundo(-t, y1)], z0, z1, mat: MAT.blanco, malla: caras });
      }
      // Detector arriba y tubo abajo
      cil(0, 0.56, 0.19, 0.19, 1.44, 1.52, MAT.metal);
      cajaM(-0.22, 0.3, 0.22, 0.8, 1.52, 1.64, MAT.blanco);
      cajaM(-0.2, 0.3, 0.2, 0.8, 0.3, 0.5, MAT.blanco);
      break;
    }
    case 'bucky-vertical':
      caja(0, 0, 1, 1, 0, 0.05, MAT.metal);
      caja(0.4, 0, 0.6, 0.35, 0.05, 2.0, MAT.blanco);
      caja(0.05, 0.35, 0.95, 0.9, 0.9, 1.6, MAT.blanco);
      caja(0.15, 0.9, 0.85, 0.91, 1.0, 1.5, MAT.oscuro);
      break;
    case 'consola':
      caja(0, 0, 1, 1, 0, 0.72, MAT.blanco);
      caja(0, 0, 1, 1, 0.72, 0.76, MAT.blanco, true);
      caja(0.55, 0.05, 0.95, 0.15, 0.76, 1.1, MAT.oscuro);
      caja(0.57, 0.15, 0.93, 0.16, 0.8, 1.06, MAT.cristal);
      break;
    case 'mampara':
      caja(0, 0, 0.12, 1, 0, 0.05, MAT.metal);
      caja(0.88, 0, 1, 1, 0, 0.05, MAT.metal);
      caja(0, 0.3, 1, 0.7, 0.1, 1.9, MAT.metal);
      caja(0.3, 0.7, 0.7, 0.72, 1.3, 1.7, MAT.cristal);
      break;
    case 'mandiles':
      caja(0, 0, 1, 1, 1.5, 1.55, MAT.metal);
      for (const fx of [0.2, 0.4, 0.6, 0.8]) caja(fx - 0.08, 0.35, fx + 0.08, 0.65, 0.65, 1.5, MAT.metal);
      break;
    case 'mastografo':
      caja(0, 0, 1, 1, 0, 0.08, MAT.blanco);
      caja(0.3, 0, 0.7, 0.3, 0.08, 1.8, MAT.blanco);
      caja(0.3, 0.3, 0.7, 0.8, 1.0, 1.1, MAT.blanco);
      caja(0.3, 0.3, 0.7, 0.75, 1.3, 1.36, MAT.cristal);
      caja(0.25, 0.3, 0.75, 0.6, 1.6, 1.8, MAT.blanco);
      break;
    case 'panoramico':
      cil(0, 0, m * 0.35, m * 0.35, 0, 0.06, MAT.metal);
      cil(0, -m * 0.2, 0.08, 0.08, 0.06, 2.0, MAT.blanco, 10);
      cajaM(-m * 0.35, -m * 0.3, m * 0.35, m * 0.3, 1.55, 1.7, MAT.blanco);
      break;
    case 'revelador':
      caja(0, 0, 1, 1, 0, 0.95, MAT.blanco);
      caja(0, 0, 1, 1, 0.95, 1.0, MAT.blanco, true);
      break;
    case 'vestidor':
      caja(0, 0, 1, 0.03, 0, 1.9, MAT.blanco);
      caja(0, 0.03, 0.03, 1, 0, 1.9, MAT.blanco);
      caja(0.97, 0.03, 1, 1, 0, 1.9, MAT.blanco);
      caja(0.03, 0.5, 0.97, 0.53, 0.75, 0.78, MAT.madera);
      break;

    // ───── Control de plagas ─────
    case 'gabinete-llave':
      gabinete(1.8, 2, MAT.metal);
      break;
    case 'casillero-epp':
      gabinete(1.8, 3, MAT.metal);
      break;
    case 'regadera-emerg':
      cilF(0.5, 0.06, 0.03, 0.03, 0, 2.2, MAT.verde, 8);
      cajaM(-0.02, -D / 2 + 0.04, 0.02, 0, 2.15, 2.2, MAT.verde);
      cil(0, 0, 0.15, 0.15, 2.05, 2.1, MAT.verde, 12);
      break;
    case 'lavaojos':
      cil(0, 0, 0.04, 0.04, 0, 0.88, MAT.verde, 8);
      cil(0, 0, m * 0.45, m * 0.45, 0.88, 0.98, MAT.verde);
      break;
    case 'aspersora':
      cil(0, 0, m * 0.32, m * 0.32, 0, 0.55, MAT.amarillo);
      cil(0, 0, m * 0.12, m * 0.12, 0.55, 0.62, MAT.negro, 8);
      cajaM(m * 0.2, -0.015, m * 0.5, 0.015, 0.5, 0.53, MAT.negro);
      break;
    case 'envases-vacios':
      caja(0, 0, 1, 0.04, 0, 1, MAT.amarillo);
      caja(0, 0.96, 1, 1, 0, 1, MAT.amarillo);
      caja(0, 0.04, 0.04, 0.96, 0, 1, MAT.amarillo);
      caja(0.96, 0.04, 1, 0.96, 0, 1, MAT.amarillo);
      caja(0.04, 0.04, 0.96, 0.96, 0, 0.05, MAT.amarillo);
      break;
    case 'kit-derrames':
      caja(0, 0, 1, 1, 0, 0.55, MAT.amarillo);
      caja(0, 0, 1, 1, 0.55, 0.6, MAT.negro);
      break;

    // ───── Alimentos ─────
    case 'campana':
      caja(0, 0, 1, 1, 1.9, 2.05, MAT.metal);
      caja(0.3, 0, 0.7, 0.4, 2.05, 2.4, MAT.metal);
      break;
    case 'camara-fria':
      caja(0, 0, 1, 1, 0, 2.2, MAT.blanco);
      caja(0.35, 1, 0.65, 1.01, 0.05, 2.0, MAT.metal);
      caja(0.6, 1.01, 0.62, 1.02, 0.9, 1.2, MAT.oscuro);
      break;
    case 'bascula':
      caja(0, 0, 1, 1, 0, 0.08, MAT.metal);
      caja(0.45, 0, 0.55, 0.12, 0.08, 1.0, MAT.metal);
      caja(0.25, 0, 0.75, 0.2, 1.0, 1.2, MAT.blanco);
      break;

    // Planos en el piso o en el techo: se ven como su símbolo
    case 'regadera':
    case 'coladera':
    case 'trampa-grasa':
    case 'lampara-quir':
    case 'lampara-seg':
    case 'luz-roja':
    case 'senal-rad':
    case 'senal-peligro':
    case 'extractor':
      return [];

    default:
      // Mueble sin modelo propio: una caja con su símbolo encima
      caja(0, 0, 1, 1, 0, 0.8, MAT.blanco, true);
  }
  return piezas;
}

/** Altura del mueble en la vista isométrica (0 si va plano en el piso). */
export function alturaModelo(el: Mueble): number {
  return modeloMueble(el).reduce((h, p) => Math.max(h, p.z1), 0);
}

// ───────────────────────── Maniquí del transfer ─────────────────────────

type V3 = [number, number, number];
const suma = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const resta = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const por = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const cruz = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => por(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));

/**
 * Barrera del transfer y maniquí liso (cuerpo de tubos y elipsoides con normales, como un modelo de
 * referencia gris) sentado sobre ella poniéndose una bota. Coordenadas locales: x a lo largo de la
 * barrera, y a lo ancho (lado limpio en y positiva), z hacia arriba.
 */
function mallaTransfer(W: number, D: number, mundo: (x: number, y: number) => Pt): CaraMalla[] {
  // Armarla cuesta: se guarda por posición, giro, medidas y nivel de detalle
  const o = mundo(0, 0);
  const u = mundo(1, 0);
  const llave = [o.x, o.y, u.x, u.y, W, D, detalleBajo].join('|');
  const previa = cacheMallas.get(llave);
  if (previa) return previa;
  const res = armarMallaTransfer(W, D, mundo, detalleBajo ? 0.4 : 1);
  if (cacheMallas.size > 40) cacheMallas.clear();
  cacheMallas.set(llave, res);
  return res;
}

const cacheMallas = new Map<string, CaraMalla[]>();
let detalleBajo = false;
/** Con detalle bajo, las superficies curvas llevan menos caras (para girar la vista con fluidez). */
export function fijarDetalle(bajo: boolean) {
  detalleBajo = bajo;
}

function armarMallaTransfer(W: number, D: number, mundo: (x: number, y: number) => Pt, f: number): CaraMalla[] {
  const caras: CaraMalla[] = [];
  const q = (n: number, min: number) => Math.max(min, Math.round(n * f));
  const P = (v: V3) => ({ p: mundo(v[0], v[1]), z: v[2] });
  const N = (v: V3) => {
    const o = mundo(0, 0);
    const q = mundo(v[0], v[1]);
    return { x: q.x - o.x, y: q.y - o.y, z: v[2] };
  };
  const cara = (vs: V3[], n: V3, mat: Material, bordes?: boolean[], trama = false) =>
    caras.push({ pts: vs.map(P), n: N(unit(n)), mat, bordes: bordes ?? vs.map(() => false), trama });

  /** Caja con sus caras partidas en cuadros pequeños (para que se ordenen bien con la figura). */
  const cajaMalla = (a: V3, b: V3, mat: Material, paso = 0.12) => {
    const ejes: [number, number, number][] = [
      [0, 1, 2],
      [1, 2, 0],
      [2, 0, 1],
    ];
    for (const [i, j, k] of ejes)
      for (const lado of [0, 1]) {
        const nk = lado ? b[k] : a[k];
        const n: V3 = [0, 0, 0];
        n[k] = lado ? 1 : -1;
        const ni = Math.max(1, Math.ceil((b[i] - a[i]) / paso));
        const nj = Math.max(1, Math.ceil((b[j] - a[j]) / paso));
        for (let u = 0; u < ni; u++)
          for (let v = 0; v < nj; v++) {
            const pt = (uu: number, vv: number): V3 => {
              const r: V3 = [0, 0, 0];
              r[i] = a[i] + ((b[i] - a[i]) * uu) / ni;
              r[j] = a[j] + ((b[j] - a[j]) * vv) / nj;
              r[k] = nk;
              return r;
            };
            cara([pt(u, v), pt(u + 1, v), pt(u + 1, v + 1), pt(u, v + 1)], n, mat, [v === 0, u === ni - 1, v === nj - 1, u === 0], false);
          }
      }
  };

  /** Tubo de sección elíptica entre dos puntos, con radios que cambian de un extremo al otro y tapas. */
  const tubo = (a: V3, b: V3, ra: [number, number], rb: [number, number], mat: Material, _lados = 0, ref: V3 = [0, 1, 0]) => {
    const lados = q(40, 12);
    const d = unit(resta(b, a));
    let u = cruz(d, ref);
    if (Math.hypot(...u) < 1e-6) u = cruz(d, [1, 0, 0]);
    u = unit(u);
    const w = cruz(d, u);
    const anillo = (c: V3, r: [number, number]) =>
      Array.from({ length: lados }, (_, i) => {
        const t = (i / lados) * Math.PI * 2;
        return suma(c, suma(por(u, Math.cos(t) * r[0]), por(w, Math.sin(t) * r[1])));
      });
    // Tramos a lo largo del tubo, para que las caras se ordenen bien con las piezas vecinas
    const tramos = Math.max(1, Math.ceil(Math.hypot(...resta(b, a)) / (f < 1 ? 0.1 : 0.05)));
    const anillos = Array.from({ length: tramos + 1 }, (_, k) => {
      const f = k / tramos;
      return anillo(suma(a, por(resta(b, a), f)), [ra[0] + (rb[0] - ra[0]) * f, ra[1] + (rb[1] - ra[1]) * f]);
    });
    for (let k = 0; k < tramos; k++)
      for (let i = 0; i < lados; i++) {
        const j = (i + 1) % lados;
        const t = ((i + 0.5) / lados) * Math.PI * 2;
        const n = suma(por(u, Math.cos(t) / ra[0]), por(w, Math.sin(t) / ra[1]));
        cara([anillos[k][i], anillos[k][j], anillos[k + 1][j], anillos[k + 1][i]], n, mat);
      }
    const A = anillos[0];
    const B = anillos[tramos];
    cara([...A].reverse(), por(d, -1), mat);
    cara(B, d, mat);
  };

  /**
   * Superficie continua por anillos elípticos a lo largo de una línea (centro, ancho, fondo de cada
   * anillo). La normal de cada cara sale de su geometría, orientada hacia afuera del eje.
   */
  const loft = (control: [V3, number, number][], mat: Material, lados = q(48, 14), sub = f < 1 ? 2 : 4) => {
    // Anillos intermedios por Catmull-Rom (centro y radios), para que el perfil sea curvo y no por tramos
    const anillos: [V3, number, number][] = [];
    const cr = (a: number, b: number, c: number, d: number, t: number) =>
      0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
    for (let k = 0; k < control.length - 1; k++) {
      const p0 = control[Math.max(0, k - 1)];
      const p1 = control[k];
      const p2 = control[k + 1];
      const p3 = control[Math.min(control.length - 1, k + 2)];
      for (let s = 0; s < sub; s++) {
        const t = s / sub;
        const c: V3 = [0, 1, 2].map((i) => cr(p0[0][i], p1[0][i], p2[0][i], p3[0][i], t)) as V3;
        anillos.push([c, cr(p0[1], p1[1], p2[1], p3[1], t), cr(p0[2], p1[2], p2[2], p3[2], t)]);
      }
    }
    anillos.push(control[control.length - 1]);
    const rings = anillos.map(([c, ra, rb], k) => {
      const prev = anillos[Math.max(0, k - 1)][0];
      const next = anillos[Math.min(anillos.length - 1, k + 1)][0];
      const d = unit(resta(next, prev));
      const u = unit(cruz(d, [1, 0, 0]));
      const w = cruz(d, u);
      return Array.from({ length: lados }, (_, i) => {
        const t = (i / lados) * Math.PI * 2;
        return suma(c, suma(por(u, Math.cos(t) * ra), por(w, Math.sin(t) * rb)));
      });
    });
    for (let k = 0; k < rings.length - 1; k++)
      for (let i = 0; i < lados; i++) {
        const j = (i + 1) % lados;
        const q = [rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i]];
        let n = cruz(resta(q[2], q[0]), resta(q[3], q[1]));
        const centro = por(suma(anillos[k][0], anillos[k + 1][0]), 0.5);
        const medio = por(q.reduce((acc, v) => suma(acc, v), [0, 0, 0] as V3), 0.25);
        const r = resta(medio, centro);
        if (n[0] * r[0] + n[1] * r[1] + n[2] * r[2] < 0) n = por(n, -1);
        cara(q, n, mat);
      }
    const fin = rings[rings.length - 1];
    const ini = rings[0];
    cara(fin, resta(anillos[anillos.length - 1][0], anillos[anillos.length - 2][0]), mat);
    cara([...ini].reverse(), resta(anillos[0][0], anillos[1][0]), mat);
  };

  /** Elipsoide (radios en x, y, z locales). */
  const elipsoide = (c: V3, r: V3, mat: Material, nu0 = 44, nv0 = 26) => {
    const nu = q(nu0, 10);
    const nv = q(nv0, 6);
    const pt = (i: number, j: number): V3 => {
      const t = (i / nu) * Math.PI * 2;
      const f = -Math.PI / 2 + (j / nv) * Math.PI;
      return [c[0] + r[0] * Math.cos(f) * Math.cos(t), c[1] + r[1] * Math.cos(f) * Math.sin(t), c[2] + r[2] * Math.sin(f)];
    };
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const t = ((i + 0.5) / nu) * Math.PI * 2;
        const f = -Math.PI / 2 + ((j + 0.5) / nv) * Math.PI;
        const n: V3 = [(Math.cos(f) * Math.cos(t)) / r[0], (Math.cos(f) * Math.sin(t)) / r[1], Math.sin(f) / r[2]];
        const q = [pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j + 1)];
        cara(j === 0 ? [q[0], q[2], q[3]] : j === nv - 1 ? [q[0], q[1], q[2]] : q, n, mat);
      }
  };
  const bola = (c: V3, r: number, mat: Material) => elipsoide(c, [r, r, r], mat, 32, 18);

  // Barrera: cuerpo y cubierta de acero
  const zs = 0.5;
  cajaMalla([-W / 2, -D / 2, 0], [W / 2, D / 2, zs - 0.03], MAT.metal);
  cajaMalla([-W / 2 - 0.01, -D / 2 - 0.01, zs - 0.03], [W / 2 + 0.01, D / 2 + 0.01, zs], MAT.metal);

  const piel = MAT.maniqui;
  const bota = MAT.bota;
  const cx = -0.14;
  // Tronco de una sola pieza (cadera, cintura, pecho y hombros), inclinado hacia la bota.
  // Al ser una superficie continua no se cruza consigo misma y se ve lisa.
  const pecho: V3 = [cx + 0.16, 0, zs + 0.46];
  const tronco: [V3, number, number][] = [
    [[cx - 0.01, 0, zs + 0.005], 0.07, 0.05],
    [[cx - 0.01, 0, zs + 0.03], 0.14, 0.1],
    [[cx, 0, zs + 0.09], 0.17, 0.12],
    [[cx + 0.03, 0, zs + 0.17], 0.155, 0.105],
    [[cx + 0.06, 0, zs + 0.26], 0.145, 0.1],
    [[cx + 0.1, 0, zs + 0.35], 0.165, 0.105],
    [[cx + 0.14, 0, zs + 0.42], 0.185, 0.105],
    [[cx + 0.17, 0, zs + 0.48], 0.165, 0.09],
    [[cx + 0.19, 0, zs + 0.52], 0.1, 0.07],
    [[cx + 0.2, 0, zs + 0.535], 0.05, 0.045],
  ];
  loft(tronco, piel);
  // Cuello y cabeza mirando hacia la bota
  const cuello: V3 = [cx + 0.2, 0, zs + 0.55];
  tubo(pecho, cuello, [0.05, 0.05], [0.045, 0.045], piel, 8);
  elipsoide([cx + 0.26, 0.04, zs + 0.65], [0.1, 0.085, 0.115], piel);
  elipsoide([cx + 0.32, 0.045, zs + 0.61], [0.045, 0.06, 0.05], piel, 28, 16);
  // Hombros y brazos: ambas manos sostienen la bota del pie levantado
  const pie: V3 = [cx + 0.44, 0.3, zs + 0.2];
  const hombroI: V3 = [cx + 0.16, -0.19, zs + 0.45];
  const hombroD: V3 = [cx + 0.16, 0.19, zs + 0.45];
  const codoI: V3 = [cx + 0.33, -0.08, zs + 0.3];
  const codoD: V3 = [cx + 0.3, 0.34, zs + 0.34];
  const manoI: V3 = suma(pie, [-0.05, -0.08, 0.04]);
  const manoD: V3 = suma(pie, [-0.02, 0.07, 0.07]);
  for (const [h, c, m] of [
    [hombroI, codoI, manoI],
    [hombroD, codoD, manoD],
  ] as [V3, V3, V3][]) {
    bola(h, 0.055, piel);
    tubo(h, c, [0.047, 0.047], [0.037, 0.037], piel);
    bola(c, 0.037, piel);
    tubo(c, m, [0.035, 0.035], [0.028, 0.028], piel);
    elipsoide(m, [0.04, 0.03, 0.045], piel, 28, 16);
  }
  // Pierna apoyada (lado y negativo): ya con la bota puesta
  const caderaI: V3 = [cx + 0.02, -0.1, zs + 0.09];
  const rodillaI: V3 = [cx + 0.36, -0.27, zs + 0.03];
  const tobilloI: V3 = [cx + 0.4, -0.3, 0.09];
  tubo(caderaI, rodillaI, [0.075, 0.075], [0.052, 0.052], piel);
  bola(rodillaI, 0.052, piel);
  tubo(rodillaI, tobilloI, [0.05, 0.05], [0.035, 0.035], piel);
  tubo([tobilloI[0] - 0.04, tobilloI[1], 0.02], [tobilloI[0] + 0.2, tobilloI[1] - 0.01, 0.02], [0.05, 0.035], [0.045, 0.03], bota, 10, [0, 0, 1]);
  bola([tobilloI[0], tobilloI[1], 0.07], 0.05, bota);
  // Pierna levantada (lado limpio): rodilla arriba y el pie con la bota a medio poner, en las manos
  const caderaD: V3 = [cx + 0.02, 0.1, zs + 0.09];
  const rodillaD: V3 = [cx + 0.3, 0.33, zs + 0.5];
  tubo(caderaD, rodillaD, [0.075, 0.075], [0.052, 0.052], piel);
  bola(rodillaD, 0.052, piel);
  tubo(rodillaD, pie, [0.05, 0.05], [0.035, 0.035], piel);
  tubo(suma(pie, [-0.03, 0, -0.01]), suma(pie, [0.17, 0.01, -0.07]), [0.052, 0.04], [0.045, 0.032], bota, 10, [0, 0, 1]);
  bola(pie, 0.05, bota);
  return caras;
}
