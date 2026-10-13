# Swiss Duelist

Gestor de torneos suizos para **Yu-Gi-Oh!** (app de escritorio), con soporte de **Doble Loss**
según la política **KDE v2.5 (2025)**.

## Estructura

```
SwissDuelist/
├── apps/
│   └── desktop/        # App de escritorio (Tauri 2 + React + TypeScript)
├── packages/
│   └── engine/         # Motor puro: emparejamientos, desempates, doble loss (sin UI/BD)
├── mockup/             # Maqueta visual del diseño (abrir index.html)
└── PLAN.md             # Plan del proyecto (requisitos, arquitectura, roadmap)
```

## Requisitos

- Node.js 20+ y npm
- Rust (toolchain `stable-msvc`) — `cargo --version`
- Visual Studio Build Tools 2022 (carga "Desarrollo para escritorio con C++")

## Desarrollo

```bash
# Tests del motor
npm run test -w @swiss-duelist/engine

# Frontend (Vite) en caliente
npm run dev -w desktop

# App completa (Vite + Rust) en caliente
npm run tauri dev -w desktop
```

## Reglas clave (KDE v2.5)

- **Desempates (KTS):** Puntos → OMW% → OOMW%. *No* existe game-win % (eso es de Magic).
- **Doble Loss:** 0 puntos para ambos; arrastra puntos y OMW%.
- **Sin empates de partida:** si nadie llega a 2 victorias al agotar el tiempo → Doble Loss.
- **Bye:** 3 puntos, no repetible.
