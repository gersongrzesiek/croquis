type Herramienta = 'lapiz' | 'linea' | 'rectangulo' | 'circulo' | 'texto' | 'borrador';
type Punto = { x: number; y: number };

type Forma =
  | { tipo: 'trazo'; puntos: Punto[]; color: string; grosor: number; borrar?: boolean }
  | { tipo: 'linea' | 'rectangulo' | 'circulo'; a: Punto; b: Punto; color: string; grosor: number }
  | { tipo: 'texto'; p: Punto; texto: string; color: string; tamano: number };

const lienzo = document.getElementById('lienzo') as HTMLCanvasElement;
const ctx = lienzo.getContext('2d')!;
const colorInput = document.getElementById('color') as HTMLInputElement;
const grosorInput = document.getElementById('grosor') as HTMLInputElement;
const cuadriculaInput = document.getElementById('cuadricula') as HTMLInputElement;

let herramienta: Herramienta = 'lapiz';
let formas: Forma[] = [];
let deshechas: Forma[] = [];
let actual: Forma | null = null;

const TAM_CUADRO = 20;

function ajustarTamano() {
  const dpr = window.devicePixelRatio || 1;
  const r = lienzo.getBoundingClientRect();
  lienzo.width = Math.round(r.width * dpr);
  lienzo.height = Math.round(r.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  dibujar();
}

function dibujarCuadricula(w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += TAM_CUADRO) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
  for (let y = 0; y <= h; y += TAM_CUADRO) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
  ctx.stroke();
  ctx.restore();
}

function dibujarForma(f: Forma) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (f.tipo === 'texto') {
    ctx.fillStyle = f.color;
    ctx.font = `${f.tamano}px system-ui, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(f.texto, f.p.x, f.p.y);
  } else if (f.tipo === 'trazo') {
    ctx.strokeStyle = f.borrar ? '#ffffff' : f.color;
    ctx.lineWidth = f.borrar ? f.grosor * 4 : f.grosor;
    ctx.beginPath();
    f.puntos.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    if (f.puntos.length === 1) ctx.lineTo(f.puntos[0].x + 0.01, f.puntos[0].y);
    ctx.stroke();
  } else {
    ctx.strokeStyle = f.color;
    ctx.lineWidth = f.grosor;
    ctx.beginPath();
    if (f.tipo === 'linea') {
      ctx.moveTo(f.a.x, f.a.y);
      ctx.lineTo(f.b.x, f.b.y);
    } else if (f.tipo === 'rectangulo') {
      ctx.rect(f.a.x, f.a.y, f.b.x - f.a.x, f.b.y - f.a.y);
    } else {
      const rx = Math.abs(f.b.x - f.a.x) / 2;
      const ry = Math.abs(f.b.y - f.a.y) / 2;
      ctx.ellipse((f.a.x + f.b.x) / 2, (f.a.y + f.b.y) / 2, rx, ry, 0, 0, Math.PI * 2);
    }
    ctx.stroke();
    if (f.tipo === 'linea') etiquetaLongitud(f.a, f.b, f.color);
  }
  ctx.restore();
}

/** Muestra la longitud de la línea en "cuadros" de la cuadrícula. */
function etiquetaLongitud(a: Punto, b: Punto, color: string) {
  const largo = Math.hypot(b.x - a.x, b.y - a.y) / TAM_CUADRO;
  if (largo < 1) return;
  ctx.fillStyle = color;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(`${largo.toFixed(1)} u`, (a.x + b.x) / 2 + 6, (a.y + b.y) / 2 - 6);
}

function dibujar() {
  const r = lienzo.getBoundingClientRect();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, r.width, r.height);
  if (cuadriculaInput.checked) dibujarCuadricula(r.width, r.height);
  formas.forEach(dibujarForma);
  if (actual) dibujarForma(actual);
}

function punto(e: PointerEvent): Punto {
  const r = lienzo.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

lienzo.addEventListener('pointerdown', (e) => {
  const p = punto(e);
  const color = colorInput.value;
  const grosor = Number(grosorInput.value);
  if (herramienta === 'texto') {
    const texto = prompt('Texto:');
    if (texto) agregar({ tipo: 'texto', p, texto, color, tamano: 12 + grosor * 2 });
    return;
  }
  lienzo.setPointerCapture(e.pointerId);
  if (herramienta === 'lapiz' || herramienta === 'borrador') {
    actual = { tipo: 'trazo', puntos: [p], color, grosor, borrar: herramienta === 'borrador' };
  } else {
    actual = { tipo: herramienta, a: p, b: p, color, grosor };
  }
  dibujar();
});

lienzo.addEventListener('pointermove', (e) => {
  if (!actual) return;
  const p = punto(e);
  if (actual.tipo === 'trazo') actual.puntos.push(p);
  else if (actual.tipo !== 'texto') actual.b = e.shiftKey ? ajustarAngulo(actual.a, p) : p;
  dibujar();
});

function terminar() {
  if (actual) agregar(actual);
  actual = null;
}
lienzo.addEventListener('pointerup', terminar);
lienzo.addEventListener('pointercancel', terminar);

/** Con Shift, fija la línea a múltiplos de 45°. */
function ajustarAngulo(a: Punto, b: Punto): Punto {
  const ang = Math.round(Math.atan2(b.y - a.y, b.x - a.x) / (Math.PI / 4)) * (Math.PI / 4);
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  return { x: a.x + Math.cos(ang) * d, y: a.y + Math.sin(ang) * d };
}

function agregar(f: Forma) {
  formas.push(f);
  deshechas = [];
  guardar();
  dibujar();
}

function deshacer() {
  const f = formas.pop();
  if (f) deshechas.push(f);
  guardar();
  dibujar();
}

function rehacer() {
  const f = deshechas.pop();
  if (f) formas.push(f);
  guardar();
  dibujar();
}

function seleccionar(h: Herramienta) {
  herramienta = h;
  document.querySelectorAll<HTMLButtonElement>('#tools button').forEach((b) =>
    b.classList.toggle('active', b.dataset.tool === h),
  );
}

document.querySelectorAll<HTMLButtonElement>('#tools button').forEach((b) =>
  b.addEventListener('click', () => seleccionar(b.dataset.tool as Herramienta)),
);
document.getElementById('deshacer')!.addEventListener('click', deshacer);
document.getElementById('rehacer')!.addEventListener('click', rehacer);
document.getElementById('limpiar')!.addEventListener('click', () => {
  if (formas.length && confirm('¿Borrar todo el croquis?')) {
    formas = [];
    deshechas = [];
    guardar();
    dibujar();
  }
});
document.getElementById('exportar')!.addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = `croquis-${new Date().toISOString().slice(0, 10)}.png`;
  a.href = lienzo.toDataURL('image/png');
  a.click();
});
cuadriculaInput.addEventListener('change', dibujar);

const ATAJOS: Record<string, Herramienta> = { p: 'lapiz', l: 'linea', r: 'rectangulo', c: 'circulo', t: 'texto', e: 'borrador' };
window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? rehacer() : deshacer(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); rehacer(); return; }
  const h = ATAJOS[e.key.toLowerCase()];
  if (h && !e.ctrlKey && !e.metaKey) seleccionar(h);
});

// Guardado automático en el navegador
const CLAVE = 'croquis:formas';
function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(formas)); } catch { /* sin almacenamiento */ }
}
try { formas = JSON.parse(localStorage.getItem(CLAVE) ?? '[]'); } catch { formas = []; }

window.addEventListener('resize', ajustarTamano);
ajustarTamano();
