<p align="center">
  <img src="docs/banner.png" width="100%" alt="Swiss Duelist" />
</p>

<h1 align="center">Swiss Duelist</h1>

<p align="center">
  <strong>Gestor de torneos suizos para Yu-Gi-Oh!</strong><br />
  Aplicación de escritorio con soporte de <b>Doble Loss</b> y desempates oficiales <b>KDE v2.5</b>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri&logoColor=white" alt="Tauri 2" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/version-1.0.0-F97316" alt="Versión 1.0.0" />
</p>

---

## Acerca de

**Swiss Duelist** es una aplicación de escritorio para organizar torneos de **Yu-Gi-Oh!** en formato de **rondas suizas**. Está pensada para torneos locales y de comunidad, e implementa fielmente la **política oficial KDE v2.5**, incluyendo el **Doble Loss** — la función que la mayoría de herramientas disponibles no soporta.

<p align="center">
  <img src="docs/char-1.png" height="210" alt="" />
  <img src="docs/char-2.png" height="210" alt="" />
  <img src="docs/char-3.png" height="210" alt="" />
</p>

## Características

- **Emparejamiento suizo automático** — agrupa por puntaje, evita revanchas y asigna byes.
- **Soporte completo de Doble Loss** — 0 puntos para ambos jugadores (política v2.5).
- **Desempates oficiales (KTS):** Puntos → OMW% → OOMW% → DDD → enfrentamiento directo.
- **Captura de resultados rápida** — gana A / gana B / doble loss / bye.
- **Clasificación en vivo** con podio 1-2-3.
- **Reloj de ronda** configurable (iniciar / pausar).
- **Varios torneos a la vez** — puedes correr más de un torneo simultáneamente.
- **Persistencia en SQLite** con autoguardado: nada se pierde si cierras la app.
- **Guardar, descartar y borrar** torneos desde la interfaz.

## Instalación

### Opción 1 — Instalador para Windows (recomendado)

