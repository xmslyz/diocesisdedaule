#!/usr/bin/env python3
"""Convierte los calendarios de LitCal (data/calendario/daule-AAAA.json) en archivos .js
ligeros que la página carga sin servidor (también al abrirla con doble clic).

Uso:  python scripts/calendario_js.py
Volver a ejecutarlo cada vez que se reemplace o añada un daule-AAAA.json.

Solo se copian hechos del calendario (fecha, nombre de la celebración, grado, color, tiempo);
ningún texto litúrgico.
"""
import json
import pathlib

CARPETA = pathlib.Path(__file__).resolve().parent.parent / "data" / "calendario"

for origen in sorted(CARPETA.glob("daule-*.json")):
    datos = json.loads(origen.read_text(encoding="utf-8"))
    dias = {}
    for d in datos["days"]:
        c = d["celebration"]
        e = {"n": c["name"], "t": c["type"], "c": d["color"], "s": d["season"]}
        if d.get("season_week"):
            e["w"] = d["season_week"]
        if d.get("psalter_week"):
            e["p"] = d["psalter_week"]
        if c.get("sub"):
            e["sub"] = c["sub"]
        if c.get("source") not in (None, "general"):
            e["src"] = c["source"]
        otras = [o["name"] for o in d.get("options", []) + d.get("commemorations", [])]
        if otras:
            e["op"] = otras
        if d.get("transferred_from"):
            e["tr"] = d["transferred_from"]
        dias[d["date"]] = e
    anio = origen.stem.split("-")[1]
    destino = origen.with_suffix(".js")
    destino.write_text(
        "(window.CALENDARIO = window.CALENDARIO || {})[%s] = %s;\n"
        % (json.dumps(anio), json.dumps(dias, ensure_ascii=False, separators=(",", ":"))),
        encoding="utf-8")
    print(destino.name, len(dias), "días")
