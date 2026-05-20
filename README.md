# 🌍 OVERVIEW

> The pulse of the planet, in real time.

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Three.js](https://img.shields.io/badge/Three.js-r170-049ef4)](https://threejs.org)

OVERVIEW is a real-time 3D Earth visualization showing earthquakes, the ISS, flights, wildfires, aurora, ships, and submarine cables — all on a photorealistic globe with custom GLSL shaders.

## ✨ Features

- 🌍 **Photorealistic Earth** — custom GLSL shaders: atmospheric scattering, real-time day/night terminator, city lights, specular ocean reflections
- 📡 **8+ live data layers** — earthquakes (USGS), ISS, flights (OpenSky), wildfires (NASA FIRMS), aurora (NOAA), ships, submarine cables
- ⏳ **Time travel** — scrub through the last 24 hours, replay events with speed control (1×–60×)
- 🔊 **Data sonification** — hear the planet: each event type has a unique spatial sound
- 🛰 **AI narration** — calm narrator tells you what's happening (Claude Haiku)
- 🎬 **Cinematic auto-tour** — camera flies to interesting events automatically
- 📊 **Upload your own data** — drop a CSV (lat, lng, label, value) to visualize custom data
- 🌑 **Premium space aesthetic** — deep space dark, teal atmosphere, star field

## 🚀 Quick Start

```bash
git clone https://github.com/kutluhangil/overview
cd overview
pnpm install
cp .env.local.example .env.local
# Add your API keys (see below)
pnpm dev
```

## 🔑 API Keys

| Key | Source | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | For AI narration |
| `NASA_FIRMS_API_KEY` | [firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov/api/) | For wildfire data |
| `AISSTREAM_API_KEY` | [aisstream.io](https://aisstream.io) | For ship tracking (optional) |
| `OPENSKY_USERNAME/PASSWORD` | [opensky-network.org](https://opensky-network.org) | Better rate limits (optional) |

All keys are free. The app works without them (minus those specific layers).

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Toggle rotation |
| `L` | Toggle layers panel |
| `T` | Toggle timeline |
| `M` | Toggle sound |
| `R` | Reset camera |
| `F` | Fullscreen |
| `A` | Toggle auto-tour |
| `1–8` | Toggle layer N |
| `Esc` | Deselect / close |

## 🛰 Data Sources

- **Earthquakes** — USGS Earthquake Hazards Program
- **ISS** — wheretheiss.at
- **Flights** — OpenSky Network
- **Wildfires** — NASA FIRMS (MODIS)
- **Aurora** — NOAA Space Weather Prediction Center
- **Textures** — NASA Blue Marble, Black Marble
- **Submarine Cables** — TeleGeography

## 🛠️ Tech Stack

Next.js 14 · TypeScript · Three.js · React Three Fiber · custom GLSL · Tone.js · Anthropic Claude · Zustand · Tailwind CSS · Vercel Edge

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Import the repo to Vercel
2. Add environment variables
3. Deploy — done

## 📄 License

MIT — fork it, build on it, make something beautiful.

---

Made with care by [@kutluhangil](https://github.com/kutluhangil)
