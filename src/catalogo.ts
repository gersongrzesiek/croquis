/** Mobiliario disponible. Medidas típicas en metros (ancho x fondo). */
export interface ItemCatalogo {
  clave: string;
  nombre: string;
  ancho: number;
  alto: number;
}

export interface Categoria {
  id: string;
  nombre: string;
  /** Norma en la que se basa la selección de mobiliario. */
  norma?: string;
  claves: string[];
}

const it = (clave: string, nombre: string, ancho: number, alto: number): ItemCatalogo => ({ clave, nombre, ancho, alto });

export const CATALOGO: ItemCatalogo[] = [
  // General
  it('mesa', 'Mesa', 1.2, 0.8),
  it('mesa-trabajo', 'Mesa de trabajo', 1.8, 0.7),
  it('silla', 'Silla', 0.45, 0.45),
  it('escritorio', 'Escritorio', 1.4, 0.7),
  it('anaquel', 'Anaquel', 1.2, 0.45),
  it('mostrador', 'Mostrador', 2.0, 0.6),
  it('refrigerador', 'Refrigerador', 0.8, 0.75),
  it('congelador', 'Congelador', 1.2, 0.7),
  it('estufa', 'Estufa', 0.76, 0.65),
  it('tarja', 'Tarja', 1.0, 0.6),
  it('lavabo', 'Lavabo', 0.5, 0.45),
  it('wc', 'WC', 0.4, 0.7),
  it('regadera', 'Regadera', 0.9, 0.9),
  it('tarima', 'Tarima', 1.2, 1.0),
  it('caja', 'Equipo / caja', 0.6, 0.6),
  it('extintor', 'Extintor', 0.35, 0.35),
  it('botiquin', 'Botiquín', 0.4, 0.3),
  it('bote', 'Bote de basura', 0.4, 0.4),
  // Hospitalario (NOM-016-SSA3-2012)
  it('cama-hosp', 'Cama hospitalaria', 1.0, 2.1),
  it('camilla', 'Carro camilla', 0.7, 1.9),
  it('mesa-exploracion', 'Mesa de exploración', 0.7, 1.8),
  it('mesa-quirurgica', 'Mesa quirúrgica', 0.6, 2.0),
  it('transfer', 'Transfer / cambio de botas', 0.9, 0.4),
  it('lampara-quir', 'Lámpara quirúrgica', 0.9, 0.9),
  it('anestesia', 'Equipo de anestesia', 0.7, 0.6),
  it('mesa-mayo', 'Mesa Mayo', 0.6, 0.4),
  it('mesa-rinon', 'Mesa riñón', 1.2, 0.6),
  it('mesa-pasteur', 'Mesa Pasteur', 0.9, 0.5),
  it('carro-rojo', 'Carro rojo', 0.7, 0.5),
  it('carro-curacion', 'Carro de curación', 0.7, 0.45),
  it('portasueros', 'Portavenoclisis', 0.5, 0.5),
  it('lavabo-cirujano', 'Lavabo de cirujanos', 1.5, 0.6),
  it('asiento-giratorio', 'Asiento giratorio', 0.45, 0.45),
  it('banqueta', 'Banqueta de altura', 0.5, 0.35),
  it('bote-rpbi', 'Bote RPBI', 0.4, 0.4),
  it('negatoscopio', 'Negatoscopio', 0.8, 0.15),
  // Rayos X (NOM-229-SSA1-2002 y apéndice C de NOM-016-SSA3-2012)
  it('mesa-rx', 'Mesa con bucky', 0.8, 2.2),
  it('tubo-rx', 'Soporte de tubo de RX', 0.6, 0.6),
  it('arco-c', 'Arco en C', 0.8, 2.0),
  it('bucky-vertical', 'Bucky vertical', 0.7, 0.35),
  it('consola', 'Consola de control', 1.0, 0.5),
  it('mampara', 'Mampara plomada', 1.0, 0.15),
  it('mandiles', 'Perchero de mandiles', 0.7, 0.2),
  it('mastografo', 'Mastógrafo', 0.8, 0.8),
  it('panoramico', 'Panorámico dental', 1.0, 1.0),
  it('revelador', 'Revelador / procesadora', 0.8, 0.6),
  it('mesa-chasis', 'Mesa de carga de chasis', 1.2, 0.6),
  it('lampara-seg', 'Lámpara de seguridad', 0.3, 0.3),
  it('luz-roja', 'Indicador de luz roja', 0.3, 0.3),
  it('senal-rad', 'Señal de radiación', 0.5, 0.5),
  it('vestidor', 'Vestidor', 1.0, 1.0),
  // Control de plagas (NOM-232-SSA1-2009, NOM-251-SSA1-2009 5.10.10)
  it('anaquel-plag', 'Anaquel de plaguicidas', 1.2, 0.45),
  it('gabinete-llave', 'Gabinete con llave', 0.9, 0.45),
  it('mesa-mezclas', 'Mesa de preparación de mezclas', 1.2, 0.6),
  it('tarja-lavado', 'Tarja de triple lavado', 1.4, 0.6),
  it('regadera-emerg', 'Regadera de emergencia', 0.9, 0.9),
  it('lavaojos', 'Lavaojos', 0.4, 0.4),
  it('casillero-epp', 'Casillero de EPP', 0.9, 0.45),
  it('aspersora', 'Equipo de aspersión', 0.5, 0.5),
  it('envases-vacios', 'Contenedor de envases vacíos', 0.7, 0.7),
  it('kit-derrames', 'Kit para derrames', 0.5, 0.4),
  it('senal-peligro', 'Señal de peligro (tóxico)', 0.5, 0.5),
  it('extractor', 'Extractor / ventilación', 0.45, 0.45),
  // Alimentos (NOM-251-SSA1-2009)
  it('mesa-inox', 'Mesa de acero inoxidable', 1.5, 0.7),
  it('tarja-doble', 'Tarja de 2 tinas', 1.4, 0.6),
  it('lavamanos', 'Lavamanos exclusivo', 0.5, 0.45),
  it('estufa-ind', 'Estufa industrial', 1.2, 0.8),
  it('horno', 'Horno', 0.9, 0.8),
  it('freidora', 'Freidora', 0.45, 0.7),
  it('campana', 'Campana extractora', 1.5, 0.9),
  it('camara-fria', 'Cámara fría', 2.0, 2.0),
  it('bascula', 'Báscula', 0.5, 0.5),
  it('bote-pedal', 'Bote con tapa y pedal', 0.45, 0.45),
  it('trampa-grasa', 'Trampa de grasa', 0.6, 0.4),
  it('coladera', 'Coladera', 0.25, 0.25),
];

