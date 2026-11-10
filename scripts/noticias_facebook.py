#!/usr/bin/env python3
"""Trae las publicaciones recientes de la página de Facebook de la diócesis.

Solo usa la biblioteca estándar de Python. Lee el token de página de la variable
de entorno FB_PAGE_TOKEN (secreto del repositorio); nunca se escribe en un archivo.

Resultado:
  data/noticias.json   lista de publicaciones, la más reciente primero
  data/noticias.js     lo mismo como `window.NOTICIAS = [...]` (para abrir el sitio con doble clic)

Las fotos NO se copian: se guardan solo sus enlaces de Facebook. Esos enlaces caducan
al cabo de un tiempo, así que en cada ejecución se renuevan los de las publicaciones
recientes (las que Facebook devuelve) y se quitan los de las más antiguas, que quedan
con su texto y el enlace a la publicación.

Lo que se edite a mano en noticias.json (por ejemplo "oculta": true) se conserva.
"""
import json
import os
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request

RAIZ = pathlib.Path(__file__).resolve().parent.parent
JSON = RAIZ / "data" / "noticias.json"
JS = RAIZ / "data" / "noticias.js"

MAX_FOTOS = 3        # fotos que se guardan por publicación
MAX_NOTICIAS = 120   # publicaciones que se conservan
CAMPOS = ("id,message,created_time,permalink_url,full_picture,"
          "attachments{media_type,media,subattachments{media_type,media}}")


def pedir(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)


def fotos_de(post):
    """Enlaces de las fotos de una publicación (sin vídeos)."""
    urls = []
    for adj in (post.get("attachments") or {}).get("data", []):
        subs = (adj.get("subattachments") or {}).get("data", [])
        for a in (subs or [adj]):
            if a.get("media_type") in ("photo", "album", None):
                src = ((a.get("media") or {}).get("image") or {}).get("src")
                if src:
                    urls.append(src)
    if not urls and post.get("full_picture"):
        urls.append(post["full_picture"])
    vistos, unicos = set(), []
    for u in urls:
        if u not in vistos:
            vistos.add(u)
            unicos.append(u)
    return unicos[:MAX_FOTOS]


def convertir(post):
    return {
        "id": post["id"],
        "fecha": post.get("created_time", ""),
        "texto": (post.get("message") or "").strip(),
        "enlace": post.get("permalink_url", ""),
        "fotos": fotos_de(post),
    }


def main():
    token = os.environ.get("FB_PAGE_TOKEN", "").strip()
    if not token:
        print("Falta el secreto FB_PAGE_TOKEN: no se hace nada.")
        return 0

    guardadas = json.loads(JSON.read_text(encoding="utf-8")) if JSON.exists() else []
    por_id = {n["id"]: n for n in guardadas}

    url = "https://graph.facebook.com/me/posts?" + urllib.parse.urlencode(
        {"fields": CAMPOS, "limit": 25, "access_token": token})
    try:
        respuesta = pedir(url)
    except urllib.error.HTTPError as e:
        detalle = e.read().decode("utf-8", "replace")
        try:
            detalle = json.loads(detalle)["error"]["message"]
        except (ValueError, KeyError):
            detalle = detalle[:300]
        print(f"Facebook respondió con error {e.code}: {detalle}")
        return 1

    nuevas = 0
    recientes = set()
    for post in respuesta.get("data", []):
        if not post.get("message") and not fotos_de(post):
            continue  # publicaciones vacías (cambios de portada, etc.)
        recientes.add(post["id"])
        fresca = convertir(post)
        if post["id"] in por_id:
            por_id[post["id"]].update(fresca)   # renueva texto y enlaces de fotos; conserva lo añadido a mano
        else:
            por_id[post["id"]] = fresca
            nuevas += 1
    for pid, n in por_id.items():
        if pid not in recientes:
            # enlaces de Facebook ya caducados o a punto de caducar; las fotos propias (img/…) se conservan
            n["fotos"] = [f for f in n.get("fotos", []) if not f.startswith("http")]

    todas = sorted(por_id.values(), key=lambda n: n["fecha"], reverse=True)[:MAX_NOTICIAS]

    texto = json.dumps(todas, ensure_ascii=False, indent=1)
    JSON.write_text(texto + "\n", encoding="utf-8")
    JS.write_text("window.NOTICIAS = " + texto + ";\n", encoding="utf-8")
    print(f"{nuevas} publicaciones nuevas; {len(todas)} en total.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
