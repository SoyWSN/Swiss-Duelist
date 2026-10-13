# Swiss Duelist — Plan del proyecto

App de escritorio para torneos suizos de Yu-Gi-Oh, con soporte de **Doble Loss**.
Motivación: STC está anticuado y no cubre el Doble Loss, que la política **KDE v2.5 (2025)** hizo central.

> Maqueta visual en `mockup/index.html`.

## Flujo validado

```
Inicio → Crear torneo → Torneo (rondas + clasificación) → Cierre (podio) → Guardar → Inicio (recientes)
```

## Decisiones de dominio

- **Tiebreakers (KTS):** Puntos → OMW% → OOMW% (oponentes de tus oponentes). **NO** GWP% (eso es Magic).
- **Récord de juegos:** no importa (2-0 = 2-1). No se captura juego por juego.
- **Doble Loss:** 0 pts para ambos; arrastra tu OMW% y el de tu rival.
- **Empates:** no existen a nivel de partida (v2.5). Sin 2 victorias al agotar tiempo → DL.
- **Bye:** 3 pts, no repetible.
- **Rondas por nº jugadores:** 4–8→3, 9–16→4, 17–32→5, 33–64→6, 65–128→7.
- **Top 8:** opcional (off por defecto).

## Requerimientos funcionales

- **Home:** bienvenida + "Crear torneo" + recientes (tabla final con podio).
- **Crear torneo:** nombre → tiempo → toggle Top 8 → duelistas (solo nombre) → confirmación (lista + nº + rondas auto).
- **Torneo:** emparejamientos automáticos (anti-revancha, byes) + clasificación en vivo (sub-pestañas).
- **Resultado:** 3 botones — Gana A / Gana B / ⚠ Doble Loss (+ Bye automático).
- **Siguiente ronda:** confirmación con lista de resultados + mantener presionado.
- **Cierre:** podio 1-2-3 + "Guardar torneo".
- **Extras:** drops, reloj configurable, top cut opcional.
- **Fuera de alcance:** impresión, CSV export, integración NEURON/KCGN (futuro).

## Arquitectura (4 capas)

| Capa | Contenido |
|---|---|
| Dominio ⭐ | Motor puro TS: modelo, emparejamiento, tiebreakers, end-of-match, validaciones — 100% testeable |
| Aplicación | Rondas, captura de resultados, duelistas, top cut, cierre/guardado, auditoría |
| Presentación | Tauri 2 + React, pantallas, tema carbón+naranja |
| Infraestructura | SQLite (escrituras atómicas, autosave), historial, bitácora |

## Stack

- Shell: **Tauri 2** (binario ~10 MB, instalador .msi/.exe)
- UI: **React + TypeScript**
- Estilos: tokens CSS (naranja `#F97316` + carbón)
- BD: **SQLite** (better-sqlite3 o plugin SQL de Tauri)
- Motor: librería TS pura con *golden tests* (torneos calculados a mano)

## Roadmap (≈2-3 h/día)

| Fase | Entregable | Días |
|---|---|---|
| 0 · Setup | Repo, scaffold Tauri+React+TS, SQLite, lint, estructura | 2 |
| 1 · Motor | Modelo, emparejamiento suizo, tiebreakers, doble loss, validaciones + tests | 6 |
| 2 · Persistencia | Esquema SQLite, repositorios, autosave, bitácora, guardar/cargar | 3 |
| 3 · UI (flujo feliz) | Home, crear torneo, torneo, modal resultado, siguiente ronda, cierre | 6 |
| 4 · Refinamientos | Drops, penalidades, top cut, reloj configurable, config, pulido visual | 4 |
| 5 · Empaquetado | Instalador .msi/.exe + prueba de torneo real + correcciones | 3 |
| **Total** | | **~24 días** |

Part-time ≈ **5 semanas** · Full-time ≈ **3 semanas**.