export const CATEGORIAS: Categoria[] = [
  {
    id: 'general',
    nombre: 'General',
    claves: ['mesa', 'mesa-trabajo', 'silla', 'escritorio', 'anaquel', 'mostrador', 'refrigerador', 'congelador', 'estufa', 'tarja', 'lavabo', 'wc', 'regadera', 'tarima', 'caja', 'extintor', 'botiquin', 'bote'],
  },
  {
    id: 'hospitalario',
    nombre: 'Hospitalario',
    norma: 'NOM-016-SSA3-2012',
    claves: ['cama-hosp', 'camilla', 'mesa-exploracion', 'mesa-quirurgica', 'transfer', 'lampara-quir', 'anestesia', 'mesa-mayo', 'mesa-rinon', 'mesa-pasteur', 'carro-rojo', 'carro-curacion', 'portasueros', 'lavabo-cirujano', 'lavabo', 'asiento-giratorio', 'banqueta', 'negatoscopio', 'bote-rpbi', 'bote'],
  },
  {
    id: 'plagas',
    nombre: 'Control de plagas',
    norma: 'NOM-232-SSA1-2009',
    claves: ['anaquel-plag', 'gabinete-llave', 'tarima', 'mesa-mezclas', 'tarja-lavado', 'regadera-emerg', 'lavaojos', 'casillero-epp', 'aspersora', 'envases-vacios', 'kit-derrames', 'senal-peligro', 'extractor', 'extintor', 'botiquin', 'escritorio'],
  },
  {
    id: 'rayosx',
    nombre: 'Rayos X',
    norma: 'NOM-229-SSA1-2002',
    claves: ['mesa-rx', 'tubo-rx', 'arco-c', 'bucky-vertical', 'consola', 'mampara', 'mandiles', 'mastografo', 'panoramico', 'revelador', 'mesa-chasis', 'lampara-seg', 'luz-roja', 'senal-rad', 'vestidor', 'negatoscopio', 'banqueta', 'portasueros', 'bote-rpbi'],
  },
  {
    id: 'alimentos',
    nombre: 'Alimentos',
    norma: 'NOM-251-SSA1-2009',
    claves: ['mesa-inox', 'tarja-doble', 'lavamanos', 'estufa-ind', 'horno', 'freidora', 'campana', 'refrigerador', 'congelador', 'camara-fria', 'anaquel', 'tarima', 'bascula', 'bote-pedal', 'trampa-grasa', 'coladera'],
  },
];