1. Ve a la sección **[Releases](https://github.com/SoyWSN/Swiss-Duelist/releases)** del repositorio.
2. Descarga **`Swiss Duelist_1.0.0_x64-setup.exe`**.
3. Ejecuta el archivo y sigue el asistente de instalación.
4. Listo — la app aparecerá en el **menú inicio** (y puedes crear un acceso directo en el escritorio).

> También está disponible `Swiss Duelist_1.0.0_x64_en-US.msi` (formato Windows Installer) si lo prefieres.

No requiere instalar nada adicional: el instalador incluye todo lo necesario.

### Opción 2 — Compilar desde el código fuente

Requiere **Windows 10/11** y las herramientas de desarrollo (ver [Desarrollo](#desarrollo)).

```bash
git clone https://github.com/SoyWSN/Swiss-Duelist.git
cd Swiss-Duelist
npm install

# 1) Ejecutar la app en modo desarrollo
npm run tauri dev -w desktop

# 2) Generar el instalador (.exe y .msi)
npm run tauri build -w desktop
```

El instalador se genera en:

```
apps/desktop/src-tauri/target/release/bundle/
```

## Uso rápido

1. **Crear torneo** — ponle un nombre y agrega a los duelistas.
2. **Iniciar torneo** — se empareja la Ronda 1 automáticamente.
3. **Registrar resultados** — en cada mesa elige el ganador, o marca *Doble Loss*.
4. **Siguiente ronda** — disponible al cerrar todas las mesas (con confirmación).
5. **Cierre** — al terminar la última ronda verás el podio y podrás guardar el torneo.

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Shell de escritorio | **Tauri 2** (Rust) |
| Interfaz | **React 19 + TypeScript** |
| Estilos | CSS con tokens (tema carbón + naranja) |
| Persistencia | **SQLite** (`tauri-plugin-sql`) |
| Motor (dominio) | Librería TypeScript pura (emparejamiento + desempates) |
| Confetti | `canvas-confetti` |

## Desempates (KDE v2.5)

El orden oficial de desempate aplicado es:

```
Puntos  →  OMW%  →  OOMW%  →  DDD  →  Enfrentamiento directo  →  Alfabético
```

- **Puntos** — 3 por victoria o bye; 0 por derrota o doble loss.
- **OMW%** — porcentaje de victorias de tus rivales (con piso del 33%).
- **OOMW%** — porcentaje de victorias de los rivales de tus rivales.
- **DDD** — suma de los cuadrados de las rondas en que perdiste (menor es mejor).
- **Enfrentamiento directo** — si empatan en todo, gana quien ganó el duelo entre ellos.
- **Alfabético** — último recurso.

> **Nota:** en Yu-Gi-Oh **no existe** el *game-win percentage* (eso es de Magic: The Gathering). Un 2-0 y un 2-1 valen exactamente lo mismo.

## Estructura del proyecto

```
SwissDuelist/
├── apps/
│   └── desktop/          # App de escritorio (Tauri + React + TypeScript)
│       ├── src/          # Frontend (React)
│       ├── src-tauri/    # Backend (Rust) + configuración de Tauri
│       └── public/       # Assets estáticos (fuente, arte)
├── packages/
│   └── engine/           # Motor puro: emparejamiento + desempates (testeable)
├── assets/               # Arte fuente
├── mockup/               # Maqueta visual del diseño
├── PLAN.md               # Plan del proyecto
└── README.md
```

## Desarrollo

### Requisitos

- **Node.js** 20+ y npm
- **Rust** (toolchain `stable-msvc`) — [rustup.rs](https://rustup.rs)
- **Visual Studio Build Tools 2022** (carga "Desarrollo para escritorio con C++")

### Comandos

```bash
# Instalar dependencias (monorepo)
npm install

# Tests del motor (Vitest)
npm run test -w @swiss-duelist/engine

# App en desarrollo (con recarga en vivo)
npm run tauri dev -w desktop

# Compilar el instalador
npm run tauri build -w desktop
```

## Sobre mí

<p align="center">
  <img src="docs/pollo.png" width="340" alt="WSN" />
</p>

Soy **WSN**. Además de pertenecer a la comunidad de **Yu-Gi-Oh!**, estoy en proceso de formarme como **Ingeniero de Desarrollo y Gestión de Software**.

Creé **Swiss Duelist** para resolver un problema concreto: no encontrar una herramienta realmente adecuada para organizar torneos de este juego. Las opciones disponibles son limitadas — muchas requieren conexión a internet, resultan complicadas de usar, tienen interfaces anticuadas o están saturadas de anuncios.

Mi propuesta es distinta: una aplicación **ligera**, **completamente local** y con una interfaz **amigable, elegante y 100% gratuita**, que representa el juego como se merece.

Espero que sea de tu agrado. Cualquier comentario o reseña será tomado en cuenta para seguir mejorando y dándole soporte a este proyecto.

## Privacidad y datos

**Swiss Duelist es una aplicación completamente local.** No se conecta a internet, no requiere crear una cuenta y no envía información a ningún servidor externo.

La aplicación guarda **únicamente la información de tus torneos** — nombres de los duelistas, emparejamientos y resultados — en una **base de datos SQLite local**, dentro de tu propia computadora. No recopila datos personales, de uso, ni de ningún otro tipo.

Y tienes el **control total**: puedes **eliminar cualquier torneo directamente desde la aplicación** (botón de borrar en la sección Torneos), y con él desaparece toda su información guardada.

## Aviso legal

El arte de **Yu-Gi-Oh!** utilizado en la interfaz es propiedad de **Konami / Studio Dice**. Este es un proyecto **fan-made y sin fines de lucro**, creado para organizar torneos locales.

---

<p align="center"><sub>Hecho para la comunidad de Yu-Gi-Oh!</sub></p>
