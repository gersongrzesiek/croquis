import { CATALOGO, CATEGORIAS, dibujarSimbolo, itemPorClave, itemsDeCategoria } from './catalogo';
import { cajaDe, cajaDeTodos, mover, posEtiqueta, puntoLocal, puntosClave, toca } from './elementos';
import { inyectarEstilos } from './estilos';
import { exportarPNG, type ImagenCroquis } from './exportar';
import { aMundo, areaPoligono, dist, distBorde, enPoligono, formatoM, insetPoligono, lado, proyectar, recortarPoligono } from './geometria';
import { ICONOS } from './iconos';
import { ALTURA_MUROS, aIso, dibujarIsometrico, encuadreIso, opcionesIso } from './isometrico';
import {
  datosVacios,
  normalizarDatos,
  nuevoId,
  tieneDosPuntos,
  type Abertura,
  type Area,
  type DatosCroquis,
  type ConDosPuntos,
  type Elemento,
  type Mueble,
  type Muro,
  type Norte,
  type PuntoCardinal,
  type Patron,
  type Pt,
  type Texto,
  type Trazo,
} from './modelo';
import { alcanceHaz, dibujarEscena, tieneHaz, type Vista } from './render';


export type Herramienta =
  | 'seleccionar'
  | 'mano'
  | 'muro'
  | 'cuarto'
  | 'chaflan'
  | 'dividir'
  | 'puerta'
  | 'puerta2'
  | 'ventana'
  | 'area'
  | 'mueble'
  | 'texto'
  | 'acceso'
  | 'cota'
  | 'linea'
  | 'lapiz'
  | 'norte';

/** `sep` deja un espacio después del botón para agrupar la barra. */
const HERRAMIENTAS: { h: Herramienta; nombre: string; tecla: string; ayuda: string; sep?: true }[] = [
  { h: 'seleccionar', nombre: 'Seleccionar', tecla: 'V', ayuda: 'Clic para seleccionar, arrastra para mover. Arrastra en vacío para seleccionar varios. Supr borra.' },
  { h: 'mano', nombre: 'Mover vista', tecla: 'H', ayuda: 'Arrastra para desplazar la vista. La rueda del ratón hace zoom.', sep: true },
  { h: 'muro', nombre: 'Muro', tecla: 'W', ayuda: 'Clic en cada esquina. Escribe una medida y Enter para fijar el largo. Doble clic o Esc para terminar.' },
  { h: 'cuarto', nombre: 'Cuarto', tecla: 'Q', ayuda: 'Arrastra para crear un cuarto con sus 4 muros. Luego escribe su etiqueta; aparece al centro y puedes moverla con su manija.' },
  { h: 'chaflan', nombre: 'Cortar esquina', tecla: 'C', ayuda: 'Clic en una esquina para cortarla en diagonal (chaflán). Luego ajusta la distancia arrastrando sus extremos o en el panel.' },
  { h: 'dividir', nombre: 'Agregar esquina', tecla: 'E', ayuda: 'Clic sobre un muro para partirlo en dos. Luego arrastra la nueva esquina para darle otra forma al cuarto.', sep: true },
  { h: 'puerta', nombre: 'Puerta', tecla: 'D', ayuda: 'Clic sobre un muro para colocar una puerta. R la gira, F cambia el lado.' },
  { h: 'puerta2', nombre: 'Puerta de doble abatimiento', tecla: 'B', ayuda: 'Puerta de vaivén (abre hacia ambos lados). Activa "Doble puerta" para dos puertas que se juntan al centro, como en quirófanos.' },
  { h: 'ventana', nombre: 'Ventana', tecla: 'N', ayuda: 'Clic sobre un muro para colocar una ventana.', sep: true },
  { h: 'area', nombre: 'Área / sombreado', tecla: 'A', ayuda: 'Arrastra para un área rectangular, o haz clic en cada vértice y doble clic para cerrar.' },
  { h: 'mueble', nombre: 'Mobiliario', tecla: 'M', ayuda: 'Elige un mueble en el panel y haz clic para colocarlo. R lo gira 90°.' },
  { h: 'texto', nombre: 'Etiqueta', tecla: 'T', ayuda: 'Clic donde quieras la etiqueta y escribe el texto en el panel.', sep: true },
  { h: 'acceso', nombre: 'Acceso', tecla: 'X', ayuda: 'Arrastra desde afuera hacia la entrada para marcar un acceso.' },
  { h: 'cota', nombre: 'Cota', tecla: 'K', ayuda: 'Arrastra entre dos puntos para acotar la distancia.', sep: true },
  { h: 'linea', nombre: 'Línea', tecla: 'L', ayuda: 'Arrastra para trazar una línea. Shift fija ángulos de 45°.' },
  { h: 'lapiz', nombre: 'Lápiz', tecla: 'P', ayuda: 'Dibujo a mano alzada.', sep: true },
  { h: 'norte', nombre: 'Orientación', tecla: 'O', ayuda: 'Clic para colocar la orientación (N, S, E u O) con su flecha. Gira la flecha con su manija o escribe el ángulo en el panel; la letra no gira. Solo hay una por croquis: un nuevo clic la mueve.' },
];

/** Tinta azul de plano: selección, manijas y guías sobre el lienzo. */
const ACENTO_LIENZO = '#1f5fbf';

const COLORES = ['#111827', '#374151', '#6b7280', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', ACENTO_LIENZO, '#7c3aed', '#db2777', '#92400e'];
const RELLENOS = ['#bfdbfe', '#bbf7d0', '#fef08a', '#fecaca', '#fed7aa', '#e9d5ff', '#e5e7eb', '#a5f3fc'];
const PATRONES: { v: Patron; n: string }[] = [
  { v: 'ninguno', n: 'Sin patrón' },
  { v: 'diagonal', n: 'Rayado diagonal' },
  { v: 'cruzado', n: 'Cuadriculado' },
  { v: 'horizontal', n: 'Rayado horizontal' },
  { v: 'puntos', n: 'Puntos' },
];

const PASO_REJILLA = 0.05;
/** Píxeles por metro al 100 % de zoom. */
const ESCALA_INICIAL = 60;
const MIN_ESCALA = 5;
const MAX_ESCALA = 600;

export interface OpcionesEditor {
  datos?: DatosCroquis | null;
  titulo?: string;
  tema?: 'claro' | 'oscuro';
  /** 'modal' muestra Guardar/Cancelar; 'pagina' muestra abrir/guardar archivo. */
  modo?: 'modal' | 'pagina';
  /** Opciones para la imagen que se entrega al guardar. */
  exportar?: Parameters<typeof exportarPNG>[1];
  alGuardar?: (r: ResultadoCroquis) => void;
  alCancelar?: () => void;
  alCambiar?: (datos: DatosCroquis) => void;
}

export interface ResultadoCroquis extends ImagenCroquis {
  datos: DatosCroquis;
}

type Accion =
  | { k: 'pan'; sx: number; sy: number; ox: number; oy: number }
  | { k: 'girarIso'; sx: number; g0: number; pivote: Pt; pantalla: Pt; movido: boolean }
  | { k: 'mover'; ultimo: Pt; previo: string; movido: boolean }
  | { k: 'manija'; id: string; cual: 'a' | 'b' | 'rot' | 'tam' | 'etq' | 'medio' | 'haz' | number; previo: string; vinculados: { el: Muro; extremo: 'a' | 'b' }[] }
  | { k: 'marco'; a: Pt; b: Pt; sumar: boolean }
  | { k: 'nuevo'; el: ConDosPuntos; inicio: Pt }
  | { k: 'cuarto'; a: Pt; b: Pt }
  | { k: 'trazo'; el: Trazo }
  | { k: 'areaRect'; a: Pt; b: Pt };

const h = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> & { className?: string } = {}, hijos: (Node | string)[] = []) => {
  const e = document.createElement(tag);
  Object.assign(e, props);
  for (const c of hijos) e.append(c);
  return e;
};

function div(css: string, hijos: (Node | string)[] = []) {
  const d = h('div', {}, hijos);
  d.style.cssText = css;
  return d;
}

/** Esquinas de un rectángulo dado por dos esquinas opuestas. */
function rectangulo(a: Pt, b: Pt): Pt[] {
  return [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }];
}

export class Editor {
  readonly raiz: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private panel: HTMLDivElement;
  private estado: HTMLDivElement;
  private zoomTxt: HTMLSpanElement;
  private botonesHerr = new Map<Herramienta, HTMLButtonElement>();
  private btnDeshacer!: HTMLButtonElement;
  private btnRehacer!: HTMLButtonElement;
  private botonesVista: { v: 'plano' | 'isometrico'; b: HTMLButtonElement }[] = [];
  /** Interruptores que solo tienen sentido en el plano. */
  private soloPlano: HTMLButtonElement[] = [];
  /** Vista del plano guardada al pasar a la isométrica, para volver al mismo encuadre. */
  private vistaPlano: Vista | null = null;

  datos: DatosCroquis;
  private vista: Vista = { escala: ESCALA_INICIAL, ox: 60, oy: 60 };
  private herr: Herramienta = 'muro';
  private seleccion = new Set<string>();
  private historial: string[] = [];
  private rehechos: string[] = [];
  private accion: Accion | null = null;
  /** Giro de la vista isométrica mientras se gira con el mouse (cuartos de vuelta, fraccionario). */
  private giroVivo: number | null = null;
  private animGiro = 0;
  private poli: { tipo: 'muro' | 'area'; puntos: Pt[] } | null = null;
  private cursor: Pt | null = null;
  private medida = '';
  private shift = false;
  private espacio = false;
  private cuadricula = true;
  private iman = true;
  /** Al ajustar un corte, mover también los cortes de otros cuartos en la misma esquina. */
  private empalmar = true;
  private muebleClave = 'mesa';
  private categoria = 'general';
  private busquedaMueble = '';
  private fantasmaAng = 0;
  private aberturaInvertir = false;
  private estilo = { color: '#111827', muro: '#374151', grosorMuro: 0.15, relleno: '#bfdbfe', patron: 'ninguno' as Patron, acceso: '#16a34a', fondoCuarto: '#ffffff', dobleHoja: false, chaflan: 1 };
  private pendiente: string | null = null;
  private punteros = new Map<number, Pt>();
  private pellizco: { d: number; c: Pt; escala: number; ox: number; oy: number } | null = null;
  private cambiado = false;
  private dibujoPedido = false;
  private observador: ResizeObserver;
  private quitarTeclas: () => void;

