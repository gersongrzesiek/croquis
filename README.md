# Croquis

Editor de croquis de distribución de áreas, pensado para integrarse en **Actas Offline** y que el verificador dibuje el croquis del establecimiento dentro del acta, sin conexión a internet.

Todo se dibuja en **metros**: los muros, puertas y muebles tienen medidas reales, y las áreas calculan su superficie en m².

## Herramientas

| Herramienta | Tecla | Uso |
|---|---|---|
| Seleccionar | `V` | Clic para seleccionar, arrastrar para mover, arrastrar en vacío para seleccionar varios. Manijas para mover extremos de muros (las esquinas unidas se mueven juntas), girar o cambiar el tamaño de muebles. |
| Mover vista | `H` | También con rueda del ratón (zoom), botón central, `Espacio`+arrastrar o pellizco en pantalla táctil. |
| Muro | `W` | Clic en cada esquina. Mientras dibujas puedes **teclear el largo** (p. ej. `3.5`) y `Enter`. Doble clic, `Esc` o clic derecho para terminar. |
| Cuarto | `Q` | Arrastra un rectángulo y crea sus 4 muros con su piso. Escribe la **etiqueta** (aparece al centro; se mueve con su manija y tiene tamaño y color de letra), elige el **color de fondo** y muestra los m² interiores. Al hacer clic dentro se selecciona el cuarto completo y se mueve con sus muros. |
| Puerta / Ventana | `D` / `N` | Clic sobre un muro: se alinea sola. `F` cambia el lado hacia el que abre; en el panel se cambia ancho y bisagra. |
| Puerta de doble abatimiento | `B` | Puerta de vaivén (abre a ambos lados). Opción **Doble puerta** para dos hojas, como en quirófanos. |
| Área / sombreado | `A` | Arrastra un rectángulo o marca vértices y doble clic. Color de relleno, opacidad, patrón (rayado, cuadriculado, puntos), nombre y m². |
| Mobiliario | `M` | Por categoría: **General**, **Hospitalario** (NOM-016-SSA3-2012), **Control de plagas** (NOM-232-SSA1-2009), **Rayos X** (NOM-229-SSA1-2002) y **Alimentos** (NOM-251-SSA1-2009). `R` gira 90°. |
| Etiqueta | `T` | Texto libre con tamaño, color, negrita y ángulo. |
| Acceso | `X` | Flecha con la leyenda "ACCESO" (editable). |
| Cota | `K` | Línea de medida con la distancia en metros. |
| Línea / Lápiz | `L` / `P` | Líneas (continuas o discontinuas) y trazo a mano alzada. |

Otros atajos: `Ctrl+Z` / `Ctrl+Y` deshacer y rehacer, `Supr` borrar, `Ctrl+D` duplicar, flechas para mover 5 cm (`Shift` 50 cm), `Shift` al trazar fija ángulos de 45°. El **imán** ajusta a una rejilla de 5 cm y a las esquinas existentes; los muros se enderezan solos cerca de 0°/90°.

## Integración en otra app (Actas Offline)

`npm run build:lib` genera **`dist-lib/croquis.js`**: un solo archivo (~55 KB, sin dependencias) que define `window.Croquis`. Se puede pegar dentro de un `<script>` en el HTML de Actas Offline, igual que jsPDF.

```js
// Abrir el editor a pantalla completa. Devuelve null si el usuario cancela.
const r = await Croquis.abrir({
  datos: acta.croquis,          // croquis guardado antes (o null para uno nuevo)
  titulo: 'Croquis del establecimiento',
  tema: 'oscuro',               // 'claro' | 'oscuro'
});
if (r) {
  acta.croquis = r.datos;       // JSON para poder volver a editarlo (guardar en IndexedDB)
  // r.png es un data URL PNG listo para jsPDF; r.ancho y r.alto son sus píxeles
  doc.addImage(r.png, 'PNG', x, y, anchoMM, anchoMM * r.alto / r.ancho);
}

// Regenerar la imagen de un croquis guardado sin abrir el editor (p. ej. al exportar el PDF)
const { png, ancho, alto } = Croquis.imagen(acta.croquis, { anchoMax: 2000 });
```

La imagen se recorta al contenido, lleva fondo blanco y una barra de escala. Las clases CSS del editor llevan el prefijo `crq-` para no chocar con los estilos de la app anfitriona.

Ejemplo completo: [`ejemplos/integracion.html`](ejemplos/integracion.html) (después de `npm run build:lib`, abrirlo con un servidor local).

## Desarrollo

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev        # editor independiente en http://localhost:5173 (autoguarda en el navegador)
npm run build      # revisa tipos, compila la página (dist/) y la librería (dist-lib/croquis.js)
npm run build:lib  # solo la librería
```

## Estructura

```
src/modelo.ts      tipos de elementos (muro, puerta, área, mueble…) en metros
src/render.ts      dibujo de la escena en un <canvas>
src/catalogo.ts    mobiliario y sus símbolos
src/elementos.ts   cajas, detección de clic y movimiento de elementos
src/editor.ts      interfaz, herramientas, panel de propiedades, historial
src/exportar.ts    exportación a PNG
src/index.ts       API pública (Croquis.abrir, Croquis.montar, Croquis.imagen)
src/main.ts        página independiente
```
