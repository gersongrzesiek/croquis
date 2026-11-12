/** CSS del editor. Todas las clases llevan el prefijo crq- para no chocar con la app anfitriona. */
// Interfaz en grises grafito para que el croquis sea lo único con color.
// Un acento (tinta azul de plano) marca la herramienta activa, la selección y la acción principal.
// Las cifras usan mono tabular, como un escalímetro.
export const CSS = `
.crq-raiz{
  --crq-bg:#f4f4f3;--crq-panel:#fff;--crq-borde:rgba(28,28,30,.10);--crq-borde-fuerte:rgba(28,28,30,.16);
  --crq-texto:#1c1c1e;--crq-sutil:#5c5c60;--crq-tenue:#8a8a8e;
  --crq-hover:rgba(28,28,30,.05);--crq-activo:rgba(28,28,30,.08);--crq-campo:#fff;
  --crq-acento:#1f5fbf;--crq-acento-tinta:#1f5fbf;--crq-sobre-acento:#fff;--crq-peligro:#b8372e;
  --crq-mono:ui-monospace,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;
  --crq-curva:cubic-bezier(.2,0,0,1);
  display:flex;flex-direction:column;width:100%;height:100%;background:var(--crq-bg);color:var(--crq-texto);
  font:14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;box-sizing:border-box;user-select:none}
.crq-raiz[data-tema="oscuro"]{
  --crq-bg:#141415;--crq-panel:#1c1c1e;--crq-borde:rgba(255,255,255,.08);--crq-borde-fuerte:rgba(255,255,255,.14);
  --crq-texto:#ececed;--crq-sutil:#a3a3a8;--crq-tenue:#76767b;
  --crq-hover:rgba(255,255,255,.05);--crq-activo:rgba(255,255,255,.09);--crq-campo:#141415;
  --crq-acento:#ececed;--crq-acento-tinta:#7aa7ec;--crq-sobre-acento:#141415;--crq-peligro:#e2766c}
.crq-raiz *{box-sizing:border-box}
.crq-modal{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.45);display:flex;padding:16px}
.crq-modal>.crq-raiz{border-radius:12px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.28)}

.crq-barra{display:flex;align-items:center;gap:4px;padding:8px 12px;background:var(--crq-panel);border-bottom:1px solid var(--crq-borde);flex-wrap:wrap}
.crq-titulo{font-weight:500;font-size:15px;margin-right:12px;white-space:nowrap}
.crq-sep{width:1px;height:20px;background:var(--crq-borde);margin:0 8px}
.crq-esp{flex:1}

.crq-raiz button{font:inherit;color:inherit;background:transparent;border:1px solid transparent;border-radius:8px;height:32px;padding:0 12px;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;
  transition:background-color .12s var(--crq-curva),border-color .12s var(--crq-curva),color .12s var(--crq-curva),transform .08s var(--crq-curva)}
.crq-raiz button:hover{background:var(--crq-hover)}
.crq-raiz button:active:not(:disabled){transform:scale(.97)}
.crq-raiz button:focus-visible{outline:2px solid var(--crq-acento-tinta);outline-offset:1px}
.crq-raiz button:disabled{opacity:.35;cursor:default}
.crq-raiz button svg{flex:none}
.crq-raiz button.crq-icono{width:32px;padding:0}
.crq-raiz button.crq-borde{border-color:var(--crq-borde-fuerte)}
.crq-raiz button.crq-primario{background:var(--crq-acento);border-color:var(--crq-acento);color:var(--crq-sobre-acento)}
.crq-raiz button.crq-primario:hover{filter:brightness(1.08)}
.crq-raiz[data-tema="oscuro"] button.crq-primario:hover{filter:brightness(.92)}
.crq-raiz button.crq-peligro{color:var(--crq-peligro)}

/* Interruptores de la barra: un pequeño cuadro que se llena cuando están activos */
.crq-raiz button.crq-alternar{color:var(--crq-sutil);padding:0 10px}
.crq-raiz button.crq-alternar::before{content:"";width:8px;height:8px;border-radius:2px;border:1.5px solid currentColor;flex:none}
.crq-raiz button.crq-alternar.crq-activo{color:var(--crq-texto)}
.crq-raiz button.crq-alternar.crq-activo::before{background:var(--crq-acento-tinta);border-color:var(--crq-acento-tinta)}

.crq-cuerpo{flex:1;display:flex;min-height:0}
.crq-herr{flex:none;display:flex;flex-direction:column;gap:4px;padding:8px;background:var(--crq-panel);border-right:1px solid var(--crq-borde);overflow-y:auto}
.crq-herr .crq-hueco{flex:none;height:1px;margin:4px 6px;background:var(--crq-borde)}
.crq-raiz .crq-herr button{width:36px;height:36px;padding:0;color:var(--crq-sutil)}
.crq-raiz .crq-herr button:hover{color:var(--crq-texto)}
.crq-raiz .crq-herr button.crq-activo{background:var(--crq-activo);color:var(--crq-acento-tinta);box-shadow:inset 0 0 0 1px var(--crq-borde)}

.crq-tip{position:fixed;z-index:2147483001;transform:translate(-4px,-50%);opacity:0;pointer-events:none;
  display:flex;align-items:center;gap:8px;height:28px;padding:0 6px 0 10px;border-radius:8px;
  background:var(--crq-texto);color:var(--crq-panel);font-size:13px;white-space:nowrap;
  box-shadow:0 2px 8px rgba(0,0,0,.16);transition:opacity .1s var(--crq-curva),transform .1s var(--crq-curva)}
.crq-tip.crq-visible{opacity:1;transform:translate(0,-50%);transition-delay:.15s}
.crq-tip kbd{font:500 11px/1 var(--crq-mono);min-width:18px;height:18px;padding:0 4px;display:inline-flex;align-items:center;justify-content:center;
  border-radius:4px;background:color-mix(in srgb,var(--crq-panel) 18%,transparent);color:var(--crq-panel)}
.crq-lienzo{flex:1;position:relative;min-width:0;overflow:hidden}
.crq-lienzo canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block}

.crq-panel{flex:0 0 280px;width:280px;min-width:280px;background:var(--crq-panel);border-left:1px solid var(--crq-borde);overflow-y:auto;overflow-x:hidden;padding:16px;display:flex;flex-direction:column;gap:16px}
.crq-panel h3{margin:0 0 -8px;font-size:15px;font-weight:500;color:var(--crq-texto)}
.crq-panel p{margin:0;color:var(--crq-sutil);font-size:13px;line-height:1.5}
.crq-campo{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--crq-sutil)}
.crq-campo.crq-fila{flex-direction:row;align-items:center;justify-content:space-between;gap:8px;color:var(--crq-texto)}
.crq-campo input,.crq-campo select,.crq-campo textarea{font:inherit;color:var(--crq-texto);background:var(--crq-campo);border:1px solid var(--crq-borde-fuerte);border-radius:8px;height:32px;padding:0 8px;width:100%;user-select:text;
  transition:border-color .12s var(--crq-curva)}
.crq-campo input[type=number]{font-family:var(--crq-mono);font-size:13px;font-variant-numeric:tabular-nums}
.crq-campo input:focus,.crq-campo select:focus,.crq-campo textarea:focus{outline:none;border-color:var(--crq-acento-tinta);box-shadow:0 0 0 1px var(--crq-acento-tinta)}
.crq-campo input[type=checkbox]{width:16px;height:16px;accent-color:var(--crq-acento-tinta)}
.crq-campo input[type=color]{padding:2px;height:32px;width:48px;flex:none;cursor:pointer}
.crq-campo textarea{height:auto;min-height:64px;padding:8px;resize:vertical}
.crq-botones{display:flex;flex-wrap:wrap;gap:8px}
.crq-raiz .crq-botones button{border-color:var(--crq-borde-fuerte)}

.crq-catalogo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.crq-raiz .crq-catalogo button{flex-direction:column;height:auto;min-width:0;padding:8px 4px;font-size:12px;line-height:1.25;gap:4px;white-space:normal;text-align:center;overflow-wrap:anywhere;
  border-color:var(--crq-borde);color:var(--crq-sutil)}
.crq-raiz .crq-catalogo button:hover{color:var(--crq-texto)}
.crq-raiz .crq-catalogo button.crq-activo{background:var(--crq-activo);border-color:var(--crq-acento-tinta);color:var(--crq-texto)}
.crq-catalogo canvas{width:64px;height:44px;flex:none}
.crq-raiz[data-tema="oscuro"] .crq-catalogo canvas{filter:invert(.92)}

.crq-estado{display:flex;gap:16px;align-items:center;padding:4px 12px;font-size:12px;color:var(--crq-tenue);background:var(--crq-panel);border-top:1px solid var(--crq-borde);min-height:28px}
.crq-estado b{color:var(--crq-texto);font-weight:500}
.crq-estado .crq-cifra{font-family:var(--crq-mono);font-variant-numeric:tabular-nums}
.crq-estado .crq-aviso{color:var(--crq-peligro);font-weight:500}
.crq-colores{display:flex;flex-wrap:wrap;gap:4px}
.crq-raiz .crq-colores button{width:20px;height:20px;padding:0;border-radius:4px;border:1px solid var(--crq-borde)}
.crq-raiz .crq-colores button:hover{border-color:var(--crq-borde-fuerte);background-clip:padding-box}
.crq-zoom{min-width:48px;text-align:center;font-family:var(--crq-mono);font-variant-numeric:tabular-nums;color:var(--crq-sutil);font-size:12px}
`;

let inyectado = false;
export function inyectarEstilos() {
  if (inyectado) return;
  inyectado = true;
  const s = document.createElement('style');
  s.setAttribute('data-croquis', '');
  s.textContent = CSS;
  document.head.appendChild(s);
}