  constructor(
    contenedor: HTMLElement,
    private o: OpcionesEditor = {},
  ) {
    inyectarEstilos();
    this.datos = normalizarDatos(o.datos ?? datosVacios());
    this.raiz = h('div', { className: 'crq-raiz' });
    this.raiz.dataset.tema = o.tema ?? 'claro';
    this.canvas = h('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.panel = h('div', { className: 'crq-panel' });
    this.estado = h('div', { className: 'crq-estado' });
    this.zoomTxt = h('span', { className: 'crq-zoom' });
    this.construir();
    contenedor.append(this.raiz);
    this.observador = new ResizeObserver(() => this.ajustarTamano());
    this.observador.observe(this.canvas.parentElement!);
    this.quitarTeclas = this.escucharTeclas();
    this.escucharPunteros();
    this.ajustarTamano();
    if (this.datos.elementos.length) {
      this.herr = 'seleccionar';
      this.encuadrar();
    }
    this.cambiarHerramienta(this.herr);
    this.aplicarModoVista();
  }

  /** ¿Se está viendo el croquis en isométrico? En esa vista no se edita. */
  get isometrico() {
    return this.datos.opciones.vista === 'isometrico';
  }

  destruir() {
    this.observador.disconnect();
    this.quitarTeclas();
    this.raiz.remove();
  }

  // ───────────────────────── Interfaz ─────────────────────────

  private construir() {
    const barra = h('div', { className: 'crq-barra' });
    barra.append(h('span', { className: 'crq-titulo', textContent: this.o.titulo ?? 'Croquis' }));
    this.btnDeshacer = this.boton(ICONOS.deshacer, 'Deshacer (Ctrl+Z)', () => this.deshacer(), 'crq-icono');
    this.btnRehacer = this.boton(ICONOS.rehacer, 'Rehacer (Ctrl+Y)', () => this.rehacer(), 'crq-icono');
    barra.append(this.btnDeshacer, this.btnRehacer, h('span', { className: 'crq-sep' }));
    barra.append(
      this.boton(ICONOS.menos, 'Alejar', () => this.zoom(1 / 1.25), 'crq-icono'),
      this.zoomTxt,
      this.boton(ICONOS.mas, 'Acercar', () => this.zoom(1.25), 'crq-icono'),
      this.boton('Ajustar', 'Ver todo el croquis', () => this.encuadrar()),
      h('span', { className: 'crq-sep' }),
    );
    const segmento = h('div', { className: 'crq-segmento', role: 'group', ariaLabel: 'Vista' });
    for (const [v, txt, titulo] of [
      ['plano', 'Plano', 'Ver y editar el plano'],
      ['isometrico', 'Isométrico', 'Ver el croquis en 3D, con los muros levantados'],
    ] as const) {
      const b = this.boton(ICONOS[v] + txt, titulo, () => this.cambiarVista(v));
      this.botonesVista.push({ v, b });
      segmento.append(b);
    }
    barra.append(segmento, h('span', { className: 'crq-sep' }));
    const alternar = (txt: string, titulo: string, get: () => boolean, set: (v: boolean) => void, enIso = false) => {
      const b = this.boton(txt, titulo, () => {
        set(!get());
        b.classList.toggle('crq-activo', get());
        b.setAttribute('aria-pressed', String(get()));
        this.dibujar();
      }, 'crq-alternar');
      b.classList.toggle('crq-activo', get());
      b.setAttribute('aria-pressed', String(get()));
      if (!enIso) this.soloPlano.push(b);
      return b;
    };
    barra.append(
      alternar('Cuadrícula', 'Mostrar cuadrícula', () => this.cuadricula, (v) => (this.cuadricula = v)),
      alternar('Imán', 'Ajustar a la cuadrícula (5 cm) y a las esquinas', () => this.iman, (v) => (this.iman = v)),
      alternar('Medidas', 'Mostrar la medida de cada muro', () => this.datos.opciones.medidasMuros, (v) => {
        this.datos.opciones.medidasMuros = v;
        this.notificar();
      }, true),
    );
    barra.append(h('span', { className: 'crq-esp' }));
    if (this.o.modo === 'modal') {
      barra.append(
        this.boton('Cancelar', 'Cerrar sin guardar', () => this.cancelar(), 'crq-borde'),
        this.boton('Guardar croquis', 'Guardar y volver', () => this.guardar(), 'crq-primario'),
      );
    } else {
      barra.append(
        this.boton('Nuevo', 'Empezar un croquis vacío', () => {
          if (!this.datos.elementos.length || confirm('¿Borrar todo el croquis actual?')) {
            this.registrar();
            this.datos.elementos = [];
            this.seleccion.clear();
            this.notificar();
            this.actualizarPanel();
          }
        }, 'crq-borde'),
        this.boton('Abrir', 'Abrir un archivo .croquis.json', () => this.abrirArchivo(), 'crq-borde'),
        this.boton('Guardar', 'Descargar como .croquis.json', () => this.descargar('json'), 'crq-borde'),
        this.boton('Descargar PNG', 'Descargar imagen', () => this.descargar('png'), 'crq-primario'),
      );
    }

    const herr = h('div', { className: 'crq-herr' });
    // Etiqueta flotante con el nombre de la herramienta; va fuera de la barra para que su scroll no la recorte.
    const tip = h('div', { className: 'crq-tip', role: 'tooltip' });
    const ocultarTip = () => tip.classList.remove('crq-visible');
    herr.addEventListener('scroll', ocultarTip);
    for (const t of HERRAMIENTAS) {
      const b = this.boton(ICONOS[t.h], '', () => this.cambiarHerramienta(t.h));
      b.removeAttribute('title');
      b.setAttribute('aria-label', `${t.nombre} (${t.tecla})`);
      const mostrar = () => {
        tip.replaceChildren(t.nombre, h('kbd', { textContent: t.tecla }));
        const r = b.getBoundingClientRect();
        tip.style.left = `${r.right + 8}px`;
        tip.style.top = `${r.top + r.height / 2}px`;
        tip.classList.add('crq-visible');
      };
      b.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && mostrar());
      b.addEventListener('pointerleave', ocultarTip);
      b.addEventListener('focus', () => b.matches(':focus-visible') && mostrar());
      b.addEventListener('blur', ocultarTip);
      this.botonesHerr.set(t.h, b);
      herr.append(b);
      if (t.sep) herr.append(h('div', { className: 'crq-hueco' }));
    }
    const lienzo = h('div', { className: 'crq-lienzo' }, [this.canvas]);
    const cuerpo = h('div', { className: 'crq-cuerpo' }, [herr, lienzo, this.panel]);
    this.raiz.append(barra, cuerpo, this.estado, tip);
  }

  private boton(contenido: string, titulo: string, fn: () => void, clase = '') {
    const b = h('button', { type: 'button', title: titulo, className: clase });
    b.innerHTML = contenido;
    b.addEventListener('click', fn);
    return b;
  }

  /** Cambia entre el plano (editable) y la vista isométrica (solo para ver y exportar). */
  cambiarVista(v: 'plano' | 'isometrico') {
    if ((v === 'isometrico') === this.isometrico) return;
    this.terminarPoli();
    this.accion = null;
    this.medida = '';
    this.seleccion.clear();
    if (v === 'isometrico') {
      this.vistaPlano = { ...this.vista };
      this.datos.opciones.vista = 'isometrico';
      this.encuadrar();
    } else {
      this.datos.opciones.vista = 'plano';
      if (this.vistaPlano) this.vista = this.vistaPlano;
      else this.encuadrar();
    }
    this.aplicarModoVista();
    this.actualizarPanel();
    this.notificar();
  }

  private aplicarModoVista() {
    const iso = this.isometrico;
    this.raiz.classList.toggle('crq-modo-iso', iso);
    for (const { v, b } of this.botonesVista) {
      const activo = (v === 'isometrico') === iso;
      b.classList.toggle('crq-activo', activo);
      b.setAttribute('aria-pressed', String(activo));
    }
    for (const b of this.soloPlano) b.disabled = iso;
    for (const b of this.botonesHerr.values()) b.disabled = iso;
    this.canvas.style.cursor = iso ? 'grab' : this.cursorHerramienta();
  }

  private cursorHerramienta() {
    return this.herr === 'mano' ? 'grab' : this.herr === 'seleccionar' ? 'default' : 'crosshair';
  }

  private cambiarHerramienta(t: Herramienta) {
    this.terminarPoli();
    this.herr = t;
    this.accion = null;
    this.medida = '';
    for (const [k, b] of this.botonesHerr) b.classList.toggle('crq-activo', k === t);
    if (t !== 'seleccionar') this.seleccion.clear();
    this.canvas.style.cursor = this.isometrico ? 'grab' : this.cursorHerramienta();
    this.actualizarPanel();
    this.actualizarEstado();
    this.dibujar();
  }

  private actualizarEstado() {
    this.zoomTxt.textContent = `${Math.round((this.vista.escala / ESCALA_INICIAL) * 100)}%`;
    this.btnDeshacer.disabled = !this.historial.length;
    this.btnRehacer.disabled = !this.rehechos.length;
    if (this.isometrico) {
      this.estado.innerHTML = '<b>Vista isométrica</b><span>Arrastra para mover la vista; con el botón derecho (o Shift) la giras. Vuelve a Plano para editar.</span>';
      return;
    }
    const info = HERRAMIENTAS.find((x) => x.h === this.herr)!;
    const partes = [`<b>${info.nombre}</b>`];
    if (this.medida) partes.push(`<span>Largo <b class="crq-cifra">${this.medida} m</b>, Enter para fijar</span>`);
    if (this.cursor) partes.push(`<span class="crq-cifra" style="margin-left:auto">x ${this.cursor.x.toFixed(2)}  y ${this.cursor.y.toFixed(2)} m</span>`);
    this.estado.innerHTML = partes.join('');
  }

  // ───────────────────────── Panel lateral ─────────────────────────

  private seleccionados(): Elemento[] {
    return this.datos.elementos.filter((e) => this.seleccion.has(e.id));
  }

  /** Si la selección es exactamente un cuarto (su piso y sus muros), devuelve el piso. */
  private cuartoSeleccionado(): Area | null {
    const sel = this.seleccionados();
    const pisos = sel.filter((e): e is Area => e.tipo === 'area');
    if (pisos.length !== 1 || !pisos[0].muros?.length) return null;
    const muros = new Set(pisos[0].muros);
    return sel.every((e) => e === pisos[0] || muros.has(e.id)) ? pisos[0] : null;
  }

  /** Ids que se seleccionan al elegir un elemento (un cuarto arrastra sus muros). */
  private grupoDe(el: Elemento): string[] {
    if (el.tipo === 'area' && el.muros?.length) return [el.id, ...el.muros];
    return [el.id];
  }

  /** Esquinas de un cuarto (inicio de cada muro, en orden). */
  private esquinasCuarto(el: Area): Pt[] {
    const porId = new Map(this.datos.elementos.map((e) => [e.id, e]));
    return (el.muros ?? []).map((id) => porId.get(id)).filter((m): m is Muro => m?.tipo === 'muro').map((m) => m.a);
  }

  /** Ajusta el piso de cada cuarto a sus muros (por dentro). */
  private sincronizarCuartos() {
    const porId = new Map(this.datos.elementos.map((e) => [e.id, e]));
    for (const el of this.datos.elementos) {
      if (el.tipo !== 'area' || !el.muros?.length) continue;
      const muros = el.muros.map((id) => porId.get(id));
      if (muros.some((m) => !m || m.tipo !== 'muro')) continue;
      const ms = muros as Muro[];
      const g = Math.max(...ms.map((m) => m.grosor)) / 2;
      el.puntos = insetPoligono(ms.map((m) => ({ ...m.a })), g);
    }
  }

