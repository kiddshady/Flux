# Flux

Mapa interactivo del metabolismo para estudiar Química Biológica. Las rutas
dibujadas y, al tocar una flecha, la ficha de su enzima: reacción, tipo,
regulación, inhibidores y clínica.

App de escritorio para Windows (Electron), construida sobre la plantilla Opal.

## Qué trae

- **El mapa:** glucólisis, gluconeogénesis, vía de las pentosas, glucógeno,
  piruvato deshidrogenasa, ciclo de Krebs, cadena respiratoria, oxidación y
  síntesis de ácidos grasos, cuerpos cetónicos, colesterol y lipoproteínas.
- **Fichas** de cada enzima y de cada metabolito (qué lo forma, qué lo consume).
- **Capas:** ruta, vías, energía, regulación e inhibidores.
- **Lista de enzimas** con búsqueda (Ctrl+F).

La rueda desplaza el mapa, Ctrl + rueda acerca y arrastrar lo mueve.

## Desarrollo

```
npm install
npm run dev        # abre la app
npm test           # tokens, store y formato
npm run smoke      # monta la app y la recorre (FLUX_SHOTS=<carpeta> guarda capturas)
npm run icons      # regenera el ícono y la marca desde tools/build-icon.mjs
npm run dist       # arma el instalador en dist/
npm run release    # lo publica en GitHub
```

Los datos del mapa están en `renderer/js/flux/datos.js`; el dibujo, en
`renderer/js/flux/mapa.js`.

## Licencia

MIT. © 2026 Kidd Shady · Umbrovex Systems
