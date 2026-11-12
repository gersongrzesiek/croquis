// Página independiente: editor a pantalla completa con autoguardado local.
import { montar, normalizarDatos } from './index';

const CLAVE = 'croquis:datos:v1';
let datos = null;
try {
  datos = normalizarDatos(JSON.parse(localStorage.getItem(CLAVE) ?? 'null'));
} catch {
  /* sin datos previos */
}

const tema = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
montar(document.getElementById('app')!, {
  datos,
  tema,
  modo: 'pagina',
  titulo: 'Croquis',
  alCambiar: (d) => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(d));
    } catch {
      /* almacenamiento no disponible */
    }
  },
});
