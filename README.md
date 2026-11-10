# Diócesis de Daule — sitio web

Sitio estático de la Diócesis de Daule (Ecuador). En construcción.

- `index.html` — página de inicio (versión para ordenador y versión para teléfono en el mismo archivo).
- `camino.html` — el camino en cuatro pasos, con las pastorales y movimientos que acompañan cada uno.
- `pastorales.html` — una ficha por cada pastoral, movimiento y obra, con enlace a su página propia.
- `diocesis.html` — obispo, patrona, catedral, historia desde 2022, asambleas y curia.
- `parroquias.html` — las 30 parroquias con mapa, zonas y buscador; datos en `data/parroquias.json` / `.js`.
- `agenda.html` — actos de la diócesis (se editan en `data/agenda.js`) junto con las solemnidades y fiestas
  del calendario litúrgico, que salen solas de LitCal.
- `noticias.html` — noticias; se llena sola con `data/noticias.js`.
- `js/hoja.js` — hoja del calendario litúrgico de hoy en la página de inicio. Para probar otro día:
  `index.html?fecha=2026-12-09`.
- `data/calendario/daule-AAAA.json` — calendario propio de la diócesis generado por LitCal (2026–2030).
  Tras reemplazar o añadir un año: `python scripts/calendario_js.py` (genera los `.js` que carga la página).
- `img/` — fotos, escudo y sello del año pastoral.
- `scripts/noticias_facebook.py` + `.github/workflows/noticias.yml` — tarea diaria (gratis) que trae las
  publicaciones nuevas de la página de Facebook: texto y enlaces a las fotos (las fotos no se copian).
  Se activa creando el secreto `FB_PAGE_TOKEN` en Settings → Secrets and variables → Actions.
  Para ocultar una publicación: añadir `"oculta": true` en su entrada de `data/noticias.json` (`noticias.js` se regenera en la siguiente ejecución).

Para verlo en el ordenador: abrir `index.html` con doble clic.

Mientras el sitio está en construcción, `index.html` lleva `<meta name="robots" content="noindex, nofollow">`
para que los buscadores no lo indexen. Quitar esa línea al publicar oficialmente.

Colores de las zonas pastorales: Norte `#3FA2E0` · Centro `#0A5C1A` · Este `#D8321F` · Oeste `#E0B43C`.
