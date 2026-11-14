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
| Cortar esquina | `C` | Clic en la esquina de un cuarto o de dos muros para cortarla en diagonal (chaflán); la distancia se ajusta después arrastrando los extremos del corte o en el panel. |
| Agregar esquina | `E` | Parte un muro en dos para arrastrar la nueva esquina y darle otra forma al cuarto. Con el cuarto seleccionado, sus esquinas se arrastran directamente. |
| Puerta / Ventana | `D` / `N` | Clic sobre un muro: se alinea sola. `F` cambia el lado hacia el que abre; en el panel se cambia ancho y bisagra. |
| Puerta de doble abatimiento | `B` | Puerta de vaivén (abre a ambos lados). Opción **Doble puerta**: dos puertas que se juntan al centro, como en quirófanos. |
| Área / sombreado | `A` | Arrastra un rectángulo o marca vértices y doble clic. Color de relleno, opacidad, patrón (rayado, cuadriculado, puntos), nombre y m². |
| Mobiliario | `M` | Por categoría: **General**, **Hospitalario** (NOM-016-SSA3-2012), **Control de plagas** (NOM-232-SSA1-2009), **Rayos X** (NOM-229-SSA1-2002) y **Alimentos** (NOM-251-SSA1-2009). En Hospitalario está el **Transfer / cambio de botas** (0.9 m, el ancho de una puerta): la barrera de acero del acceso a quirófano, que en 3D lleva un maniquí liso sentado sobre la barrera poniéndose una bota (rodilla arriba y las manos en la bota); se coloca en el vano de la puerta y se dibuja encima de ella. **Transfer (solo barrera)** es la misma barrera sin el maniquí. Las **Rejillas de ventilación** superior e inferior (General, Hospitalario, Alimentos) solo se colocan sobre un muro: se pegan a su cara del lado del cursor y se deslizan por él al moverlas; en 3D la superior queda centrada a 4/5 de la altura del muro y la inferior cerca del piso (en el plano la superior va punteada). El cuadro **Buscar mueble** filtra todo el catálogo por nombre (sin importar acentos; `Enter` toma el primero, `Esc` limpia). `R` gira 90°. |
| Etiqueta | `T` | Texto libre con tamaño, color, negrita y ángulo. |
| Acceso | `X` | Flecha con la leyenda "ACCESO" (editable). |
| Cota | `K` | Línea de medida con la distancia en metros. |
| Línea / Lápiz | `L` / `P` | Líneas (continuas o discontinuas) y trazo a mano alzada. |
| Orientación | `O` | Coloca la letra del punto cardinal (N, S, E u O) con una flecha roja que apunta hacia él (una por croquis). La flecha se gira con su manija o con el ángulo en el panel; la letra queda fija. En la vista isométrica aparece siempre junto a la esquina superior derecha del dibujo. |

Otros atajos: `Ctrl+Z` / `Ctrl+Y` deshacer y rehacer, `Supr` borrar, `Ctrl+D` duplicar, flechas para mover 5 cm (`Shift` 50 cm), `Shift` al trazar fija ángulos de 45°. El **imán** ajusta a una rejilla de 5 cm y a las esquinas existentes; los muros se enderezan solos cerca de 0°/90°.

## Vista isométrica

El selector **Plano / Isométrico** de la barra superior muestra el croquis en 3D: los muros se levantan a una altura (2.5 m por defecto; en el panel hay atajos *Completa*, *Media* 1.2 m y *Baja* 0.4 m para ver el interior), las puertas y ventanas quedan como huecos en el muro y el mobiliario con un modelo sencillo de cada mueble (mesas con patas, sillas con respaldo, camas con colchón y barandales, anaqueles con entrepaños, tarjas con llave, botes y extintores cilíndricos…). La **transparencia de muros frontales** (0 a 100 %) aclara los muros exteriores del lado de la vista, dejando su contorno y su franja en el piso, para ver el interior sin bajar la altura. Con **Medidas** activado, el largo de cada muro aparece sobre el muro, en su mismo plano. Los botones **Girar** cambian el lado desde el que se ve; también se gira en tiempo real arrastrando con el botón derecho (o `Shift` + arrastrar): a los lados gira (al soltar se acomoda al giro de 90° más cercano) y hacia arriba o abajo inclina la vista, de casi a ras del piso (5°) a vista desde arriba (90°). La **inclinación** también está en el panel, con los atajos *Isométrica* (35°) y *Desde arriba*. La **transparencia de muros intermedios** (los que separan cuartos por dentro) aclara esos muros y deja su planta en el piso. Es solo una vista: para editar se vuelve a **Plano** (o `Esc`).

El **Soporte de tubo de RX** tiene en su panel la opción **Haz de rayos X**: muestra el campo del haz en amarillo, con **amplitud** (lado del campo, 0.1 a 3 m) y **transparencia** ajustables. El haz sale en horizontal del frente del tubo y llega hasta el primer muro o mueble alto que encuentre (por ejemplo el bucky de pared); si no hay nada, se dibuja de 1.8 m. El alcance también se fija a mano con la **flecha doble** al final del haz (con el tubo seleccionado) o con *Distancia del haz* en el panel; así solo lo recortan los muros. *Automática* vuelve al alcance calculado. En el plano se ve como un abanico punteado y en la vista isométrica como una pirámide de luz.

La vista elegida se guarda con el croquis (`datos.opciones.vista`, `alturaMuros`, `giroIso`, `transparenciaFrontal`), así que *Descargar PNG*, *Guardar croquis* y `Croquis.imagen()` entregan la imagen en esa vista. Para forzar una: `Croquis.imagen(datos, { vista: 'plano' })` o `{ vista: 'isometrico' }`. La imagen isométrica no lleva barra de escala.

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
src/isometrico.ts  vista isométrica (muros levantados, huecos de puertas y ventanas, orden de dibujo)
src/muebles3d.ts   modelos 3D de cada mueble del catálogo, armados por piezas (y mallas para piezas curvas como el arco en C)
src/catalogo.ts    mobiliario y sus símbolos
src/elementos.ts   cajas, detección de clic y movimiento de elementos
src/editor.ts      interfaz, herramientas, panel de propiedades, historial
src/exportar.ts    exportación a PNG
src/index.ts       API pública (Croquis.abrir, Croquis.montar, Croquis.imagen)
src/main.ts        página independiente
```
