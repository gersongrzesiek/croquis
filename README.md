# Croquis

Aplicación web para hacer croquis rápidos: dibujo a mano alzada, líneas con medida, rectángulos, círculos y texto sobre una cuadrícula.

## Funciones

- Herramientas: lápiz, línea, rectángulo, círculo, texto y borrador
- Cuadrícula opcional; las líneas muestran su longitud en unidades de cuadrícula
- `Shift` mientras dibujas una línea la fija a ángulos de 45°
- Deshacer / rehacer (`Ctrl+Z`, `Ctrl+Y`)
- Exportar el croquis como PNG
- Guardado automático en el navegador

Atajos: `P` lápiz, `L` línea, `R` rectángulo, `C` círculo, `T` texto, `E` borrador.

## Desarrollo

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # compila a dist/
```

## Estructura

```
index.html       # interfaz y barra de herramientas
src/main.ts      # lógica del lienzo y herramientas
src/style.css    # estilos
```