  private actualizarPanel() {
    const p = this.panel;
    p.innerHTML = '';
    this.pendiente = null;
    if (this.isometrico) return this.panelIsometrico();
    const sel = this.seleccionados();
    const cuarto = this.cuartoSeleccionado();
    if (cuarto) return this.panelPropiedades(cuarto);
    if (sel.length === 1) return this.panelPropiedades(sel[0]);
    if (sel.length > 1) {
      p.append(h('h3', { textContent: `${sel.length} elementos` }));
      p.append(this.campoColor('Color', this.estilo.color, (c) => sel.forEach((e) => this.aplicarColor(e, c))));
      p.append(this.accionesSeleccion());
      return;
    }
    if (this.herr === 'mueble') {
      p.append(h('h3', { textContent: 'Mobiliario' }));
      // Buscador: filtra todo el catálogo sin rehacer el panel (así no se pierde el foco al escribir)
      const buscar = h('input', { type: 'search', placeholder: 'Buscar mueble…', value: this.busquedaMueble, autocomplete: 'off' });
      p.append(h('label', { className: 'crq-campo crq-buscar' }, [buscar]));
      const selCat = this.campoSelect('Categoría', this.categoria, CATEGORIAS.map((c) => [c.id, c.nombre]), (v) => {
        this.categoria = v;
        this.busquedaMueble = '';
        const items = itemsDeCategoria(v);
        if (!items.some((i) => i.clave === this.muebleClave)) this.muebleClave = items[0].clave;
        this.actualizarPanel();
      }, false);
      p.append(selCat);
      const nota = h('p', {});
      p.append(nota);
      const cat = h('div', { className: 'crq-catalogo' });
      p.append(cat);
      const sinAcentos = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const llenar = () => {
        const q = sinAcentos(this.busquedaMueble.trim());
        const norma = CATEGORIAS.find((c) => c.id === this.categoria)?.norma;
        let items = itemsDeCategoria(this.categoria);
        if (q) {
          const palabras = q.split(/\s+/);
          items = CATALOGO.filter((it) => palabras.every((w) => sinAcentos(it.nombre).includes(w)));
          nota.textContent = items.length
            ? `${items.length} ${items.length === 1 ? 'resultado' : 'resultados'} en todo el catálogo.`
            : 'Ningún mueble coincide con la búsqueda.';
        } else nota.textContent = norma ? `Mobiliario básico según ${norma}.` : '';
        nota.hidden = !nota.textContent;
        selCat.style.display = q ? 'none' : '';
        cat.replaceChildren();
        for (const it of items) {
          const c = h('canvas', { width: 128, height: 88 });
          const g = c.getContext('2d')!;
          const k = Math.min(100 / it.ancho, 64 / it.alto, 110);
          g.translate(64, 44);
          g.scale(k, k);
          dibujarSimbolo(g, it.clave, it.ancho, it.alto, '#111827', 2.5 / k);
          const b = h('button', { type: 'button', title: it.nombre, className: it.clave === this.muebleClave ? 'crq-activo' : '' }, [c, it.nombre]);
          b.addEventListener('click', () => {
            this.muebleClave = it.clave;
            this.fantasmaAng = 0;
            cat.querySelectorAll('button').forEach((x) => x.classList.toggle('crq-activo', x === b));
            this.dibujar();
          });
          cat.append(b);
        }
      };
      buscar.addEventListener('input', () => {
        this.busquedaMueble = buscar.value;
        llenar();
      });
      buscar.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && buscar.value) {
          e.stopPropagation();
          buscar.value = '';
          this.busquedaMueble = '';
          llenar();
        } else if (e.key === 'Enter') {
          (cat.querySelector('button') as HTMLButtonElement | null)?.click();
        }
      });
      llenar();
      return;
    }
    const info = HERRAMIENTAS.find((x) => x.h === this.herr)!;
    p.append(h('h3', { textContent: info.nombre }), h('p', { textContent: info.ayuda }));
    if (this.herr === 'muro' || this.herr === 'cuarto') {
      p.append(this.campoNum('Grosor del muro (m)', this.estilo.grosorMuro, 0.05, 0.6, 0.01, (v) => (this.estilo.grosorMuro = v)));
      p.append(this.campoColor('Color del muro', this.estilo.muro, (c) => (this.estilo.muro = c)));
      if (this.herr === 'cuarto') p.append(this.campoColor('Color de fondo', this.estilo.fondoCuarto, (c) => (this.estilo.fondoCuarto = c), ['#ffffff', ...RELLENOS]));
    } else if (this.herr === 'chaflan') {
      p.append(this.campoNum('Distancia del corte (m)', this.estilo.chaflan, 0.1, 20, 0.05, (v) => (this.estilo.chaflan = v)));
    } else if (this.herr === 'puerta2') {
      p.append(this.campoCheck('Doble puerta (dos puertas que se juntan al centro, tipo quirófano)', this.estilo.dobleHoja, (v) => (this.estilo.dobleHoja = v), false));
    } else if (this.herr === 'area') {
      p.append(this.campoColor('Relleno', this.estilo.relleno, (c) => (this.estilo.relleno = c), RELLENOS));
      p.append(this.campoSelect('Patrón', this.estilo.patron, PATRONES.map((x) => [x.v, x.n]), (v) => (this.estilo.patron = v as Patron)));
    } else if (this.herr === 'acceso') {
      p.append(this.campoColor('Color', this.estilo.acceso, (c) => (this.estilo.acceso = c)));
    } else if (this.herr !== 'seleccionar' && this.herr !== 'mano' && this.herr !== 'puerta' && this.herr !== 'ventana' && this.herr !== 'dividir' && this.herr !== 'norte') {
      p.append(this.campoColor('Color', this.estilo.color, (c) => (this.estilo.color = c)));
    }
    if (this.herr === 'seleccionar' || this.herr === 'mano') {
      p.append(
        h('h3', { textContent: 'Atajos' }),
        h('p', { innerHTML: 'Ctrl+Z deshacer · Ctrl+Y rehacer<br>Supr borrar · Ctrl+D duplicar<br>Flechas mover · R girar<br>Rueda: zoom · Espacio+arrastrar: mover vista' }),
      );
    }
  }

  // ───────────────────────── Giro libre de la vista isométrica ─────────────────────────

  private empezarGiroIso(s: Pt) {
    cancelAnimationFrame(this.animGiro);
    const c = cajaDeTodos(this.datos.elementos.filter((e) => e.tipo !== 'norte'));
    const pivote = c ? { x: (c.minx + c.maxx) / 2, y: (c.miny + c.maxy) / 2 } : { x: 0, y: 0 };
    const g0 = this.giroVivo ?? opcionesIso(this.datos).giro;
    const q = aIso(pivote, 0, g0);
    const pantalla = { x: this.vista.ox + q.x * this.vista.escala, y: this.vista.oy + q.y * this.vista.escala };
    this.accion = { k: 'girarIso', sx: s.x, g0, pivote, pantalla, movido: false };
    this.canvas.style.cursor = 'grabbing';
  }

  /** Gira la vista dejando el centro del croquis en el mismo lugar de la pantalla. */
  private ponerGiroVivo(giro: number, a: { pivote: Pt; pantalla: Pt }) {
    this.giroVivo = giro;
    const q = aIso(a.pivote, 0, giro);
    this.vista.ox = a.pantalla.x - q.x * this.vista.escala;
    this.vista.oy = a.pantalla.y - q.y * this.vista.escala;
    this.dibujar();
  }

  /** Al soltar, la vista se acomoda al giro de 90° más cercano con una animación corta. */
  private asentarGiroIso(a: { pivote: Pt; pantalla: Pt }) {
    const desde = this.giroVivo ?? 0;
    const hasta = Math.round(desde);
    const t0 = performance.now();
    const dur = 220;
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - (1 - k) ** 3;
      this.ponerGiroVivo(desde + (hasta - desde) * e, a);
      if (k < 1) {
        this.animGiro = requestAnimationFrame(paso);
        return;
      }
      this.giroVivo = null;
      this.datos.opciones.giroIso = ((hasta % 4) + 4) % 4;
      this.notificar();
    };
    this.animGiro = requestAnimationFrame(paso);
  }

  private panelIsometrico() {
    const p = this.panel;
    const o = opcionesIso(this.datos);
    p.append(
      h('h3', { textContent: 'Vista isométrica' }),
      h('p', {
        textContent:
          'El plano en 3D, con los muros levantados y los muebles como volúmenes. Arrastra para mover la vista, arrastra con el botón derecho (o Shift + arrastrar) para girarla y usa la rueda para acercar. Para editar, vuelve a Plano.',
      }),
    );
    const altura = h('input', { type: 'number', value: String(o.altura), min: '0.2', max: '6', step: '0.1' });
    altura.addEventListener('input', () => {
      const v = parseFloat(altura.value);
      if (!Number.isFinite(v) || v < 0.2 || v > 6) return;
      this.datos.opciones.alturaMuros = v;
      this.notificar();
    });
    p.append(this.campo('Altura de los muros (m)', altura));
    const muros = h('div', { className: 'crq-botones' });
    for (const [txt, v] of [
      ['Completa', ALTURA_MUROS],
      ['Media', 1.2],
      ['Baja', 0.4],
    ] as const) {
      const b = this.boton(txt, `Muros de ${v} m`, () => {
        this.datos.opciones.alturaMuros = v;
        altura.value = String(v);
        this.notificar();
      });
      muros.append(b);
    }
    p.append(muros);
    // Transparencia de los muros que dan al frente, para ver el interior
    const valorTr = h('span', { className: 'crq-valor', textContent: `${Math.round(o.transparencia * 100)} %` });
    const tr = h('input', { type: 'range', min: '0', max: '100', step: '5', value: String(Math.round(o.transparencia * 100)) });
    tr.addEventListener('input', () => {
      this.datos.opciones.transparenciaFrontal = Number(tr.value);
      valorTr.textContent = `${tr.value} %`;
      this.notificar();
    });
    p.append(
      h('label', { className: 'crq-campo' }, [
        h('span', { className: 'crq-fila-etq' }, ['Transparencia de muros frontales', valorTr]),
        tr,
      ]),
    );
    const giro = h('div', { className: 'crq-botones' });
    const girar = (d: number) => {
      this.datos.opciones.giroIso = (opcionesIso(this.datos).giro + d + 4) % 4;
      this.notificar();
      this.encuadrar();
    };
    giro.append(
      this.boton(ICONOS.girarIzq + 'Girar', 'Girar la vista a la izquierda', () => girar(-1)),
      this.boton(ICONOS.girarDer + 'Girar', 'Girar la vista a la derecha', () => girar(1)),
    );
    p.append(this.campo('Ver desde otro lado', giro));
    p.append(
      h('p', {
        textContent: this.o.modo === 'modal' ? 'Al guardar, la imagen del croquis sale en esta vista.' : 'Descargar PNG guarda la imagen en esta vista.',
      }),
    );
  }

  private panelPropiedades(el: Elemento) {
    const p = this.panel;
    const nombres: Record<Elemento['tipo'], string> = {
      muro: (el as Muro).chaflan ? 'Corte de esquina' : 'Muro',
      puerta: 'Puerta',
      ventana: 'Ventana',
      area: (el as Area).muros?.length ? 'Cuarto' : 'Área',
      mueble: itemPorClave((el as Mueble).clave)?.nombre ?? 'Mueble',
      texto: 'Etiqueta',
      acceso: 'Acceso',
      cota: 'Cota',
      linea: 'Línea',
      trazo: 'Trazo',
      norte: 'Orientación',
    };
    p.append(h('h3', { textContent: nombres[el.tipo] }));
    switch (el.tipo) {
      case 'muro':
        if (el.chaflan) {
          p.append(h('p', { textContent: 'Arrastra la flecha del centro para mover el corte en paralelo, o sus extremos sobre los muros. También puedes escribir la distancia.' }));
          p.append(this.campoNum('Distancia del corte (m)', +this.distanciaChaflan(el).toFixed(2), 0.05, 50, 0.05, (v) => this.aplicarChaflan(el, v)));
          if (this.cortesEmpalmados(el).length) {
            p.append(this.campoCheck('Ajustar esquinas empalmadas', this.empalmar, (v) => {
              this.empalmar = v;
              // Al activarlo, iguala de una vez los cortes de la misma esquina
              if (v) this.aplicarChaflan(el, this.distanciaChaflan(el));
            }));
            p.append(h('p', { textContent: 'Hay otro cuarto con un corte en esta misma esquina. Activado, ambos cortes se mueven juntos y quedan parejos.' }));
          }
          p.append(this.campoNum('Grosor (m)', el.grosor, 0.05, 0.6, 0.01, (v) => (el.grosor = v)));
          p.append(this.campoColor('Color', el.color, (c) => (el.color = c)));
          break;
        }
        p.append(this.campoNum('Largo (m)', +dist(el.a, el.b).toFixed(2), 0.05, 200, 0.05, (v) => {
          const l = dist(el.a, el.b) || 1;
          el.b = { x: el.a.x + ((el.b.x - el.a.x) / l) * v, y: el.a.y + ((el.b.y - el.a.y) / l) * v };
        }));
        p.append(this.campoNum('Grosor (m)', el.grosor, 0.05, 0.6, 0.01, (v) => (el.grosor = v)));
        p.append(this.campoColor('Color', el.color, (c) => (el.color = c)));
        break;
      case 'puerta':
      case 'ventana':
        p.append(this.campoNum('Ancho (m)', el.ancho, 0.3, 6, 0.05, (v) => (el.ancho = v)));
        if (el.tipo === 'puerta') {
          p.append(this.campoCheck('Doble abatimiento (vaivén)', !!el.vaiven, (v) => (el.vaiven = v)));
          p.append(this.campoCheck('Doble puerta (dos puertas)', el.hojas === 2, (v) => {
            el.hojas = v ? 2 : 1;
            this.actualizarPanel();
          }));
          p.append(this.campoCheck(el.vaiven ? 'Hoja principal del otro lado' : 'Abre hacia el otro lado', el.invertir, (v) => (el.invertir = v)));
          if (el.hojas !== 2) p.append(this.campoCheck('Bisagra del otro lado', el.espejo, (v) => (el.espejo = v)));
        }
        p.append(this.campoColor('Color', el.color, (c) => (el.color = c)));
        break;
      case 'area': {
        p.append(this.campoTexto('Etiqueta', el.nombre, (v) => (el.nombre = v)));
        p.append(this.campoNum('Tamaño de letra (cm)', Math.round((el.tamEtq ?? 0.3) * 100), 5, 300, 5, (v) => (el.tamEtq = v / 100)));
        p.append(this.campoCheck('Mostrar superficie (m²)', el.mostrarM2, (v) => (el.mostrarM2 = v)));
        p.append(this.campoColor('Color de letra', el.colorEtq ?? '#111827', (c) => (el.colorEtq = c)));
        if (el.etqPos) {
          p.append(h('div', { className: 'crq-botones' }, [
            this.boton('Centrar etiqueta', 'Regresa la etiqueta al centro', () => this.editar(() => {
              el.etqPos = null;
              this.actualizarPanel();
            }, true)),
          ]));
        }
        p.append(this.campoColor(el.muros?.length ? 'Color de fondo' : 'Relleno', el.relleno, (c) => (el.relleno = c), el.muros?.length ? ['#ffffff', ...RELLENOS] : RELLENOS));
        p.append(this.campoNum('Opacidad (%)', Math.round(el.opacidad * 100), 0, 100, 5, (v) => (el.opacidad = v / 100)));
        p.append(this.campoSelect('Patrón', el.patron, PATRONES.map((x) => [x.v, x.n]), (v) => (el.patron = v as Patron)));
        p.append(this.campoColor(el.muros?.length ? 'Color del patrón' : 'Borde y patrón', el.borde, (c) => (el.borde = c)));
        break;
      }
      case 'mueble':
        p.append(this.campoTexto('Etiqueta', el.etiqueta, (v) => (el.etiqueta = v)));
        p.append(this.campoCheck('Ajustar texto al mueble', !!el.ajustarEtq, (v) => (el.ajustarEtq = v)));
        p.append(this.campoNum('Ancho (m)', el.ancho, 0.1, 20, 0.05, (v) => (el.ancho = v)));
        p.append(this.campoNum('Fondo (m)', el.alto, 0.1, 20, 0.05, (v) => (el.alto = v)));
        p.append(this.campoNum('Ángulo (°)', Math.round((el.ang * 180) / Math.PI), -360, 360, 15, (v) => (el.ang = (v * Math.PI) / 180)));
        p.append(this.campoColor('Color', el.color, (c) => (el.color = c)));
        if (tieneHaz(el.clave)) {
          p.append(h('h3', { textContent: 'Haz de rayos X' }));
          p.append(this.campoCheck('Mostrar el haz (amarillo)', !!el.haz, (v) => {
            el.haz = v;
            this.actualizarPanel();
          }));
          if (el.haz) {
            p.append(this.campoNum('Amplitud del campo (m)', el.hazAmplitud ?? 0.5, 0.1, 3, 0.05, (v) => (el.hazAmplitud = v)));
            // Alcance: automático (hasta el primer muro o mueble alto) o fijo; también con la flecha doble del lienzo
            const chkAuto = this.campoCheck('Automática (hasta el primer muro o mueble alto)', el.hazDistancia === undefined, (v) => {
              if (v) delete el.hazDistancia;
              else el.hazDistancia = Math.round(alcanceHaz(el, this.datos) * 100) / 100;
              this.actualizarPanel();
            });
            p.append(
              this.campoNum('Distancia del haz (m)', Math.round(alcanceHaz(el, this.datos) * 100) / 100, 0.2, 8, 0.05, (v) => {
                el.hazDistancia = v;
                const c = chkAuto.querySelector('input');
                if (c) c.checked = false;
              }),
              chkAuto,
            );
            const valor = h('span', { className: 'crq-valor', textContent: `${el.hazTransparencia ?? 60} %` });
            const r = h('input', { type: 'range', min: '0', max: '95', step: '5', value: String(el.hazTransparencia ?? 60) });
            r.addEventListener('input', () => {
              valor.textContent = `${r.value} %`;
              this.editar(() => (el.hazTransparencia = Number(r.value)), false);
            });
            r.addEventListener('change', () => this.editar(() => (el.hazTransparencia = Number(r.value)), true));
            p.append(h('label', { className: 'crq-campo' }, [h('span', { className: 'crq-fila-etq' }, ['Transparencia del haz', valor]), r]));
          }
        }
        break;
      case 'texto': {
        const t = this.campoTexto('Texto', el.texto, (v) => (el.texto = v), true);
        p.append(t);
        p.append(this.campoNum('Tamaño (m)', el.tam, 0.05, 3, 0.05, (v) => (el.tam = v)));
        p.append(this.campoCheck('Negrita', el.negrita, (v) => (el.negrita = v)));
        p.append(this.campoNum('Ángulo (°)', Math.round((el.ang * 180) / Math.PI), -360, 360, 15, (v) => (el.ang = (v * Math.PI) / 180)));
        p.append(this.campoColor('Color', el.color, (c) => (el.color = c)));
        break;
      }
      case 'norte':
        p.append(
          this.campoSelect('Punto cardinal', el.punto ?? 'N', [['N', 'Norte (N)'], ['S', 'Sur (S)'], ['E', 'Este (E)'], ['O', 'Oeste (O)']], (v) => (el.punto = v as PuntoCardinal)),
        );
        p.append(h('p', { textContent: 'La flecha apunta hacia el punto elegido y la letra queda fija. Gira la flecha con la manija redonda (Shift para giro libre) o escribe el ángulo: 0° es hacia arriba del plano y aumenta en el sentido del reloj.' }));
        p.append(this.campoNum('Ángulo de la flecha (°)', Math.round((((el.ang * 180) / Math.PI) % 360 + 360) % 360), 0, 359, 1, (v) => (el.ang = normalizarAng((v * Math.PI) / 180))));
        p.append(this.campoNum('Tamaño (m)', el.tam, 0.3, 5, 0.1, (v) => (el.tam = v)));
        break;
      case 'acceso':
        p.append(this.campoTexto('Texto', el.texto, (v) => (el.texto = v)));
        p.append(this.campoColor('Color', el.color, (c) => (el.color = c)));
        break;
      case 'cota':
        p.append(h('p', { textContent: `Distancia: ${formatoM(dist(el.a, el.b))}` }));
        p.append(this.campoColor('Color', el.color, (c) => (el.color = c)));
        break;
      case 'linea':
        p.append(this.campoNum('Grosor (cm)', Math.round(el.grosor * 100), 1, 30, 1, (v) => (el.grosor = v / 100)));
        p.append(this.campoCheck('Discontinua', el.discontinua, (v) => (el.discontinua = v)));
        p.append(this.campoColor('Color', el.color, (c) => (el.color = c)));
        break;
      case 'trazo':
        p.append(this.campoNum('Grosor (cm)', Math.round(el.grosor * 100), 1, 30, 1, (v) => (el.grosor = v / 100)));
        p.append(this.campoColor('Color', el.color, (c) => (el.color = c)));
        break;
    }
    p.append(this.accionesSeleccion());
  }

  private accionesSeleccion() {
    const cont = h('div', { className: 'crq-botones' });
    const sel = this.seleccionados();
    if (sel.some((e) => e.tipo === 'mueble' || e.tipo === 'puerta' || e.tipo === 'ventana' || e.tipo === 'texto' || e.tipo === 'norte')) {
      cont.append(this.boton('Girar 90°', 'Girar (R)', () => this.girarSeleccion(Math.PI / 2)));
    }
    cont.append(
      this.boton('Duplicar', 'Ctrl+D', () => this.duplicar()),
      this.boton('Al frente', 'Dibujar encima', () => this.reordenar(true)),
      this.boton('Al fondo', 'Dibujar debajo', () => this.reordenar(false)),
      this.boton('Eliminar', 'Supr', () => this.eliminarSeleccion(), 'crq-peligro'),
    );
    return cont;
  }

  /** Registra el estado previo una sola vez por edición del panel. */
  private editar(fn: () => void, confirmar: boolean) {
    if (this.pendiente === null) this.pendiente = this.instantanea();
    fn();
    if (confirmar) {
      this.historial.push(this.pendiente);
      this.rehechos = [];
      this.pendiente = null;
    }
    this.notificar();
  }

  private campo(etiqueta: string, control: HTMLElement, fila = false) {
    return h('label', { className: 'crq-campo' + (fila ? ' crq-fila' : '') }, [etiqueta, control]);
  }

  private campoNum(etq: string, valor: number, min: number, max: number, paso: number, set: (v: number) => void) {
    const i = h('input', { type: 'number', value: String(valor), min: String(min), max: String(max), step: String(paso) });
    const aplicar = (conf: boolean) => {
      const v = parseFloat(i.value);
      if (Number.isFinite(v) && v >= min && v <= max) this.editar(() => set(v), conf);
    };
    i.addEventListener('input', () => aplicar(false));
    i.addEventListener('change', () => aplicar(true));
    return this.campo(etq, i);
  }

  private campoTexto(etq: string, valor: string, set: (v: string) => void, largo = false) {
    const i = largo ? h('textarea', { value: valor }) : h('input', { type: 'text', value: valor });
    i.addEventListener('input', () => this.editar(() => set(i.value), false));
    i.addEventListener('change', () => this.editar(() => set(i.value), true));
    return this.campo(etq, i);
  }

  private campoCheck(etq: string, valor: boolean, set: (v: boolean) => void, historial = true) {
    const i = h('input', { type: 'checkbox', checked: valor });
    i.addEventListener('change', () => (historial ? this.editar(() => set(i.checked), true) : (set(i.checked), this.dibujar())));
    return this.campo(etq, i, true);
  }

  private campoSelect(etq: string, valor: string, ops: [string, string][], set: (v: string) => void, historial = true) {
    const s = h('select');
    for (const [v, n] of ops) s.append(h('option', { value: v, textContent: n, selected: v === valor }));
    s.addEventListener('change', () => (historial ? this.editar(() => set(s.value), true) : set(s.value)));
    return this.campo(etq, s);
  }

  private campoColor(etq: string, valor: string, set: (c: string) => void, paleta = COLORES) {
    const i = h('input', { type: 'color', value: valor });
    i.addEventListener('input', () => this.editar(() => set(i.value), false));
    i.addEventListener('change', () => this.editar(() => set(i.value), true));
    const muestras = h('div', { className: 'crq-colores' });
    for (const c of paleta) {
      const b = h('button', { type: 'button', title: c });
      b.style.background = c;
      b.addEventListener('click', () => {
        i.value = c;
        this.editar(() => set(c), true);
      });
      muestras.append(b);
    }
    const cont = h('div', { className: 'crq-campo' }, [h('span', { textContent: etq }), div('display:flex;gap:6px;align-items:center', [i, muestras])]);
    return cont;
  }

  private aplicarColor(el: Elemento, c: string) {
    if (el.tipo === 'area') el.borde = c;
    else if (el.tipo !== 'norte') el.color = c;
  }

  // ───────────────────────── Historial ─────────────────────────

  private instantanea() {
    return JSON.stringify(this.datos.elementos);
  }

  /** Guarda el estado actual antes de modificarlo. */
  private registrar(previo = this.instantanea()) {
    this.historial.push(previo);
    if (this.historial.length > 200) this.historial.shift();
    this.rehechos = [];
  }

  deshacer() {
    this.terminarPoli();
    const prev = this.historial.pop();
    if (prev === undefined) return;
    this.rehechos.push(this.instantanea());
    this.datos.elementos = JSON.parse(prev);
    this.limpiarSeleccion();
    this.notificar();
  }

  rehacer() {
    const sig = this.rehechos.pop();
    if (sig === undefined) return;
    this.historial.push(this.instantanea());
    this.datos.elementos = JSON.parse(sig);
    this.limpiarSeleccion();
    this.notificar();
  }

  private limpiarSeleccion() {
    const ids = new Set(this.datos.elementos.map((e) => e.id));
    for (const id of [...this.seleccion]) if (!ids.has(id)) this.seleccion.delete(id);
    this.actualizarPanel();
  }

  private notificar() {
    this.sincronizarCuartos();
    this.cambiado = true;
    this.o.alCambiar?.(this.datos);
    this.actualizarEstado();
    this.dibujar();
  }

  private agregar(...els: Elemento[]) {
    this.registrar();
    this.datos.elementos.push(...els);
    this.notificar();
  }

  // ───────────────────────── Acciones sobre la selección ─────────────────────────

  eliminarSeleccion() {
    if (!this.seleccion.size) return;
    this.registrar();
    this.datos.elementos = this.datos.elementos.filter((e) => !this.seleccion.has(e.id));
    this.seleccion.clear();
    this.actualizarPanel();
    this.notificar();
  }

  private duplicar() {
    const sel = this.seleccionados();
    if (!sel.length) return;
    const ids = new Map<string, string>();
    const copias = sel.map((e) => {
      const c = JSON.parse(JSON.stringify(e)) as Elemento;
      c.id = nuevoId();
      ids.set(e.id, c.id);
      mover(c, 0.5, 0.5);
      return c;
    });
    for (const c of copias) {
      if (c.tipo === 'muro' && c.chaflan) {
        const [x, y] = c.chaflan.muros.map((m) => ids.get(m));
        if (x && y) c.chaflan.muros = [x, y];
        else delete c.chaflan;
      }
      if (c.tipo === 'area' && c.muros) {
        const nuevos = c.muros.map((m) => ids.get(m));
        if (nuevos.every(Boolean)) c.muros = nuevos as string[];
        else delete c.muros;
      }
    }
    this.agregar(...copias);
    this.seleccion = new Set(copias.map((c) => c.id));
    this.actualizarPanel();
  }

  private reordenar(alFrente: boolean) {
    this.registrar();
    const sel = this.datos.elementos.filter((e) => this.seleccion.has(e.id));
    const resto = this.datos.elementos.filter((e) => !this.seleccion.has(e.id));
    this.datos.elementos = alFrente ? [...resto, ...sel] : [...sel, ...resto];
    this.notificar();
  }

  private girarSeleccion(ang: number) {
    const sel = this.seleccionados();
    if (!sel.length) return;
    this.registrar();
    for (const el of sel) {
      if (el.tipo === 'mueble' || el.tipo === 'texto' || el.tipo === 'norte') el.ang = normalizarAng(el.ang + ang);
      else if (el.tipo === 'puerta') {
        // Recorre las 4 orientaciones de la puerta sobre el mismo muro
        if (!el.invertir && !el.espejo) el.espejo = true;
        else if (el.espejo && !el.invertir) el.invertir = true;
        else if (el.invertir && el.espejo) el.espejo = false;
        else el.invertir = false;
      } else if (el.tipo === 'ventana') el.ang = normalizarAng(el.ang + ang);
    }
    this.actualizarPanel();
    this.notificar();
  }

  private moverSeleccion(dx: number, dy: number) {
    for (const el of this.seleccionados()) mover(el, dx, dy);
  }

  // ───────────────────────── Vista ─────────────────────────

  private ajustarTamano() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(1, Math.round(r.width * dpr));
    this.canvas.height = Math.max(1, Math.round(r.height * dpr));
    this.dibujarAhora();
  }

  encuadrar() {
    const r = this.canvas.getBoundingClientRect();
    if (this.isometrico) {
      if (r.width >= 10) this.vista = encuadreIso(this.datos, opcionesIso(this.datos), r.width, r.height, 40, MAX_ESCALA);
      this.actualizarEstado();
      this.dibujar();
      return;
    }
    const c = cajaDeTodos(this.datos.elementos);
    if (!c || r.width < 10) {
      this.vista = { escala: ESCALA_INICIAL, ox: 60, oy: 60 };
    } else {
      const w = Math.max(c.maxx - c.minx, 1);
      const hh = Math.max(c.maxy - c.miny, 1);
      const escala = clamp(Math.min((r.width - 80) / w, (r.height - 80) / hh), MIN_ESCALA, MAX_ESCALA);
      this.vista = { escala, ox: r.width / 2 - ((c.minx + c.maxx) / 2) * escala, oy: r.height / 2 - ((c.miny + c.maxy) / 2) * escala };
    }
    this.actualizarEstado();
    this.dibujar();
  }

  private zoom(f: number, centro?: { x: number; y: number }) {
    const r = this.canvas.getBoundingClientRect();
    const c = centro ?? { x: r.width / 2, y: r.height / 2 };
    const nueva = clamp(this.vista.escala * f, MIN_ESCALA, MAX_ESCALA);
    const k = nueva / this.vista.escala;
    this.vista = { escala: nueva, ox: c.x - (c.x - this.vista.ox) * k, oy: c.y - (c.y - this.vista.oy) * k };
    this.actualizarEstado();
    this.dibujar();
  }

  private aMundo(sx: number, sy: number): Pt {
    return { x: (sx - this.vista.ox) / this.vista.escala, y: (sy - this.vista.oy) / this.vista.escala };
  }

  private enPantalla(e: { clientX: number; clientY: number }) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  // ───────────────────────── Ajustes del cursor ─────────────────────────

  private tol(px = 8) {
    return px / this.vista.escala;
  }

  /** Ajusta un punto a esquinas existentes, ángulos rectos y la rejilla. */
  private ajustar(p: Pt, ref?: Pt | null, excluir?: Set<string>): Pt {
    // 1. Esquinas y extremos existentes
    let mejor: Pt | null = null;
    let md = this.tol(10);
    for (const el of this.datos.elementos) {
      if (excluir?.has(el.id)) continue;
      for (const q of puntosClave(el)) {
        const d = dist(p, q);
        if (d < md) {
          md = d;
          mejor = q;
        }
      }
    }
    if (this.poli && this.poli.puntos.length > 1) {
      const q = this.poli.puntos[0];
      if (dist(p, q) < md) mejor = q;
    }
    if (mejor) return { x: mejor.x, y: mejor.y };
    let r = { ...p };
    if (ref) {
      const dx = p.x - ref.x;
      const dy = p.y - ref.y;
      const l = Math.hypot(dx, dy);
      if (this.shift) {
        const ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
        r = { x: ref.x + Math.cos(ang) * l, y: ref.y + Math.sin(ang) * l };
        if (this.iman) {
          const lr = Math.round(l / PASO_REJILLA) * PASO_REJILLA;
          r = { x: ref.x + Math.cos(ang) * lr, y: ref.y + Math.sin(ang) * lr };
        }
        return r;
      }
      // Ortogonal automático cerca de 0°/90°
      if (Math.abs(dy) < Math.abs(dx) * 0.1) r.y = ref.y;
      else if (Math.abs(dx) < Math.abs(dy) * 0.1) r.x = ref.x;
    }
    if (this.iman) {
      if (!ref || r.x !== ref.x) r.x = redondear(r.x);
      if (!ref || r.y !== ref.y) r.y = redondear(r.y);
    }
    return r;
  }

  /** Busca el muro más cercano para colocar una puerta o ventana. */
  private colocarEnMuro(p: Pt, ancho: number): { p: Pt; ang: number; grosor: number } | null {
    let mejor: { p: Pt; ang: number; grosor: number } | null = null;
    let md = Math.max(this.tol(25), 0.3);
    for (const el of this.datos.elementos) {
      if (el.tipo !== 'muro') continue;
      const l = dist(el.a, el.b);
      if (l < 0.01) continue;
      const { pt, t } = proyectar(p, el.a, el.b);
      const d = dist(p, pt);
      if (d < md) {
        md = d;
        const minT = Math.min(0.5, ancho / 2 / l);
        let tt = clamp(t, minT, 1 - minT);
        if (this.iman) tt = clamp(Math.round((tt * l) / PASO_REJILLA) * PASO_REJILLA / l, minT, 1 - minT);
        mejor = {
          p: { x: el.a.x + (el.b.x - el.a.x) * tt, y: el.a.y + (el.b.y - el.a.y) * tt },
          ang: Math.atan2(el.b.y - el.a.y, el.b.x - el.a.x),
          grosor: el.grosor,
        };
      }
    }
    return mejor;
  }

  private nuevaAbertura(herr: 'puerta' | 'puerta2' | 'ventana', p: Pt): Abertura {
    const tipo = herr === 'ventana' ? 'ventana' : 'puerta';
    const vaiven = herr === 'puerta2';
    const hojas: 1 | 2 = vaiven && this.estilo.dobleHoja ? 2 : 1;
    const ancho = tipo === 'ventana' ? 1.2 : hojas === 2 ? 1.4 : 0.9;
    const m = this.colocarEnMuro(p, ancho);
    return {
      id: nuevoId(),
      tipo,
      p: m?.p ?? (this.iman ? { x: redondear(p.x), y: redondear(p.y) } : p),
      ang: m ? m.ang : this.fantasmaAng,
      ancho,
      grosor: m?.grosor ?? this.estilo.grosorMuro,
      invertir: this.aberturaInvertir,
      espejo: false,
      ...(vaiven ? { vaiven, hojas } : {}),
      color: '#111827',
    };
  }

  private nuevoMueble(p: Pt): Mueble {
    const it = itemPorClave(this.muebleClave) ?? CATALOGO[0];
    return {
      id: nuevoId(),
      tipo: 'mueble',
      clave: it.clave,
      p: this.iman ? { x: redondear(p.x), y: redondear(p.y) } : p,
      ancho: it.ancho,
      alto: it.alto,
      ang: this.fantasmaAng,
      color: '#111827',
      etiqueta: '',
      ajustarEtq: true,
    };
  }

  // ───────────────────────── Polilíneas (muros y áreas) ─────────────────────────

  private terminarPoli() {
    const poli = this.poli;
    this.poli = null;
    this.medida = '';
    if (poli?.tipo === 'area' && poli.puntos.length >= 3) {
      this.agregar(this.nuevaArea(poli.puntos));
    }
    this.dibujar();
  }

  private nuevaArea(puntos: Pt[]): Area {
    return {
      id: nuevoId(),
      tipo: 'area',
      puntos: puntos.map((p) => ({ ...p })),
      relleno: this.estilo.relleno,
      opacidad: 0.5,
      patron: this.estilo.patron,
      borde: '#475569',
      nombre: '',
      mostrarM2: true,
    };
  }

  /** Crea los muros de un cuarto con su piso ligado y deja lista la etiqueta para escribirla. */
  private crearCuarto(pts: Pt[]) {
    const cortes: Muro[] = [];
    pts = this.ajustarACortes(pts, cortes);
    const muros = pts.map((q, i) => this.nuevoMuro(q, pts[(i + 1) % pts.length]));
    const piso: Area = {
      ...this.nuevaArea(pts),
      relleno: this.estilo.fondoCuarto,
      opacidad: 1,
      patron: 'ninguno',
      muros: muros.map((m) => m.id),
      tamEtq: 0.3,
    };
    this.registrar();
    for (const c of cortes) this.marcarCortes(piso, c.a, c.b, c.chaflan!.q, muros);
    // El piso va al final de la lista para quedar encima de los cuartos que ya existen
    // (por ejemplo, un cuarto dentro de otro). El dibujo ya pone las áreas debajo de muros y muebles.
    this.datos.elementos.push(piso, ...muros);
    this.notificar();
    this.cambiarHerramienta('seleccionar');
    this.seleccion = new Set(this.grupoDe(piso));
    this.actualizarPanel();
    this.panel.querySelector<HTMLInputElement>('input[type=text]')?.focus();
  }

  private nuevoMuro(a: Pt, b: Pt): Muro {
    return { id: nuevoId(), tipo: 'muro', a: { ...a }, b: { ...b }, grosor: this.estilo.grosorMuro, color: this.estilo.muro };
  }

  private clicPoli(p: Pt) {
    if (!this.poli) {
      this.poli = { tipo: this.herr === 'area' ? 'area' : 'muro', puntos: [p] };
      return;
    }
    const pts = this.poli.puntos;
    const ultimo = pts[pts.length - 1];
    if (dist(p, ultimo) < 1e-6) {
      // Doble clic en el mismo punto: terminar
      this.terminarPoli();
      return;
    }
    const cierra = pts.length > 1 && dist(p, pts[0]) < 1e-6;
    if (this.poli.tipo === 'muro') this.agregar(this.nuevoMuro(ultimo, p));
    if (cierra) {
      if (this.poli.tipo === 'area') this.terminarPoli();
      else {
        this.poli = null;
        this.dibujar();
      }
      return;
    }
    pts.push(p);
    this.dibujar();
  }

  /** Coloca el siguiente punto del muro a la distancia escrita. */
  private aplicarMedida() {
    const v = parseFloat(this.medida.replace(',', '.'));
    this.medida = '';
    if (!this.poli || !Number.isFinite(v) || v <= 0) return this.actualizarEstado();
    const ult = this.poli.puntos[this.poli.puntos.length - 1];
    const c = this.cursor ? this.ajustar(this.cursor, ult) : { x: ult.x + 1, y: ult.y };
    const l = dist(ult, c) || 1;
    const dx = c.x - ult.x || 1;
    const dy = c.y - ult.y;
    this.clicPoli({ x: ult.x + (dx / l) * v, y: ult.y + (dy / l) * v });
    this.actualizarEstado();
  }

  // ───────────────────────── Cortar esquinas y partir muros ─────────────────────────

  /** Muros que tienen un extremo en q. */
  private murosEn(q: Pt): { el: Muro; extremo: 'a' | 'b' }[] {
    const r: { el: Muro; extremo: 'a' | 'b' }[] = [];
    for (const o of this.datos.elementos) {
      if (o.tipo !== 'muro') continue;
      if (dist(o.a, q) < 1e-6) r.push({ el: o, extremo: 'a' });
      else if (dist(o.b, q) < 1e-6) r.push({ el: o, extremo: 'b' });
    }
    return r;
  }

  /**
   * Muros que llegan a q agrupados por dirección. Es una esquina si hay exactamente dos direcciones,
   * aunque varios muros compartan cada una (por ejemplo, un cuarto metido en la esquina de otro).
   */
  private gruposEsquina(q: Pt) {
    const grupos: { dir: Pt; ms: { el: Muro; extremo: 'a' | 'b' }[] }[] = [];
    for (const m of this.murosEn(q)) {
      const otro = m.extremo === 'a' ? m.el.b : m.el.a;
      const l = dist(q, otro);
      if (l < 1e-6) continue;
      const d = { x: (otro.x - q.x) / l, y: (otro.y - q.y) / l };
      const g = grupos.find((g) => g.dir.x * d.x + g.dir.y * d.y > 0.999);
      if (g) g.ms.push(m);
      else grupos.push({ dir: d, ms: [m] });
    }
    return grupos.length === 2 ? grupos : null;
  }

  /** Esquina más cercana al punto. */
  private esquinaCerca(p: Pt): Pt | null {
    let mejor: Pt | null = null;
    let md = this.tol(14);
    for (const o of this.datos.elementos) {
      if (o.tipo !== 'muro') continue;
      for (const q of [o.a, o.b]) {
        const d = dist(p, q);
        if (d < md && this.gruposEsquina(q)) {
          md = d;
          mejor = q;
        }
      }
    }
    return mejor;
  }

  private cortarEsquina(p: Pt) {
    const q = this.esquinaCerca(p);
    if (!q) return this.aviso('Haz clic en una esquina donde se unen dos muros.');
    const [gu, gv] = this.gruposEsquina(q)!;
    // Se corta el cuarto más grande que tenga esta esquina; los cuartos de adentro se ajustan al corte después.
    const cuartos = this.datos.elementos.filter((e): e is Area => e.tipo === 'area' && !!e.muros?.length);
    let u = gu.ms[0];
    let v = gv.ms[0];
    let principal: Area | null = null;
    let mayor = -1;
    for (const c of cuartos) {
      for (const x of gu.ms)
        for (const y of gv.ms) {
          if (!c.muros!.includes(x.el.id) || !c.muros!.includes(y.el.id)) continue;
          const a = areaPoligono(this.esquinasCuarto(c));
          if (a > mayor) [mayor, u, v, principal] = [a, x, y, c];
        }
    }
    const largo = (m: { el: Muro; extremo: 'a' | 'b' }) => dist(m.el.a, m.el.b);
    const d = Math.min(this.estilo.chaflan, largo(u) * 0.9, largo(v) * 0.9);
    const recorte = (m: { el: Muro; extremo: 'a' | 'b' }): Pt => {
      const otro = m.extremo === 'a' ? m.el.b : m.el.a;
      const l = dist(q, otro) || 1;
      return { x: q.x + ((otro.x - q.x) / l) * d, y: q.y + ((otro.y - q.y) / l) * d };
    };
    this.registrar();
    const pu = recorte(u);
    const pv = recorte(v);
    // Orden de recorrido: el muro que termina en la esquina va antes que el que empieza en ella
    const [antes, despues] = u.extremo === 'b' ? [u, v] : [v, u];
    const pA = antes === u ? pu : pv;
    const pD = despues === u ? pu : pv;
    antes.el[antes.extremo] = pA;
    despues.el[despues.extremo] = pD;
    const nuevo: Muro = {
      id: nuevoId(),
      tipo: 'muro',
      a: { ...pA },
      b: { ...pD },
      grosor: antes.el.grosor,
      color: antes.el.color,
      chaflan: { q: { ...q }, muros: [antes.el.id, despues.el.id] },
    };
    this.datos.elementos.push(nuevo);
    this.insertarEnCuartos(antes.el.id, despues.el.id, [nuevo.id]);
    // Los demás cuartos que ocupan esa esquina se recortan con la misma diagonal
    for (const c of cuartos) {
      if (c === principal) continue;
      const pts = this.esquinasCuarto(c);
      if (pts.length < 3 || !(enPoligono(q, pts) || distBorde(q, pts) < 1e-3)) continue;
      this.rehacerCuarto(c, recortarPoligono(pts, pA, pD, q));
      this.marcarCortes(c, pA, pD, q);
    }
    this.notificar();
    // Deja seleccionado el corte para ajustarlo arrastrando sus extremos o desde el panel
    this.cambiarHerramienta('seleccionar');
    this.seleccion = new Set([nuevo.id]);
    this.actualizarPanel();
    this.dibujar();
  }

  /** Recorta un cuarto nuevo con los cortes de esquina que lo atraviesan, para que siga la diagonal. */
  private ajustarACortes(pts: Pt[], usados: Muro[] = []): Pt[] {
    for (const c of this.datos.elementos) {
      if (c.tipo !== 'muro' || !c.chaflan) continue;
      const q = c.chaflan.q;
      if (!(enPoligono(q, pts) || distBorde(q, pts) < 0.05)) continue;
      const sq = lado(q, c.a, c.b);
      const lados = pts.map((p) => lado(p, c.a, c.b) * sq);
      if (!lados.some((s) => s > 1e-9) || !lados.some((s) => s < -1e-9)) continue;
      const r = recortarPoligono(pts, c.a, c.b, q);
      if (r.length >= 3) {
        pts = r;
        usados.push(c);
      }
    }
    return pts;
  }

  /**
   * Marca como corte de esquina el muro del cuarto que quedó sobre la diagonal a–b, para que se pueda
   * ajustar igual que un corte y moverse junto con el corte empalmado. Solo si sus vecinos pasan por q.
   */
  private marcarCortes(c: Area, a: Pt, b: Pt, q: Pt, lista?: Muro[]) {
    const porId = new Map((lista ?? this.datos.elementos).map((e) => [e.id, e]));
    const ms = (c.muros ?? []).map((id) => porId.get(id)).filter((m): m is Muro => m?.tipo === 'muro');
    const sobre = (p: Pt, x: Pt, y: Pt) => Math.abs(lado(p, x, y)) / (dist(x, y) || 1) < 1e-4;
    ms.forEach((m, i) => {
      if (!sobre(m.a, a, b) || !sobre(m.b, a, b)) return;
      const prev = ms[(i - 1 + ms.length) % ms.length];
      const sig = ms[(i + 1) % ms.length];
      if (!sobre(q, prev.a, prev.b) || !sobre(q, sig.a, sig.b)) return;
      m.chaflan = { q: { ...q }, muros: [prev.id, sig.id] };
    });
  }

  /** Cambia la forma de un cuarto: reemplaza sus muros por unos nuevos que siguen el polígono. */
  private rehacerCuarto(c: Area, pts: Pt[]) {
    if (pts.length < 3) return;
    const viejos = new Set(c.muros);
    const muestra = this.datos.elementos.find((e): e is Muro => e.tipo === 'muro' && viejos.has(e.id));
    const nuevos = pts.map((p, i) => ({
      ...this.nuevoMuro(p, pts[(i + 1) % pts.length]),
      grosor: muestra?.grosor ?? this.estilo.grosorMuro,
      color: muestra?.color ?? this.estilo.muro,
    }));
    const els = this.datos.elementos;
    const i = els.findIndex((e) => viejos.has(e.id));
    this.datos.elementos = els.filter((e) => !viejos.has(e.id));
    this.datos.elementos.splice(i < 0 ? this.datos.elementos.length : i, 0, ...nuevos);
    c.muros = nuevos.map((m) => m.id);
  }

  /** Vecino del corte en el extremo indicado y su extremo libre. */
  private vecinoChaflan(m: Muro, extremo: 'a' | 'b'): { el: Muro; extremo: 'a' | 'b'; lejos: Pt } | null {
    if (!m.chaflan) return null;
    const id = m.chaflan.muros[extremo === 'a' ? 0 : 1];
    const v = this.datos.elementos.find((e): e is Muro => e.id === id && e.tipo === 'muro');
    if (!v) return null;
    const p = m[extremo];
    const ext: 'a' | 'b' = dist(v.a, p) <= dist(v.b, p) ? 'a' : 'b';
    return { el: v, extremo: ext, lejos: ext === 'a' ? v.b : v.a };
  }

  /** Distancia actual del corte (desde la esquina original). */
  private distanciaChaflan(m: Muro): number {
    if (!m.chaflan) return 0;
    return (dist(m.chaflan.q, m.a) + dist(m.chaflan.q, m.b)) / 2;
  }

  /** Otros cortes hechos sobre la misma esquina original (por ejemplo, el de un cuarto metido en ella). */
  private cortesEmpalmados(m: Muro): Muro[] {
    const q = m.chaflan?.q;
    if (!q) return [];
    return this.datos.elementos.filter((e): e is Muro => e.tipo === 'muro' && e !== m && !!e.chaflan && dist(e.chaflan.q, q) < 1e-6);
  }

  /** Dirección media desde la esquina hacia los dos muros vecinos (sin normalizar). */
  private bisectrizChaflan(m: Muro): Pt | null {
    const q = m.chaflan?.q;
    const va = this.vecinoChaflan(m, 'a');
    const vb = this.vecinoChaflan(m, 'b');
    if (!q || !va || !vb) return null;
    const u = (o: Pt) => {
      const l = dist(q, o) || 1;
      return { x: (o.x - q.x) / l, y: (o.y - q.y) / l };
    };
    const ua = u(va.lejos);
    const ub = u(vb.lejos);
    return { x: (ua.x + ub.x) / 2, y: (ua.y + ub.y) / 2 };
  }

  /** Vuelve a cortar la esquina a la distancia d; si está activo, también los cortes empalmados. */
  private aplicarChaflan(m: Muro, d: number) {
    this.aplicarChaflanUno(m, d);
    if (this.empalmar) for (const o of this.cortesEmpalmados(m)) this.aplicarChaflanUno(o, d);
  }

  private aplicarChaflanUno(m: Muro, d: number) {
    const q = m.chaflan?.q;
    if (!q) return;
    for (const ext of ['a', 'b'] as const) {
      const v = this.vecinoChaflan(m, ext);
      if (!v) continue;
      const l = dist(q, v.lejos) || 1;
      const dd = Math.max(0.05, Math.min(d, l * 0.95));
      const p = { x: q.x + ((v.lejos.x - q.x) / l) * dd, y: q.y + ((v.lejos.y - q.y) / l) * dd };
      v.el[v.extremo] = { ...p };
      m[ext] = { ...p };
    }
  }

  private dividirMuro(p: Pt) {
    let mejor: { m: Muro; t: number } | null = null;
    let md = this.tol(10);
    for (const o of this.datos.elementos) {
      if (o.tipo !== 'muro') continue;
      const { pt, t } = proyectar(p, o.a, o.b);
      const d = dist(p, pt) - o.grosor / 2;
      if (d < md) {
        md = d;
        mejor = { m: o, t };
      }
    }
    if (!mejor) return this.aviso('Haz clic sobre un muro.');
    const { m } = mejor;
    const l = dist(m.a, m.b);
    let t = mejor.t;
    if (this.iman && l > 0) t = Math.round((t * l) / PASO_REJILLA) * PASO_REJILLA / l;
    if (t * l < 0.05 || (1 - t) * l < 0.05) return;
    this.registrar();
    const corte = { x: m.a.x + (m.b.x - m.a.x) * t, y: m.a.y + (m.b.y - m.a.y) * t };
    const segundo: Muro = { ...m, id: nuevoId(), a: { ...corte }, b: { ...m.b } };
    m.b = { ...corte };
    this.datos.elementos.push(segundo);
    this.insertarEnCuartos(m.id, null, [segundo.id]);
    this.notificar();
    // Deja seleccionado el muro para arrastrar la nueva esquina
    this.cambiarHerramienta('seleccionar');
    this.seleccion = new Set([m.id]);
    this.actualizarPanel();
    this.dibujar();
  }

  /** Inserta muros nuevos en la lista de los cuartos, justo después de `despuesDe`. */
  private insertarEnCuartos(despuesDe: string, antesDe: string | null, ids: string[]) {
    for (const el of this.datos.elementos) {
      if (el.tipo !== 'area' || !el.muros) continue;
      const i = el.muros.indexOf(despuesDe);
      if (i < 0) continue;
      if (antesDe && el.muros[(i + 1) % el.muros.length] !== antesDe) continue;
      el.muros.splice(i + 1, 0, ...ids);
    }
  }

  private aviso(txt: string) {
    this.estado.innerHTML = `<span class="crq-aviso">${txt}</span>`;
  }

  // ───────────────────────── Ratón y táctil ─────────────────────────

  private elementoEn(p: Pt): Elemento | null {
    const tol = this.tol(6);
    // Primero los de encima (orden de dibujo invertido); las áreas al final
    const prioridad = (e: Elemento) => (e.tipo === 'area' ? 0 : e.tipo === 'muro' ? 1 : 2);
    // Entre áreas que se encimen gana la más chica, para poder elegir un cuarto que está dentro de otro.
    const tam = (e: Elemento) => (e.tipo === 'area' ? Math.abs(areaPoligono(e.puntos)) : 0);
    const lista = this.datos.elementos
      .map((e, i) => ({ e, i }))
      .sort((a, b) => prioridad(b.e) - prioridad(a.e) || tam(a.e) - tam(b.e) || b.i - a.i);
    for (const { e } of lista) if (toca(e, p, tol)) return e;
    return null;
  }

  /** Cursor sobre las manijas: flecha doble perpendicular al corte en su manija central. */
  private cursorManija(p: Pt): string {
    const m = this.manijas().find((x) => dist(p, x.p) <= this.tol(9));
    if (!m) return 'default';
    const el = this.seleccionados()[0];
    if (m.cual === 'medio' && el?.tipo === 'muro') {
      // Normal al muro (en pantalla y hacia abajo es +y), redondeada a la flecha de cursor más cercana
      const ang = Math.atan2(el.b.y - el.a.y, el.b.x - el.a.x) + Math.PI / 2;
      const paso = ((Math.round(ang / (Math.PI / 4)) % 4) + 4) % 4;
      return ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize'][paso];
    }
    if (m.cual === 'haz' && el?.tipo === 'mueble') {
      const paso = (((Math.round((el.ang + Math.PI / 2) / (Math.PI / 4)) % 4) + 4) % 4);
      return ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize'][paso];
    }
    return m.cual === 'rot' ? 'grab' : 'move';
  }

  /** Manijas del elemento seleccionado (en coordenadas del mundo). */
  private manijas(): { cual: 'a' | 'b' | 'rot' | 'tam' | 'etq' | 'medio' | 'haz' | number; p: Pt }[] {
    const sel = this.seleccionados();
    const cuarto = this.cuartoSeleccionado();
    if (sel.length !== 1 && !cuarto) return [];
    const el = cuarto ?? sel[0];
    if (el.tipo === 'muro' && el.chaflan) {
      const medio = { x: (el.a.x + el.b.x) / 2, y: (el.a.y + el.b.y) / 2 };
      return [{ cual: 'a', p: el.a }, { cual: 'b', p: el.b }, { cual: 'medio', p: medio }];
    }
    if (tieneDosPuntos(el)) return [{ cual: 'a', p: el.a }, { cual: 'b', p: el.b }];
    if (el.tipo === 'area') {
      const etq = el.nombre || el.mostrarM2 ? [{ cual: 'etq' as const, p: posEtiqueta(el) }] : [];
      const vertices = el.muros?.length ? this.esquinasCuarto(el) : el.puntos;
      return [...vertices.map((p, i) => ({ cual: i, p })), ...etq];
    }
    if (el.tipo === 'norte') return [{ cual: 'rot', p: aMundo({ x: 0, y: -el.tam * 0.8 - this.tol(14) }, el.p, el.ang) }];
    if (el.tipo === 'mueble') {
      return [
        { cual: 'rot', p: aMundo({ x: 0, y: -el.alto / 2 - this.tol(22) }, el.p, el.ang) },
        { cual: 'tam', p: aMundo({ x: el.ancho / 2, y: el.alto / 2 }, el.p, el.ang) },
        // Alcance del haz de rayos X: al final del haz, se arrastra a lo largo de él
        ...(el.haz && tieneHaz(el.clave) ? [{ cual: 'haz' as const, p: aMundo({ x: 0, y: el.alto / 2 + alcanceHaz(el, this.datos) }, el.p, el.ang) }] : []),
      ];
    }
    return [];
  }

  private escucharPunteros() {
    const c = this.canvas;
    c.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.poli) this.terminarPoli();
    });
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const s = this.enPantalla(e);
      if (e.ctrlKey || Math.abs(e.deltaY) >= Math.abs(e.deltaX)) this.zoom(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), s);
      else {
        this.vista.ox -= e.deltaX;
        this.dibujar();
      }
    }, { passive: false });
    c.addEventListener('dblclick', (e) => {
      if (this.herr !== 'seleccionar' || this.isometrico) return;
      const p = this.aMundo(this.enPantalla(e).x, this.enPantalla(e).y);
      const el = this.elementoEn(p);
      if (el && (el.tipo === 'texto' || el.tipo === 'area' || el.tipo === 'mueble' || el.tipo === 'acceso')) {
        const campo = this.panel.querySelector<HTMLInputElement | HTMLTextAreaElement>('input[type=text],textarea');
        campo?.focus();
        campo?.select();
      }
    });
    c.addEventListener('pointerdown', (e) => this.alPresionar(e));
    c.addEventListener('pointermove', (e) => this.alMover(e));
    c.addEventListener('pointerup', (e) => this.alSoltar(e));
    c.addEventListener('pointercancel', (e) => {
      this.punteros.delete(e.pointerId);
      this.pellizco = null;
      this.accion = null;
      this.dibujar();
    });
    c.addEventListener('pointerleave', () => {
      if (!this.accion) {
        this.cursor = null;
        this.dibujar();
      }
    });
  }

  private alPresionar(e: PointerEvent) {
    const s = this.enPantalla(e);
    this.punteros.set(e.pointerId, s);
    this.canvas.setPointerCapture(e.pointerId);
    (document.activeElement as HTMLElement | null)?.blur?.();
    if (this.punteros.size === 2) {
      // Pellizco con dos dedos: cancela lo que se estaba haciendo
      const [a, b] = [...this.punteros.values()];
      this.accion = null;
      this.pellizco = { d: Math.hypot(a.x - b.x, a.y - b.y), c: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, ...this.vista };
      return;
    }
    if (this.punteros.size > 2) return;
    if (this.isometrico) {
      // En la vista isométrica solo se mueve o se gira la vista
      if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
        this.empezarGiroIso(s);
        return;
      }
      if (e.button === 0 || e.button === 1) {
        this.accion = { k: 'pan', sx: s.x, sy: s.y, ox: this.vista.ox, oy: this.vista.oy };
        this.canvas.style.cursor = 'grabbing';
      }
      return;
    }
    const p = this.aMundo(s.x, s.y);
    this.shift = e.shiftKey;
    if (e.button === 1 || this.espacio || this.herr === 'mano') {
      this.accion = { k: 'pan', sx: s.x, sy: s.y, ox: this.vista.ox, oy: this.vista.oy };
      this.canvas.style.cursor = 'grabbing';
      return;
    }
    if (e.button !== 0) return;

    switch (this.herr) {
      case 'seleccionar': {
        for (const m of this.manijas()) {
          if (dist(p, m.p) <= this.tol(9)) {
            const el = this.cuartoSeleccionado() ?? this.seleccionados()[0];
            const vinculados: { el: Muro; extremo: 'a' | 'b' }[] = [];
            if (el.tipo === 'area' && el.muros?.length && typeof m.cual === 'number') {
              vinculados.push(...this.murosEn(m.p));
            }
            if (el.tipo === 'muro' && !el.chaflan && (m.cual === 'a' || m.cual === 'b')) {
              const q = el[m.cual];
              for (const o of this.datos.elementos) {
                if (o.tipo !== 'muro' || o === el) continue;
                if (dist(o.a, q) < 1e-6) vinculados.push({ el: o, extremo: 'a' });
                if (dist(o.b, q) < 1e-6) vinculados.push({ el: o, extremo: 'b' });
              }
            }
            this.accion = { k: 'manija', id: el.id, cual: m.cual, previo: this.instantanea(), vinculados };
            return;
          }
        }
        const el = this.elementoEn(p);
        if (el) {
          const grupo = this.grupoDe(el);
          if (e.shiftKey) {
            if (this.seleccion.has(el.id)) grupo.forEach((id) => this.seleccion.delete(id));
            else grupo.forEach((id) => this.seleccion.add(id));
          } else if (!this.seleccion.has(el.id)) {
            this.seleccion = new Set(grupo);
          }
          this.actualizarPanel();
          this.accion = { k: 'mover', ultimo: p, previo: this.instantanea(), movido: false };
        } else {
          if (!e.shiftKey) this.seleccion.clear();
          this.actualizarPanel();
          this.accion = { k: 'marco', a: p, b: p, sumar: e.shiftKey };
        }
        this.dibujar();
        return;
      }
      case 'muro':
        this.clicPoli(this.ajustar(p, this.poli?.puntos[this.poli.puntos.length - 1]));
        return;
      case 'area':
        if (this.poli) this.clicPoli(this.ajustar(p, this.poli.puntos[this.poli.puntos.length - 1]));
        else {
          const a = this.ajustar(p);
          this.accion = { k: 'areaRect', a, b: a };
        }
        return;
      case 'cuarto': {
        const a = this.ajustar(p);
        this.accion = { k: 'cuarto', a, b: a };
        return;
      }
      case 'chaflan':
        this.cortarEsquina(p);
        return;
      case 'dividir':
        this.dividirMuro(p);
        return;
      case 'puerta':
      case 'puerta2':
      case 'ventana': {
        const ab = this.nuevaAbertura(this.herr, p);
        this.agregar(ab);
        return;
      }
      case 'mueble':
        this.agregar(this.nuevoMueble(p));
        return;
      case 'norte': {
        // Solo un norte por croquis: si ya existe, se mueve al nuevo punto
        const previo = this.datos.elementos.find((e): e is Norte => e.tipo === 'norte');
        let n: Norte;
        if (previo) {
          this.registrar();
          previo.p = this.ajustar(p);
          n = previo;
          this.notificar();
        } else {
          n = { id: nuevoId(), tipo: 'norte', p: this.ajustar(p), ang: 0, tam: 1 };
          this.agregar(n);
        }
        this.cambiarHerramienta('seleccionar');
        this.seleccion = new Set([n.id]);
        this.actualizarPanel();
        this.dibujar();
        return;
      }
      case 'texto': {
        const t: Texto = { id: nuevoId(), tipo: 'texto', p: this.ajustar(p), texto: 'Etiqueta', tam: 0.3, color: this.estilo.color, negrita: false, ang: 0 };
        this.agregar(t);
        this.cambiarHerramienta('seleccionar');
        this.seleccion = new Set([t.id]);
        this.actualizarPanel();
        this.dibujar();
        const campo = this.panel.querySelector<HTMLTextAreaElement>('textarea');
        campo?.focus();
        campo?.select();
        return;
      }
      case 'acceso':
      case 'cota':
      case 'linea': {
        const a = this.ajustar(p);
        const base = { id: nuevoId(), a, b: { ...a } };
        const el: ConDosPuntos =
          this.herr === 'acceso'
            ? { ...base, tipo: 'acceso', color: this.estilo.acceso, texto: 'ACCESO' }
            : this.herr === 'cota'
              ? { ...base, tipo: 'cota', color: '#111827' }
              : { ...base, tipo: 'linea', color: this.estilo.color, grosor: 0.03, discontinua: false };
        this.accion = { k: 'nuevo', el, inicio: a };
        return;
      }
      case 'lapiz':
        this.accion = { k: 'trazo', el: { id: nuevoId(), tipo: 'trazo', puntos: [p], color: this.estilo.color, grosor: 0.03 } };
        return;
    }
  }

  private alMover(e: PointerEvent) {
    const s = this.enPantalla(e);
    if (this.punteros.has(e.pointerId)) this.punteros.set(e.pointerId, s);
    if (this.pellizco && this.punteros.size === 2) {
      const [a, b] = [...this.punteros.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const pz = this.pellizco;
      const escala = clamp((pz.escala * d) / (pz.d || 1), MIN_ESCALA, MAX_ESCALA);
      const k = escala / pz.escala;
      this.vista = { escala, ox: c.x - (pz.c.x - pz.ox) * k, oy: c.y - (pz.c.y - pz.oy) * k };
      this.actualizarEstado();
      this.dibujar();
      return;
    }
    if (this.isometrico) {
      const a = this.accion;
      if (a?.k === 'girarIso') {
        if (Math.abs(s.x - a.sx) > 2) a.movido = true;
        // Media pantalla de arrastre (o 240 px) = un cuarto de vuelta
        const paso = Math.max(240, this.canvas.getBoundingClientRect().width / 4);
        this.ponerGiroVivo(a.g0 + (s.x - a.sx) / paso, a);
        return;
      }
      if (a?.k === 'pan') {
        this.vista.ox = a.ox + s.x - a.sx;
        this.vista.oy = a.oy + s.y - a.sy;
        this.dibujar();
      }
      return;
    }
    const p = this.aMundo(s.x, s.y);
    this.shift = e.shiftKey;
    this.cursor = p;
    const a = this.accion;
    if (!a && this.herr === 'seleccionar') this.canvas.style.cursor = this.cursorManija(p);
    if (a) {
      switch (a.k) {
        case 'pan':
          this.vista.ox = a.ox + s.x - a.sx;
          this.vista.oy = a.oy + s.y - a.sy;
          break;
        case 'mover': {
          let dx = p.x - a.ultimo.x;
          let dy = p.y - a.ultimo.y;
          if (!a.movido && Math.hypot(dx, dy) < this.tol(3)) break;
          a.movido = true;
          const sel = this.seleccionados();
          if (sel.length === 1 && (sel[0].tipo === 'puerta' || sel[0].tipo === 'ventana')) {
            const ab = sel[0];
            const m = this.colocarEnMuro(p, ab.ancho);
            if (m) {
              ab.p = m.p;
              ab.ang = m.ang;
              ab.grosor = m.grosor;
            } else ab.p = { x: p.x, y: p.y };
            a.ultimo = p;
            break;
          }
          if (this.iman) {
            // Mueve en pasos de rejilla para conservar alineaciones
            dx = Math.round(dx / PASO_REJILLA) * PASO_REJILLA;
            dy = Math.round(dy / PASO_REJILLA) * PASO_REJILLA;
          }
          if (dx || dy) {
            this.moverSeleccion(dx, dy);
            this.sincronizarCuartos();
            a.ultimo = { x: a.ultimo.x + dx, y: a.ultimo.y + dy };
          }
          break;
        }
        case 'manija':
          this.arrastrarManija(a, p);
          this.sincronizarCuartos();
          break;
        case 'marco':
          a.b = p;
          break;
        case 'nuevo':
          a.el.b = this.ajustar(p, a.inicio);
          break;
        case 'cuarto':
        case 'areaRect':
          a.b = this.ajustar(p);
          break;
        case 'trazo': {
          const ult = a.el.puntos[a.el.puntos.length - 1];
          if (dist(ult, p) > this.tol(1.5)) a.el.puntos.push(p);
          break;
        }
      }
    }
    this.actualizarEstado();
    this.dibujar();
  }

  private arrastrarManija(a: Extract<Accion, { k: 'manija' }>, p: Pt) {
    const el = this.datos.elementos.find((x) => x.id === a.id);
    if (!el) return;
    const excluir = new Set([el.id, ...a.vinculados.map((v) => v.el.id)]);
    if (el.tipo === 'muro' && el.chaflan && a.cual === 'medio') {
      // La diagonal se desplaza en paralelo: la distancia sale de proyectar el cursor sobre la bisectriz
      const w = this.bisectrizChaflan(el);
      if (!w) return;
      const q = el.chaflan.q;
      let d = ((p.x - q.x) * w.x + (p.y - q.y) * w.y) / (w.x * w.x + w.y * w.y);
      if (this.iman) d = Math.round(d / PASO_REJILLA) * PASO_REJILLA;
      this.aplicarChaflan(el, d);
    } else if (el.tipo === 'muro' && el.chaflan && (a.cual === 'a' || a.cual === 'b')) {
      const v = this.vecinoChaflan(el, a.cual);
      if (!v) return;
      const q = el.chaflan.q;
      const l = dist(q, v.lejos) || 1;
      let d = ((p.x - q.x) * (v.lejos.x - q.x) + (p.y - q.y) * (v.lejos.y - q.y)) / l;
      if (this.iman) d = Math.round(d / PASO_REJILLA) * PASO_REJILLA;
      this.aplicarChaflan(el, d);
    } else if (tieneDosPuntos(el) && (a.cual === 'a' || a.cual === 'b')) {
      const otro = a.cual === 'a' ? el.b : el.a;
      const q = this.ajustar(p, otro, excluir);
      el[a.cual] = q;
      for (const v of a.vinculados) v.el[v.extremo] = { ...q };
    } else if (el.tipo === 'area' && a.cual === 'etq') {
      el.etqPos = this.iman ? { x: redondear(p.x), y: redondear(p.y) } : { ...p };
    } else if (el.tipo === 'area' && typeof a.cual === 'number' && el.muros?.length) {
      const q = this.ajustar(p, null, excluir);
      for (const v of a.vinculados) v.el[v.extremo] = { ...q };
    } else if (el.tipo === 'area' && typeof a.cual === 'number') {
      el.puntos[a.cual] = this.ajustar(p, null, excluir);
    } else if (el.tipo === 'norte' && a.cual === 'rot') {
      let ang = Math.atan2(p.y - el.p.y, p.x - el.p.x) + Math.PI / 2;
      if (!this.shift) ang = Math.round(ang / (Math.PI / 36)) * (Math.PI / 36);
      el.ang = normalizarAng(ang);
    } else if (el.tipo === 'mueble') {
      if (a.cual === 'rot') {
        let ang = Math.atan2(p.y - el.p.y, p.x - el.p.x) + Math.PI / 2;
        if (!this.shift) ang = Math.round(ang / (Math.PI / 12)) * (Math.PI / 12);
        el.ang = normalizarAng(ang);
      } else if (a.cual === 'haz') {
        const l = puntoLocal(el, p).y - el.alto / 2;
        const v = this.shift ? l : Math.round(l / 0.05) * 0.05;
        el.hazDistancia = Math.round(Math.min(8, Math.max(0.2, v)) * 100) / 100;
      } else if (a.cual === 'tam') {
        const l = puntoLocal(el, p);
        const r = (v: number) => (this.iman ? Math.max(PASO_REJILLA, Math.round(v / PASO_REJILLA) * PASO_REJILLA) : Math.max(0.05, v));
        el.ancho = r(Math.abs(l.x) * 2);
        el.alto = r(Math.abs(l.y) * 2);
      }
    }
  }

  private alSoltar(e: PointerEvent) {
    this.punteros.delete(e.pointerId);
    if (this.pellizco) {
      if (this.punteros.size < 2) this.pellizco = null;
      return;
    }
    const a = this.accion;
    this.accion = null;
    if (!a) return;
    switch (a.k) {
      case 'pan':
        this.canvas.style.cursor = this.isometrico ? 'grab' : this.cursorHerramienta();
        break;
      case 'girarIso':
        this.canvas.style.cursor = 'grab';
        if (a.movido) this.asentarGiroIso(a);
        else this.giroVivo = null;
        break;
      case 'mover':
        if (a.movido) {
          this.registrar(a.previo);
          this.notificar();
          this.actualizarPanel();
        }
        break;
      case 'manija':
        this.registrar(a.previo);
        this.notificar();
        this.actualizarPanel();
        break;
      case 'marco': {
        const x0 = Math.min(a.a.x, a.b.x);
        const x1 = Math.max(a.a.x, a.b.x);
        const y0 = Math.min(a.a.y, a.b.y);
        const y1 = Math.max(a.a.y, a.b.y);
        if (x1 - x0 > this.tol(3) || y1 - y0 > this.tol(3)) {
          for (const el of this.datos.elementos) {
            const c = cajaDe(el);
            if (c.minx >= x0 && c.maxx <= x1 && c.miny >= y0 && c.maxy <= y1) this.seleccion.add(el.id);
          }
        }
        this.actualizarPanel();
        break;
      }
      case 'nuevo':
        if (dist(a.el.a, a.el.b) > this.tol(5)) this.agregar(a.el);
        break;
      case 'cuarto':
        if (dist(a.a, a.b) > this.tol(5) && Math.abs(a.a.x - a.b.x) > 0.01 && Math.abs(a.a.y - a.b.y) > 0.01) this.crearCuarto(rectangulo(a.a, a.b));
        break;
      case 'trazo':
        this.agregar(a.el);
        break;
      case 'areaRect':
        if (dist(a.a, a.b) > this.tol(6) && Math.abs(a.a.x - a.b.x) > 0.01 && Math.abs(a.a.y - a.b.y) > 0.01) {
          const ar = this.nuevaArea(rectangulo(a.a, a.b));
          this.agregar(ar);
          this.cambiarHerramienta('seleccionar');
          this.seleccion = new Set([ar.id]);
          this.actualizarPanel();
        } else {
          this.poli = { tipo: 'area', puntos: [a.a] };
        }
        break;
    }
    this.dibujar();
  }

  // ───────────────────────── Teclado ─────────────────────────

  private escucharTeclas() {
    const abajo = (e: KeyboardEvent) => {
      if (!this.raiz.isConnected) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      this.shift = e.shiftKey;
      const ctrl = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (ctrl && k === 'z') {
        e.preventDefault();
        if (e.shiftKey) this.rehacer();
        else this.deshacer();
        return;
      }
      if (ctrl && k === 'y') {
        e.preventDefault();
        this.rehacer();
        return;
      }
      if (this.isometrico) {
        // La vista isométrica no se edita: solo zoom y Esc para volver al plano
        if (ctrl) return;
        if (k === '+' || k === '=') return this.zoom(1.25);
        if (k === '-') return this.zoom(1 / 1.25);
        if (e.key === 'Escape') {
          e.preventDefault();
          this.cambiarVista('plano');
        }
        return;
      }
      if (ctrl && k === 'd') {
        e.preventDefault();
        this.duplicar();
        return;
      }
      if (ctrl && k === 'a') {
        e.preventDefault();
        this.cambiarHerramienta('seleccionar');
        this.seleccion = new Set(this.datos.elementos.map((x) => x.id));
        this.actualizarPanel();
        this.dibujar();
        return;
      }
      if (ctrl) return;
      if (e.key === ' ') {
        this.espacio = true;
        e.preventDefault();
        return;
      }
      // Medida tecleada mientras se dibuja un muro
      if (this.poli?.tipo === 'muro' && /^[0-9.,]$/.test(e.key)) {
        this.medida += e.key;
        this.actualizarEstado();
        e.preventDefault();
        return;
      }
      if (this.medida && e.key === 'Backspace') {
        this.medida = this.medida.slice(0, -1);
        this.actualizarEstado();
        e.preventDefault();
        return;
      }
      if (e.key === 'Enter') {
        if (this.medida) this.aplicarMedida();
        else this.terminarPoli();
        e.preventDefault();
        return;
      }
      if (e.key === 'Escape') {
        if (this.poli || this.accion) {
          this.accion = null;
          this.terminarPoli();
        } else if (this.seleccion.size) {
          this.seleccion.clear();
          this.actualizarPanel();
          this.dibujar();
        } else if (this.herr !== 'seleccionar') this.cambiarHerramienta('seleccionar');
        e.preventDefault();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.seleccion.size) {
        e.preventDefault();
        this.eliminarSeleccion();
        return;
      }
      if (e.key.startsWith('Arrow') && this.seleccion.size) {
        e.preventDefault();
        const paso = e.shiftKey ? 0.5 : PASO_REJILLA;
        const dx = e.key === 'ArrowLeft' ? -paso : e.key === 'ArrowRight' ? paso : 0;
        const dy = e.key === 'ArrowUp' ? -paso : e.key === 'ArrowDown' ? paso : 0;
        this.registrar();
        this.moverSeleccion(dx, dy);
        this.notificar();
        return;
      }
      if (k === 'r') {
        if (this.seleccion.size) this.girarSeleccion(Math.PI / 2);
        else {
          this.fantasmaAng = normalizarAng(this.fantasmaAng + Math.PI / 2);
          this.dibujar();
        }
        return;
      }
      if (k === 'f' && (this.herr === 'puerta' || this.herr === 'puerta2' || this.herr === 'ventana')) {
        this.aberturaInvertir = !this.aberturaInvertir;
        this.dibujar();
        return;
      }
      if (k === '+' || k === '=') return this.zoom(1.25);
      if (k === '-') return this.zoom(1 / 1.25);
      const herr = HERRAMIENTAS.find((x) => x.tecla.toLowerCase() === k);
      if (herr) this.cambiarHerramienta(herr.h);
    };
    const arriba = (e: KeyboardEvent) => {
      if (e.key === ' ') this.espacio = false;
      this.shift = e.shiftKey;
    };
    window.addEventListener('keydown', abajo);
    window.addEventListener('keyup', arriba);
    return () => {
      window.removeEventListener('keydown', abajo);
      window.removeEventListener('keyup', arriba);
    };
  }

  // ───────────────────────── Dibujo ─────────────────────────

  dibujar() {
    if (this.dibujoPedido) return;
    this.dibujoPedido = true;
    requestAnimationFrame(() => {
      this.dibujoPedido = false;
      this.dibujarAhora();
    });
  }

  private vistaPrevia(): Elemento[] {
    const extras: Elemento[] = [];
    const a = this.accion;
    if (a?.k === 'nuevo' || a?.k === 'trazo') extras.push(a.el);
    if (a?.k === 'cuarto') {
      const pts = rectangulo(a.a, a.b);
      extras.push(...pts.map((q, i) => this.nuevoMuro(q, pts[(i + 1) % 4])));
    }
    if (a?.k === 'areaRect' && dist(a.a, a.b) > 0) extras.push(this.nuevaArea(rectangulo(a.a, a.b)));
    if (this.poli && this.cursor) {
      const ult = this.poli.puntos[this.poli.puntos.length - 1];
      const c = this.ajustar(this.cursor, ult);
      if (this.poli.tipo === 'muro') {
        extras.push(this.nuevoMuro(ult, c));
      } else {
        extras.push(this.nuevaArea([...this.poli.puntos, c]));
      }
    }
    if (!a && !this.poli && this.cursor) {
      if (this.herr === 'mueble') extras.push(this.nuevoMueble(this.cursor));
      if (this.herr === 'norte') {
        const previo = this.datos.elementos.find((e): e is Norte => e.tipo === 'norte');
        extras.push({ id: '', tipo: 'norte', p: this.ajustar(this.cursor), ang: previo?.ang ?? 0, tam: previo?.tam ?? 1, punto: previo?.punto ?? 'N' });
      }
      if (this.herr === 'puerta' || this.herr === 'puerta2' || this.herr === 'ventana') extras.push(this.nuevaAbertura(this.herr, this.cursor));
    }
    return extras;
  }

  private dibujarAhora() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.isometrico) {
      dibujarIsometrico(ctx, this.datos, this.vista, { ancho: r.width, alto: r.height, giro: this.giroVivo ?? undefined });
      return;
    }
    dibujarEscena(ctx, this.datos, this.vista, {
      ancho: r.width,
      alto: r.height,
      cuadricula: this.cuadricula,
      seleccion: this.seleccion,
      extras: this.vistaPrevia(),
    });
    const v = this.vista;
    const aP = (p: Pt) => ({ x: p.x * v.escala + v.ox, y: p.y * v.escala + v.oy });

    // Polilínea en curso
    if (this.poli) {
      ctx.fillStyle = ACENTO_LIENZO;
      for (const q of this.poli.puntos) {
        const s = aP(q);
        ctx.fillRect(s.x - 3, s.y - 3, 6, 6);
      }
      if (this.cursor && this.poli.tipo === 'muro') {
        const ult = this.poli.puntos[this.poli.puntos.length - 1];
        const c = this.ajustar(this.cursor, ult);
        const s = aP(c);
        const txt = this.medida ? `${this.medida} m` : formatoM(dist(ult, c));
        etiquetaCursor(ctx, s, txt);
      }
    }
    // Medida mientras se arrastra una cota/línea/acceso o un cuarto
    const a = this.accion;
    if (this.cursor && (a?.k === 'nuevo' || a?.k === 'cuarto')) {
      const txt =
        a.k === 'nuevo'
          ? formatoM(dist(a.el.a, a.el.b))
          : `${Math.abs(a.b.x - a.a.x).toFixed(2)} × ${Math.abs(a.b.y - a.a.y).toFixed(2)} m`;
      etiquetaCursor(ctx, aP(this.cursor), txt);
    }
    // Distancia del corte mientras se arrastra
    if (a?.k === 'manija' && this.cursor) {
      const m = this.datos.elementos.find((e) => e.id === a.id);
      if (m?.tipo === 'muro' && m.chaflan) {
        etiquetaCursor(ctx, aP(this.cursor), `Corte: ${formatoM(this.distanciaChaflan(m))}`);
      }
    }
    // Marco de selección
    if (a?.k === 'marco') {
      const p0 = aP(a.a);
      const p1 = aP(a.b);
      ctx.fillStyle = 'rgba(31,95,191,0.08)';
      ctx.strokeStyle = ACENTO_LIENZO;
      ctx.lineWidth = 1;
      ctx.fillRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
      ctx.strokeRect(p0.x + 0.5, p0.y + 0.5, p1.x - p0.x, p1.y - p0.y);
    }
    // Manijas
    for (const m of this.manijas()) {
      const s = aP(m.p);
      if (m.cual === 'medio') {
        const el = this.seleccionados()[0];
        if (el?.tipo === 'muro') flechaDoble(ctx, s, Math.atan2(el.b.y - el.a.y, el.b.x - el.a.x) + Math.PI / 2);
        continue;
      }
      if (m.cual === 'haz') {
        const el = this.seleccionados()[0];
        if (el?.tipo === 'mueble') flechaDoble(ctx, s, el.ang + Math.PI / 2);
        continue;
      }
      ctx.beginPath();
      if (m.cual === 'rot') ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
      else ctx.rect(s.x - 5, s.y - 5, 10, 10);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = ACENTO_LIENZO;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    // Indicador de ajuste a esquina
    if (this.cursor && this.herr === 'chaflan') {
      const q = this.esquinaCerca(this.cursor);
      if (q) {
        const s = aP(q);
        ctx.strokeStyle = '#b8372e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 9, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (this.cursor && this.herr !== 'seleccionar' && this.herr !== 'mano' && this.herr !== 'lapiz' && this.herr !== 'mueble' && this.herr !== 'dividir') {
      const q = this.ajustar(this.cursor, this.poli?.puntos[this.poli.puntos.length - 1]);
      const s = aP(q);
      ctx.strokeStyle = ACENTO_LIENZO;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // ───────────────────────── Archivos y resultado ─────────────────────────

  imagen(): ImagenCroquis {
    return exportarPNG(this.datos, this.o.exportar);
  }

  private guardar() {
    this.terminarPoli();
    const img = this.imagen();
    this.o.alGuardar?.({ datos: JSON.parse(JSON.stringify(this.datos)), ...img });
  }

  private cancelar() {
    if (this.cambiado && !confirm('¿Cerrar sin guardar los cambios del croquis?')) return;
    this.o.alCancelar?.();
  }

  private descargar(tipo: 'json' | 'png') {
    const a = document.createElement('a');
    const fecha = new Date().toISOString().slice(0, 10);
    if (tipo === 'png') {
      a.href = this.imagen().png;
      a.download = this.isometrico ? `croquis-isometrico-${fecha}.png` : `croquis-${fecha}.png`;
    } else {
      a.href = URL.createObjectURL(new Blob([JSON.stringify(this.datos)], { type: 'application/json' }));
      a.download = `croquis-${fecha}.croquis.json`;
    }
    a.click();
  }

  private abrirArchivo() {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = '.json,application/json';
    i.addEventListener('change', async () => {
      const f = i.files?.[0];
      if (!f) return;
      try {
        const d = normalizarDatos(JSON.parse(await f.text()));
        this.registrar();
        this.datos.elementos = d.elementos;
        this.datos.opciones = d.opciones;
        this.seleccion.clear();
        this.actualizarPanel();
        this.notificar();
        this.encuadrar();
      } catch {
        alert('El archivo no es un croquis válido.');
      }
    });
    i.click();
  }
}

/** Rótulo azul junto al cursor (medidas mientras se dibuja). */
function etiquetaCursor(ctx: CanvasRenderingContext2D, s: { x: number; y: number }, txt: string) {
  ctx.font = 'bold 12px system-ui, sans-serif';
  const w = ctx.measureText(txt).width;
  ctx.fillStyle = 'rgba(37,99,235,0.92)';
  ctx.fillRect(s.x + 12, s.y + 10, w + 10, 20);
  ctx.fillStyle = '#fff';
  ctx.fillText(txt, s.x + 17, s.y + 24);
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function redondear(v: number) {
  return Math.round(v / PASO_REJILLA) * PASO_REJILLA;
}

function normalizarAng(a: number) {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a <= -Math.PI) a += 2 * Math.PI;
  return a;
}

/** Manija de flecha doble (en pantalla), orientada según ang: para desplazar un corte en paralelo. */
function flechaDoble(ctx: CanvasRenderingContext2D, c: Pt, ang: number) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(ang);
  const trazo = () => {
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.lineTo(11, 0);
    ctx.moveTo(-6, -5);
    ctx.lineTo(-11, 0);
    ctx.lineTo(-6, 5);
    ctx.moveTo(6, -5);
    ctx.lineTo(11, 0);
    ctx.lineTo(6, 5);
  };
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  trazo();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 6;
  ctx.stroke();
  trazo();
  ctx.strokeStyle = ACENTO_LIENZO;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}
