# Browser Sensor API — Demo

A TypeScript/Vite app that reads real-world physical data from the browser using three sensor APIs.

## What it does

| Tab | API used | Data |
|-----|----------|------|
| Audio | `getUserMedia` (audio) + `Web Audio API` | Sound level in dB SPL with VU meter and sparkline |
| Camera | `AmbientLightSensor` / `getUserMedia` (video fallback) | Ambient brightness in lux with gauge and sparkline |
| Network | `Network Information API` | Downlink speed, RTT, connection type |

The light sensor tries `AmbientLightSensor` first (Chrome/Edge behind flag). If unavailable, it falls back to estimating brightness from the average luminance of the camera feed.

## Stack

- **Vite** — dev server and build
- **TypeScript** — strict mode
- **Tailwind CSS v4** — styling

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, click **Démarrer les capteurs**, and grant microphone + camera permissions.

> HTTPS or localhost is required — browsers block sensor APIs on plain HTTP.

## Project structure

```
src/
  sensors/
    audio.ts      # Microphone → dB SPL via Web Audio AnalyserNode
    camera.ts     # AmbientLightSensor with camera luminance fallback
    network.ts    # NetworkInformation polling + change events
  main.ts         # UI wiring: tabs, sparklines, gauges, start/stop
  constant.ts     # Shared config (MAX_LUX, tab colors, labels…)
  style.css
components/
  vumetre.ts      # Animated VU meter bar component
src/reveal/
  SENSOR_API.md  # Background doc on the Generic Sensor API
```

## Browser support

| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| Web Audio API | Yes | Yes | Yes |
| getUserMedia | Yes | Yes | Yes |
| AmbientLightSensor | Flag only | No | No |
| Network Information API | Yes | No | No |

## Build

```bash
npm run build    # tsc + vite build → dist/
npm run preview  # preview the production build
```
