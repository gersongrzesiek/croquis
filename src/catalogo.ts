/** Mobiliario disponible. Medidas típicas en metros (ancho x fondo). */
export interface ItemCatalogo {
  clave: string;
  nombre: string;
  ancho: number;
  alto: number;
}

export const CATALOGO: ItemCatalogo[] = [
  { clave: 'mesa', nombre: 'Mesa', ancho: 1.2, alto: 0.8 },
  { clave: 'mesa-trabajo', nombre: 'Mesa de trabajo', ancho: 1.8, alto: 0.7 },
  { clave: 'silla', nombre: 'Silla', ancho: 0.45, alto: 0.45 },
  { clave: 'escritorio', nombre: 'Escritorio', ancho: 1.4, alto: 0.7 },
  { clave: 'anaquel', nombre: 'Anaquel', ancho: 1.2, alto: 0.45 },
  { clave: 'mostrador', nombre: 'Mostrador', ancho: 2.0, alto: 0.6 },
  { clave: 'refrigerador', nombre: 'Refrigerador', ancho: 0.8, alto: 0.75 },
  { clave: 'congelador', nombre: 'Congelador', ancho: 1.2, alto: 0.7 },
  { clave: 'estufa', nombre: 'Estufa', ancho: 0.76, alto: 0.65 },
  { clave: 'tarja', nombre: 'Tarja', ancho: 1.0, alto: 0.6 },
  { clave: 'lavabo', nombre: 'Lavabo', ancho: 0.5, alto: 0.45 },
  { clave: 'wc', nombre: 'WC', ancho: 0.4, alto: 0.7 },
  { clave: 'regadera', nombre: 'Regadera', ancho: 0.9, alto: 0.9 },
  { clave: 'tarima', nombre: 'Tarima', ancho: 1.2, alto: 1.0 },
  { clave: 'caja', nombre: 'Equipo / caja', ancho: 0.6, alto: 0.6 },
  { clave: 'extintor', nombre: 'Extintor', ancho: 0.35, alto: 0.35 },
  { clave: 'botiquin', nombre: 'Botiquín', ancho: 0.4, alto: 0.3 },
  { clave: 'bote', nombre: 'Bote de basura', ancho: 0.4, alto: 0.4 },
];

export const itemPorClave = (clave: string) => CATALOGO.find((i) => i.clave === clave);

/**
 * Dibuja el símbolo en coordenadas locales: caja centrada de w x h.
 * `lw` es el grosor de línea en las mismas unidades.
 */
export function dibujarSimbolo(ctx: CanvasRenderingContext2D, clave: string, w: number, h: number, color: string, lw: number) {
  const x0 = -w / 2;
  const y0 = -h / 2;
  const m = Math.min(w, h);
  ctx.strokeStyle = color;
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = lw;
  const caja = () => {
    ctx.beginPath();
    ctx.rect(x0, y0, w, h);
    ctx.fill();
    ctx.stroke();
  };
  const linea = (ax: number, ay: number, bx: number, by: number) => {
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  };
  const letra = (t: string) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Fuente en una escala segura (evita tamaños < 1px)
    const k = 100;
    ctx.scale(1 / k, 1 / k);
    ctx.font = `bold ${m * 0.45 * k}px Arial, sans-serif`;
    ctx.fillText(t, 0, 0);
    ctx.restore();
  };
  switch (clave) {
    case 'silla':
      caja();
      linea(x0, y0 + h * 0.2, x0 + w, y0 + h * 0.2);
      break;
    case 'escritorio':
      caja();
      ctx.strokeRect(x0 + w * 0.7, y0 + h * 0.1, w * 0.25, h * 0.8);
      break;
    case 'anaquel': {
      caja();
      const n = Math.max(2, Math.round(w / 0.3));
      for (let i = 1; i < n; i++) linea(x0 + (w * i) / n, y0, x0 + (w * i) / n, y0 + h);
      linea(x0, y0, x0 + w, y0 + h);
      break;
    }
    case 'mostrador':
      caja();
      linea(x0, y0 + h * 0.25, x0 + w, y0 + h * 0.25);
      break;
    case 'refrigerador':
      caja();
      letra('R');
      break;
    case 'congelador':
      caja();
      letra('C');
      break;
    case 'estufa': {
      caja();
      const r = Math.min(w, h) * 0.17;
      for (const [fx, fy] of [[0.28, 0.3], [0.72, 0.3], [0.28, 0.7], [0.72, 0.7]]) {
        ctx.beginPath();
        ctx.arc(x0 + w * fx, y0 + h * fy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case 'tarja':
      caja();
      ctx.beginPath();
      ctx.roundRect(x0 + w * 0.08, y0 + h * 0.15, w * 0.84, h * 0.7, m * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, y0 + h * 0.3, m * 0.05, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'lavabo':
      caja();
      ctx.beginPath();
      ctx.ellipse(0, h * 0.05, w * 0.36, h * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'wc':
      ctx.beginPath();
      ctx.rect(x0, y0, w, h * 0.28);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, y0 + h * 0.62, w * 0.45, h * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'regadera':
      caja();
      linea(x0, y0, x0 + w, y0 + h);
      linea(x0 + w, y0, x0, y0 + h);
      ctx.beginPath();
      ctx.arc(0, 0, m * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'tarima': {
      caja();
      const n = 5;
      for (let i = 1; i < n; i++) linea(x0, y0 + (h * i) / n, x0 + w, y0 + (h * i) / n);
      break;
    }
    case 'caja':
      caja();
      linea(x0, y0, x0 + w, y0 + h);
      linea(x0 + w, y0, x0, y0 + h);
      break;
    case 'extintor':
      ctx.beginPath();
      ctx.arc(0, 0, m / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.scale(0.01, 0.01);
      ctx.font = `bold ${m * 55}px Arial, sans-serif`;
      ctx.fillText('E', 0, 0);
      ctx.restore();
      break;
    case 'botiquin':
      caja();
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-m * 0.08, -h * 0.35, m * 0.16, h * 0.7);
      ctx.fillRect(-w * 0.3, -m * 0.08, w * 0.6, m * 0.16);
      break;
    case 'bote':
      ctx.beginPath();
      ctx.arc(0, 0, m / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, m * 0.32, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'mesa-trabajo':
      caja();
      ctx.strokeRect(x0 + w * 0.04, y0 + h * 0.08, w * 0.92, h * 0.84);
      break;
    case 'mesa':
    default:
      caja();
  }
}
