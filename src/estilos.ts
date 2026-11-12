/** CSS del editor. Todas las clases llevan el prefijo crq- para no chocar con la app anfitriona. */
export const CSS = `
.crq-raiz{--crq-bg:#f3f4f6;--crq-panel:#fff;--crq-borde:#e5e7eb;--crq-texto:#111827;--crq-sutil:#6b7280;--crq-acento:#2563eb;--crq-hover:#f3f4f6;--crq-campo:#fff;
  display:flex;flex-direction:column;width:100%;height:100%;background:var(--crq-bg);color:var(--crq-texto);font:14px/1.35 system-ui,-apple-system,"Segoe UI",Arial,sans-serif;box-sizing:border-box;user-select:none}
.crq-raiz[data-tema="oscuro"]{--crq-bg:#0f172a;--crq-panel:#1e293b;--crq-borde:#334155;--crq-texto:#f1f5f9;--crq-sutil:#94a3b8;--crq-acento:#3b82f6;--crq-hover:#334155;--crq-campo:#0f172a}
.crq-raiz *{box-sizing:border-box}
.crq-modal{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.45);display:flex;padding:16px}
.crq-modal>.crq-raiz{border-radius:10px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.crq-barra{display:flex;align-items:center;gap:6px;padding:6px 10px;background:var(--crq-panel);border-bottom:1px solid var(--crq-borde);flex-wrap:wrap}
.crq-titulo{font-weight:700;font-size:15px;margin-right:8px;white-space:nowrap}
.crq-sep{width:1px;height:24px;background:var(--crq-borde);margin:0 4px}
.crq-esp{flex:1}
.crq-raiz button{font:inherit;color:inherit;background:var(--crq-panel);border:1px solid var(--crq-borde);border-radius:6px;padding:5px 10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.crq-raiz button:hover{background:var(--crq-hover)}
.crq-raiz button:disabled{opacity:.4;cursor:default}
.crq-raiz button.crq-primario{background:var(--crq-acento);border-color:var(--crq-acento);color:#fff}
.crq-raiz button.crq-peligro{color:#dc2626}
.crq-raiz button.crq-activo{background:var(--crq-acento);border-color:var(--crq-acento);color:#fff}
.crq-cuerpo{flex:1;display:flex;min-height:0}
.crq-herr{display:flex;flex-direction:column;gap:4px;padding:6px;background:var(--crq-panel);border-right:1px solid var(--crq-borde);overflow-y:auto}
.crq-herr button{width:40px;height:40px;padding:0;justify-content:center}
.crq-lienzo{flex:1;position:relative;min-width:0;overflow:hidden}
.crq-lienzo canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block}
.crq-panel{width:250px;background:var(--crq-panel);border-left:1px solid var(--crq-borde);overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:10px}
.crq-panel h3{margin:0;font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--crq-sutil)}
.crq-panel p{margin:0;color:var(--crq-sutil);font-size:13px}
.crq-campo{display:flex;flex-direction:column;gap:3px;font-size:13px}
.crq-campo.crq-fila{flex-direction:row;align-items:center;justify-content:space-between;gap:8px}
.crq-campo input,.crq-campo select,.crq-campo textarea{font:inherit;color:var(--crq-texto);background:var(--crq-campo);border:1px solid var(--crq-borde);border-radius:6px;padding:5px 7px;width:100%;user-select:text}
.crq-campo input[type=checkbox]{width:auto}
.crq-campo input[type=color]{padding:1px;height:30px;width:52px}
.crq-campo textarea{min-height:60px;resize:vertical}
.crq-botones{display:flex;flex-wrap:wrap;gap:6px}
.crq-catalogo{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.crq-catalogo button{flex-direction:column;height:auto;padding:6px 4px;font-size:12px;gap:2px}
.crq-catalogo canvas{width:64px;height:44px}
.crq-estado{display:flex;gap:12px;align-items:center;padding:4px 10px;font-size:12px;color:var(--crq-sutil);background:var(--crq-panel);border-top:1px solid var(--crq-borde);min-height:26px}
.crq-estado b{color:var(--crq-texto)}
.crq-colores{display:flex;flex-wrap:wrap;gap:4px}
.crq-colores button{width:22px;height:22px;padding:0;border-radius:4px}
.crq-zoom{min-width:52px;text-align:center;font-variant-numeric:tabular-nums;color:var(--crq-sutil);font-size:13px}
@media (max-width:820px){.crq-panel{position:absolute;right:0;top:0;bottom:0;z-index:2;box-shadow:-4px 0 12px rgba(0,0,0,.15)}.crq-panel.crq-oculto{display:none}}
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