export const itemPorClave = (clave: string) => CATALOGO.find((i) => i.clave === clave);

export const itemsDeCategoria = (id: string) =>
  (CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[0]).claves.map((k) => itemPorClave(k)!).filter(Boolean);

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
  const X = (f: number) => x0 + w * f;
  const Y = (f: number) => y0 + h * f;
  const caja = (relleno = '#ffffff') => {
    ctx.beginPath();
    ctx.rect(x0, y0, w, h);
    ctx.fillStyle = relleno;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
  };
  const rect = (fx: number, fy: number, fw: number, fh: number, relleno?: string) => {
    ctx.beginPath();
    ctx.rect(X(fx), Y(fy), w * fw, h * fh);
    if (relleno) {
      ctx.fillStyle = relleno;
      ctx.fill();
      ctx.fillStyle = '#ffffff';
    }
    ctx.stroke();
  };
  const redondo = (fx: number, fy: number, fw: number, fh: number, r: number) => {
    ctx.beginPath();
    ctx.roundRect(X(fx), Y(fy), w * fw, h * fh, m * r);
    ctx.stroke();
  };
  const linea = (ax: number, ay: number, bx: number, by: number) => {
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  };
  const lf = (ax: number, ay: number, bx: number, by: number) => linea(X(ax), Y(ay), X(bx), Y(by));
  const circ = (cx: number, cy: number, r: number, relleno?: string) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (relleno) {
      ctx.fillStyle = relleno;
      ctx.fill();
      ctx.fillStyle = '#ffffff';
    }
    ctx.stroke();
  };
  const letra = (t: string, col = color, cx = 0, cy = 0, escala = 1) => {
    ctx.save();
    ctx.fillStyle = col;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tam = Math.min(m * 0.45, (w * 0.85) / (t.length * 0.62)) * escala;
    // Fuente en una escala segura (evita tamaños < 1px)
    const k = 100;
    ctx.translate(cx, cy);
    ctx.scale(1 / k, 1 / k);
    ctx.font = `bold ${tam * k}px Arial, sans-serif`;
    ctx.fillText(t, 0, 0);
    ctx.restore();
  };
  const hornillas = (cols: number, filas: number) => {
    const r = Math.min(w / cols, h / filas) * 0.3;
    for (let i = 0; i < cols; i++) for (let j = 0; j < filas; j++) circ(X((i + 0.5) / cols), Y((j + 0.5) / filas), r);
  };
  const tinas = (n: number) => {
    const g = 0.06;
    const tw = (1 - g * (n + 1)) / n;
    for (let i = 0; i < n; i++) redondo(g + i * (tw + g), 0.15, tw, 0.7, 0.08);
  };
  const entrepanos = () => {
    const n = Math.max(2, Math.round(w / 0.3));
    for (let i = 1; i < n; i++) lf(i / n, 0, i / n, 1);
    lf(0, 0, 1, 1);
  };
  const rombo = (relleno: string, borde = color) => {
    ctx.beginPath();
    ctx.moveTo(0, -m / 2);
    ctx.lineTo(m / 2, 0);
    ctx.lineTo(0, m / 2);
    ctx.lineTo(-m / 2, 0);
    ctx.closePath();
    ctx.fillStyle = relleno;
    ctx.fill();
    ctx.strokeStyle = borde;
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.fillStyle = '#ffffff';
  };

  switch (clave) {
    // ───── General ─────
    case 'silla':
      caja();
      lf(0, 0.2, 1, 0.2);
      break;
    case 'escritorio':
      caja();
      rect(0.7, 0.1, 0.25, 0.8);
      break;
    case 'anaquel':
      caja();
      entrepanos();
      break;
    case 'mostrador':
      caja();
      lf(0, 0.25, 1, 0.25);
      break;
    case 'refrigerador':
      caja();
      letra('R');
      break;
    case 'congelador':
      caja();
      letra('C');
      break;
    case 'estufa':
      caja();
      hornillas(2, 2);
      break;
    case 'tarja':
      caja();
      tinas(1);
      circ(0, Y(0.3), m * 0.05);
      break;
    case 'lavabo':
    case 'lavamanos':
      caja();
      ctx.beginPath();
      ctx.ellipse(0, h * 0.05, w * 0.36, h * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (clave === 'lavamanos') letra('LM', color, 0, h * 0.05, 0.6);
      break;
    case 'wc':
      rect(0, 0, 1, 0.28, '#ffffff');
      ctx.beginPath();
      ctx.ellipse(0, Y(0.62), w * 0.45, h * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'regadera':
      caja();
      lf(0, 0, 1, 1);
      lf(1, 0, 0, 1);
      circ(0, 0, m * 0.08, '#ffffff');
      break;
    case 'tarima': {
      caja();
      for (let i = 1; i < 5; i++) lf(0, i / 5, 1, i / 5);
      break;
    }
    case 'caja':
      caja();
      lf(0, 0, 1, 1);
      lf(1, 0, 0, 1);
      break;
    case 'extintor':
      circ(0, 0, m / 2, '#ef4444');
      letra('E', '#ffffff', 0, 0, 1.2);
      break;
    case 'botiquin':
      caja();
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-m * 0.08, -h * 0.35, m * 0.16, h * 0.7);
      ctx.fillRect(-w * 0.3, -m * 0.08, w * 0.6, m * 0.16);
      break;
    case 'bote':
      circ(0, 0, m / 2, '#ffffff');
      circ(0, 0, m * 0.32);
      break;
    case 'mesa-trabajo':
      caja();
      rect(0.04, 0.08, 0.92, 0.84);
      break;

    // ───── Hospitalario ─────
    case 'cama-hosp':
      caja();
      redondo(0.12, 0.03, 0.76, 0.14, 0.1); // almohada
      lf(0.05, 0.22, 0.05, 0.7); // barandales
      lf(0.95, 0.22, 0.95, 0.7);
      lf(0, 0.94, 1, 0.94); // piecera
      lf(0, 0.2, 1, 0.2);
      break;
    case 'camilla':
      ctx.beginPath();
      ctx.roundRect(x0, y0, w, h, m * 0.15);
      ctx.fill();
      ctx.stroke();
      redondo(0.15, 0.04, 0.7, 0.1, 0.1);
      for (const [fx, fy] of [[0.12, 0.06], [0.88, 0.06], [0.12, 0.94], [0.88, 0.94]]) circ(X(fx), Y(fy), m * 0.06, '#ffffff');
      break;
    case 'mesa-exploracion':
      caja();
      lf(0, 0.3, 1, 0.3);
      ctx.beginPath();
      ctx.arc(X(0.25), Y(1), m * 0.12, 0, Math.PI);
      ctx.arc(X(0.75), Y(1), m * 0.12, 0, Math.PI);
      ctx.stroke();
      break;
    case 'transfer': {
      // Barrera de acero de lado a lado del acceso, con una persona sentada encima cambiándose las botas
      caja('#d1d5db');
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, y0, w, h);
      ctx.clip();
      ctx.lineWidth = lw * 0.5;
      for (let t = -h; t < w; t += m * 0.35) linea(x0 + t, y0 + h, x0 + t + h, y0);
      ctx.restore();
      ctx.lineWidth = lw;
      // Botas (azules) a cada lado de la barrera: un pie en el piso y el otro pasando al lado limpio
      for (const [bx, by] of [[0.02, -h / 2 - m * 0.12], [m * 0.3, h / 2 - m * 0.08]]) {
        ctx.beginPath();
        ctx.roundRect(bx, by, m * 0.45, m * 0.2, m * 0.08);
        ctx.fillStyle = '#93c5fd';
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(0, 0, m * 0.2, m * 0.48, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#374151';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      circ(m * 0.05, 0, m * 0.16, '#ffffff');
      break;
    }
    case 'mesa-quirurgica':
      caja();
      lf(0, 0.18, 1, 0.18);
      lf(0, 0.45, 1, 0.45);
      lf(0, 0.72, 1, 0.72);
      circ(0, Y(0.58), m * 0.18);
      break;
    case 'lampara-quir':
      circ(X(0.35), Y(0.4), m * 0.3, '#ffffff');
      circ(X(0.65), Y(0.62), m * 0.3, '#ffffff');
      circ(X(0.35), Y(0.4), m * 0.1);
      circ(X(0.65), Y(0.62), m * 0.1);
      break;
    case 'anestesia':
      caja();
      circ(X(0.28), 0, m * 0.2);
      letra('AN', color, X(0.68), 0, 0.8);
      break;
    case 'mesa-mayo':
      rect(0, 0, 1, 0.55, '#ffffff');
      lf(0.85, 0.55, 0.85, 1);
      lf(0.6, 1, 1, 1);
      break;
    case 'mesa-rinon':
      ctx.beginPath();
      ctx.moveTo(x0 + m * 0.3, y0);
      ctx.lineTo(x0 + w - m * 0.3, y0);
      ctx.arc(x0 + w - m * 0.5, 0, m * 0.5, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(x0 + m * 0.5, y0 + h);
      ctx.arc(x0 + m * 0.5, 0, m * 0.5, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, y0 + h + w * 0.18, w * 0.3, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
      break;
    case 'mesa-pasteur':
      caja();
      rect(0.06, 0.12, 0.88, 0.76);
      letra('MP', color, 0, 0, 0.6);
      break;
    case 'carro-rojo':
      caja('#fecaca');
      letra('CR', '#b91c1c');
      break;
    case 'carro-curacion':
      caja();
      lf(0, 0.5, 1, 0.5);
      letra('CC', color, 0, 0, 0.7);
      break;
    case 'portasueros':
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        linea(0, 0, Math.cos(a) * m * 0.45, Math.sin(a) * m * 0.45);
        circ(Math.cos(a) * m * 0.45, Math.sin(a) * m * 0.45, m * 0.04, '#ffffff');
      }
      circ(0, 0, m * 0.08, color);
      break;
    case 'lavabo-cirujano':
      caja();
      tinas(2);
      circ(X(0.27), Y(0.3), m * 0.04);
      circ(X(0.73), Y(0.3), m * 0.04);
      break;
    case 'asiento-giratorio':
      circ(0, 0, m / 2, '#ffffff');
      circ(0, 0, m * 0.12);
      break;
    case 'banqueta':
      caja();
      lf(0.5, 0, 0.5, 1);
      break;
    case 'bote-rpbi':
      circ(0, 0, m / 2, '#fecaca');
      letra('RPBI', '#b91c1c', 0, 0, 0.9);
      break;
    case 'negatoscopio':
      caja('#e0f2fe');
      lf(1 / 3, 0, 1 / 3, 1);
      lf(2 / 3, 0, 2 / 3, 1);
      break;

    // ───── Rayos X ─────
    case 'mesa-rx':
      caja();
      rect(0.15, 0.35, 0.7, 0.3);
      letra('RX', color, 0, Y(0.18), 0.7);
      break;
    case 'tubo-rx':
      caja();
      circ(0, 0, m * 0.3);
      lf(0.5, 0.15, 0.5, 0.85);
      lf(0.15, 0.5, 0.85, 0.5);
      break;
    case 'bucky-vertical':
      caja();
      rect(0.15, 0.2, 0.7, 0.6);
      letra('BV', color, 0, 0, 0.7);
      break;
    case 'consola':
      caja('#f1f5f9');
      for (const fx of [0.15, 0.3, 0.45]) circ(X(fx), Y(0.35), m * 0.06);
      rect(0.6, 0.2, 0.3, 0.35);
      lf(0.1, 0.75, 0.9, 0.75);
      break;
    case 'mampara':
      caja('#9ca3af');
      rect(0.3, 0.15, 0.4, 0.7, '#e0f2fe');
      break;
    case 'mandiles':
      caja();
      for (const fx of [0.2, 0.4, 0.6, 0.8]) circ(X(fx), 0, m * 0.25);
      break;
    case 'arco-c':
      // Carro atrás (base, cuerpo) y el arco en C hacia el frente, con el tubo y el detector
      rect(0.02, 0.02, 0.96, 0.18, '#e5e7eb');
      rect(0.1, 0.04, 0.8, 0.32);
      rect(0.44, 0.36, 0.12, 0.3);
      rect(0.2, 0.65, 0.6, 0.25);
      circ(0, Y(0.775), m * 0.22);
      letra('C', color, 0, Y(0.2), 0.8);
      break;
    case 'mastografo':
      caja();
      ctx.beginPath();
      ctx.arc(0, Y(0.62), m * 0.32, Math.PI, 0);
      ctx.closePath();
      ctx.stroke();
      letra('M', color, 0, Y(0.3), 0.6);
      break;
    case 'panoramico':
      circ(0, 0, m * 0.45, '#ffffff');
      ctx.beginPath();
      ctx.arc(0, 0, m * 0.3, Math.PI * 0.15, Math.PI * 0.85, true);
      ctx.stroke();
      letra('P', color, 0, m * 0.12, 0.7);
      break;
    case 'revelador':
      caja();
      for (const fx of [0.25, 0.5, 0.75]) circ(X(fx), Y(0.35), m * 0.1);
      letra('RV', color, 0, Y(0.75), 0.6);
      break;
    case 'mesa-chasis':
      caja();
      rect(0.1, 0.15, 0.35, 0.7);
      rect(0.55, 0.15, 0.35, 0.7);
      break;
    case 'lampara-seg':
      circ(0, 0, m / 2, '#fdba74');
      circ(0, 0, m * 0.2, '#ef4444');
      break;
    case 'luz-roja':
      circ(0, 0, m * 0.3, '#ef4444');
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        linea(Math.cos(a) * m * 0.36, Math.sin(a) * m * 0.36, Math.cos(a) * m * 0.5, Math.sin(a) * m * 0.5);
      }
      break;
    case 'senal-rad': {
      circ(0, 0, m / 2, '#facc15');
      ctx.fillStyle = '#111827';
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(0, 0, m * 0.4, a - Math.PI / 6, a + Math.PI / 6);
        ctx.arc(0, 0, m * 0.12, a + Math.PI / 6, a - Math.PI / 6, true);
        ctx.closePath();
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, m * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      break;
    }
    case 'vestidor':
      caja();
      ctx.save();
      ctx.setLineDash([m * 0.06, m * 0.04]);
      lf(0, 0.8, 1, 0.8);
      ctx.restore();
      letra('V', color, 0, Y(0.4), 0.8);
      break;

    // ───── Control de plagas ─────
    case 'anaquel-plag':
      caja();
      entrepanos();
      ctx.save();
      ctx.translate(X(0.85), 0);
      ctx.scale(0.5, 0.5);
      rombo('#fecaca', '#b91c1c');
      ctx.restore();
      break;
    case 'gabinete-llave':
      caja();
      lf(0.5, 0, 0.5, 1);
      circ(X(0.44), 0, m * 0.05, color);
      circ(X(0.56), 0, m * 0.05, color);
      break;
    case 'mesa-mezclas':
      caja();
      circ(X(0.3), 0, m * 0.25);
      letra('MZ', color, X(0.7), 0, 0.7);
      break;
    case 'tarja-lavado':
      caja();
      tinas(3);
      break;
    case 'regadera-emerg':
      caja('#dcfce7');
      lf(0, 0, 1, 1);
      lf(1, 0, 0, 1);
      circ(0, 0, m * 0.12, '#16a34a');
      break;
    case 'lavaojos':
      circ(0, 0, m / 2, '#dcfce7');
      circ(-m * 0.16, 0, m * 0.1);
      circ(m * 0.16, 0, m * 0.1);
      break;
    case 'casillero-epp':
      caja();
      lf(1 / 3, 0, 1 / 3, 1);
      lf(2 / 3, 0, 2 / 3, 1);
      letra('EPP', color, 0, 0, 0.6);
      break;
    case 'aspersora':
      circ(0, 0, m * 0.35, '#ffffff');
      linea(m * 0.25, -m * 0.25, m * 0.5, -m * 0.5);
      circ(0, 0, m * 0.1);
      break;
    case 'envases-vacios':
      caja();
      lf(0, 0, 1, 1);
      lf(1, 0, 0, 1);
      letra('EV', color, 0, 0, 0.7);
      break;
    case 'kit-derrames':
      caja('#fef9c3');
      letra('KD', color, 0, 0, 0.8);
      break;
    case 'senal-peligro':
      rombo('#ffffff', '#b91c1c');
      letra('☠', '#111827', 0, 0, 1.1);
      break;
    case 'extractor':
      caja();
      circ(0, 0, m * 0.38);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * m * 0.18, Math.sin(a) * m * 0.18, m * 0.16, m * 0.07, a, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;

    // ───── Alimentos ─────
    case 'mesa-inox':
      caja('#f1f5f9');
      rect(0.03, 0.06, 0.94, 0.88);
      lf(0.03, 0.75, 0.97, 0.75);
      break;
    case 'tarja-doble':
      caja();
      tinas(2);
      break;
    case 'estufa-ind':
      caja();
      hornillas(3, 2);
      break;
    case 'horno':
      caja();
      rect(0.12, 0.25, 0.76, 0.6);
      lf(0.15, 0.12, 0.85, 0.12);
      break;
    case 'freidora':
      caja();
      rect(0.1, 0.08, 0.8, 0.38);
      rect(0.1, 0.54, 0.8, 0.38);
      break;
    case 'campana':
      ctx.save();
      ctx.setLineDash([m * 0.08, m * 0.05]);
      ctx.strokeRect(x0, y0, w, h);
      lf(0, 0, 1, 1);
      lf(1, 0, 0, 1);
      ctx.restore();
      break;
    case 'camara-fria':
      caja('#e0f2fe');
      rect(0.06, 0.06, 0.88, 0.88);
      letra('CF', '#0369a1', 0, 0, 0.7);
      break;
    case 'bascula':
      caja();
      circ(0, 0, m * 0.3);
      linea(0, 0, m * 0.18, -m * 0.18);
      break;
    case 'bote-pedal':
      circ(0, -m * 0.05, m * 0.42, '#ffffff');
      lf(0.35, 0.95, 0.65, 0.95);
      lf(0.15, 0.4, 0.85, 0.4);
      break;
    case 'trampa-grasa':
      caja('#f5f5f4');
      letra('TG', color, 0, 0, 0.8);
      break;
    case 'coladera':
      circ(0, 0, m / 2, '#ffffff');
      linea(-m * 0.3, -m * 0.15, m * 0.3, -m * 0.15);
      linea(-m * 0.35, 0, m * 0.35, 0);
      linea(-m * 0.3, m * 0.15, m * 0.3, m * 0.15);
      break;

    case 'mesa':
    default:
      caja();
  }
}
