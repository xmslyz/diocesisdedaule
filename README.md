# Diócesis de Daule — sitio web

Sitio estático de la Diócesis de Daule (Ecuador). En construcción.

- `index.html` — página de inicio (versión para ordenador y versión para teléfono en el mismo archivo).
- `noticias.html` — noticias; se llena sola con `data/noticias.js`.
- `img/` — fotos, escudo y sello del año pastoral.
- `scripts/noticias_facebook.py` + `.github/workflows/noticias.yml` — tarea diaria (gratis) que trae las
  publicaciones nuevas de la página de Facebook: texto y enlaces a las fotos (las fotos no se copian).
  Se activa creando el secreto `FB_PAGE_TOKEN` en Settings → Secrets and variables → Actions.
  Para ocultar una publicación: añadir `"oculta": true` en su entrada de `data/noticias.json`... y en `data/noticias.js`.

Para verlo en el ordenador: abrir `index.html` con doble clic.

Mientras el sitio está en construcción, `index.html` lleva `<meta name="robots" content="noindex, nofollow">`
para que los buscadores no lo indexen. Quitar esa línea al publicar oficialmente.

Colores de las zonas pastorales: Norte `#3FA2E0` · Centro `#0A5C1A` · Este `#D8321F` · Oeste `#E0B43C`.
