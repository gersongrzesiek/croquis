import { defineConfig } from 'vite';

// Compila la librería a un solo archivo (dist-lib/croquis.js) que expone window.Croquis.
// Se puede pegar dentro de un <script> en una app de un solo HTML, sin internet.
export default defineConfig({
  build: {
    outDir: 'dist-lib',
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      name: 'Croquis',
      formats: ['iife'],
      fileName: () => 'croquis.js',
    },
  },
});
