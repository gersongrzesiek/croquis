const svg = (cuerpo: string) =>
  `<svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${cuerpo}</svg>`;

export const ICONOS: Record<string, string> = {
  seleccionar: svg('<path d="M5 3l10 6.5-4.5 1L8.5 15z" fill="currentColor" stroke="none"/>'),
  mano: svg('<path d="M7 10V5.5a1 1 0 012 0V9M9 9V4a1 1 0 012 0v5M11 9V5a1 1 0 012 0v5M13 10V7.5a1 1 0 012 0V12c0 3-2 5-5 5-2 0-3.2-.8-4.2-2.4L4 11.5a1 1 0 011.6-1.2L7 12"/>'),
  muro: svg('<path d="M3 7h14v5H3z" fill="currentColor"/>'),
  cuarto: svg('<rect x="3.5" y="3.5" width="13" height="13" stroke-width="3"/>'),
  puerta: svg('<path d="M3 17h3M15 17h2M5 17V5M5 5a12 12 0 0112 12" /><path d="M5 5a12 12 0 0112 12" stroke-dasharray="2 2"/>'),
  ventana: svg('<rect x="2.5" y="7" width="15" height="6"/><path d="M2.5 10h15"/>'),
  area: svg('<path d="M3 5l10-2 4 9-8 5-6-4z" fill="currentColor" fill-opacity=".25"/>'),
  mueble: svg('<rect x="4" y="6.5" width="12" height="7"/><path d="M7 4h6M7 16h6"/>'),
  texto: svg('<path d="M4 5h12M10 5v11M7.5 16h5"/>'),
  acceso: svg('<path d="M3 10h11"/><path d="M11 5.5l5 4.5-5 4.5z" fill="currentColor"/>'),
  cota: svg('<path d="M3 12h14M3 9v6M17 9v6M4.5 13.5l-3-3M18.5 13.5l-3-3"/>'),
  linea: svg('<path d="M4 16L16 4"/>'),
  lapiz: svg('<path d="M4 16l1-4 8.5-8.5 3 3L8 15z"/>'),
  deshacer: svg('<path d="M7 5L3 9l4 4"/><path d="M3 9h9a5 5 0 010 10H9"/>'),
  rehacer: svg('<path d="M13 5l4 4-4 4"/><path d="M17 9H8a5 5 0 000 10h3"/>'),
};
