# 🌍 OVERVIEW

> **The pulse of the planet, in real time.** GitHub'ın globe'u tek veri gösterir. OVERVIEW gezegenin canlı nabzını gösterir — depremler, ISS, uçuşlar, yangınlar, aurora — hepsi tek, nefes kesen bir Dünya üzerinde. Zamanı geri sar, veriyi duy, AI'dan ne olduğunu dinle.

```
version:   v1.0.0-blueprint
target:    Claude Code (VS Code)
stack:     Next.js 14 · Three.js · custom GLSL · WebSocket
deploy:    Vercel + Edge Functions
aesthetic: deep space dark · teal atmosphere (#2dd4bf)
build:     9 specialized agents
name:      "The Overview Effect" — astronotların Dünya'yı uzaydan
           gördüğünde yaşadığı bilişsel değişim
```

---

## 📌 TL;DR

Mevcut globe görselleştiriciler tek bir veri seti gösterir (sadece depremler, ya da sadece uçuşlar) ve çoğu globe.gl'in varsayılan görünümünü kullanır — düz, cansız.

**OVERVIEW** farklı:

- **Çok kaynaklı birleşik nabız:** Depremler, ISS, uçuş trafiği, orman yangınları, aurora, gemi trafiği, denizaltı kabloları — hepsi tek globe'da, katmanlanabilir
- **Custom Earth shader:** globe.gl değil. Atmospheric scattering, gerçek zamanlı gündüz/gece terminatörü, şehir ışıkları, fresnel rim glow, bulut katmanı
- **Time scrubbing:** Son 24 saatin depremlerini geri sar, gerçekleştiğini izle
- **Data sonification:** Her olay bir ses çıkarır — gezegen kendi verisini "söyler"
- **AI narration:** "3 dakika önce Japonya açıklarında 6.2 deprem oldu" — AI olayları anlatır
- **Cinematic auto-tour:** Kamera ilgi çekici olaylara otomatik uçar
- **Custom data upload:** Kendi CSV'ni (lat/lng) yükle → anında globe viz
- **Premium space aesthetic:** Yıldız alanı, derin uzay, teal atmosfer

Bu dosya Claude Code için yazıldı. **9 ajan halinde organize edildi.**

İsim alternatifleri: `OVERVIEW` (önerilen), `TERRA`, `PULSE`, `AETHER`, `PALE BLUE`.

---

## 📋 İÇİNDEKİLER

1. [Vizyon & Farklılaştırıcılar](#-vizyon--farklılaştırıcılar)
2. [Tasarım Felsefesi](#-tasarım-felsefesi)
3. [Görsel Sistem](#-görsel-sistem)
4. [Teknoloji Yığını](#-teknoloji-yığını)
5. [Veri Kaynakları](#-veri-kaynakları)
6. [Mimari Genel Bakış](#-mimari-genel-bakış)
7. [UI Layout](#-ui-layout)
8. [Klasör Yapısı](#-klasör-yapısı)
9. [Ajan Sistemi](#-ajan-sistemi)
10. [Performans Hedefleri](#-performans-hedefleri)
11. [Vercel Deploy](#-vercel-deploy)
12. [README Şablonu](#-readme-şablonu)

---

## 🎯 VİZYON & FARKLILAŞTIRICILAR

**Hedef:** İnsanların açıp dakikalarca izlediği, "wow" dediği, gezegenin canlı durumunu hissettiren bir deneyim. Hem teknik bir başarı hem görsel bir sanat eseri.

### Mevcut Çözümler vs OVERVIEW

| Özellik | GitHub Globe | globe.gl demos | Flightradar | **OVERVIEW** |
|---|---|---|---|---|
| Veri kaynağı sayısı | 1 (commits) | 1 | 1 (flights) | **8+ katmanlanabilir** |
| Custom Earth shader | ❌ | ❌ | ❌ | ✅ atmosfer + terminatör |
| Gündüz/gece terminatörü | ❌ | ❌ | ❌ | ✅ gerçek zamanlı |
| Time scrubbing / replay | ❌ | ❌ | ⚠️ | ✅ son 24h |
| Data sonification | ❌ | ❌ | ❌ | ✅ |
| AI narration | ❌ | ❌ | ❌ | ✅ |
| Cinematic auto-tour | ❌ | ❌ | ❌ | ✅ |
| Custom data upload | ❌ | ❌ | ❌ | ✅ CSV |
| Premium aesthetic | ⚠️ | ⚠️ | ❌ | ✅ deep space |

### Hedef Etki

- ✅ LinkedIn'de "the planet's pulse" demo'su viral olur
- ✅ Hacker News "Show HN" potansiyeli çok yüksek
- ✅ Görsel olarak ekran kaydı paylaşımları doğal olarak yayılır
- ✅ GitHub yıldızı çeker (open source + güzel demo)
- ✅ NASA texture'ları + gerçek API'ler ile "gerçek" hissi
- ✅ 3-4 haftalık solo dev çalışması ile bitirilebilir

---

## 🎨 TASARIM FELSEFESİ

**Deep Space Minimalism.** Dünya kahraman. UI uzayda asılı, neredeyse görünmez. Tek aksan: atmosferin teal parıltısı. Apollo görev kontrol estetiği ile Linear'ın temizliğinin buluşması.

### Prensipler

1. **The Earth is the hero.** Her şey ona hizmet eder. UI asla onunla yarışmaz.
2. **Darkness is the canvas.** Uzayın siyahı boşluk değil, derinlik.
3. **Data is light.** Olaylar ışık olarak belirir — noktalar parlar, arklar akar.
4. **Motion implies life.** Gezegen yavaşça döner, bulutlar kayar, olaylar nabız atar.
5. **Single accent, atmospheric.** Teal/cyan — atmosferin rengi. Başka renk yok (veri katmanları hariç).
6. **Silence then sound.** Varsayılan sessiz, ama açıldığında gezegen şarkı söyler.
7. **60fps is non-negotiable.** Globe takılırsa büyü bozulur.

### Mood Board

- NASA "Blue Marble" ve "Earthrise" fotoğrafları
- Apollo görev kontrol arayüzleri
- Interstellar filminin minimalist HUD'ları
- Linear app'in karanlık paneli
- Stripe'ın globe'u (ama daha sinematik)
- Kurzgesagt'ın renk ve derinlik hissi
- "The Overview Effect" belgeseli

---

## 🌌 GÖRSEL SİSTEM

### Renk Paleti

```css
/* Space backgrounds */
--space-void:    #000308;   /* en derin siyah, hafif mavi tint */
--space-deep:    #050810;   /* paneller */
--space-panel:   #0a0f1a;   /* nested panels */
--space-elevated:#101725;   /* hover, cards */

/* Borders */
--border-faint:  #131b2a;
--border-subtle: #1a2436;
--border-glow:   #2dd4bf;

/* Text */
--text-primary:    #e8eef5;
--text-secondary:  #94a3b8;
--text-muted:      #5b6b82;
--text-faint:      #374559;

/* Accent (atmospheric teal) */
--accent:          #2dd4bf;   /* teal — atmosfer rengi */
--accent-bright:   #5eead4;
--accent-dim:      #2dd4bf20;
--accent-glow:     #2dd4bf40;

/* Atmosphere (shader) */
--atmo-inner:      #4a9eff;   /* mavi iç parıltı */
--atmo-outer:      #2dd4bf;   /* teal dış glow */

/* Data layer colors (her katman kendi rengi) */
--data-quake:      #ff5a5f;   /* deprem - kırmızı, magnitude'a göre yoğunluk */
--data-iss:        #ffd93d;   /* ISS - sarı */
--data-flight:     #5eead4;   /* uçuş - teal */
--data-fire:       #ff7847;   /* yangın - turuncu */
--data-aurora:     #a78bfa;   /* aurora - mor-yeşil gradient */
--data-ship:       #60a5fa;   /* gemi - mavi */
--data-cable:      #34d399;   /* denizaltı kablosu - yeşil */
--data-volcano:    #f472b6;   /* volkan - pembe */

/* Status */
--live:    #34d399;   /* canlı veri */
--replay:  #fbbf24;   /* replay modu */
```

### Tipografi

```css
--font-display: "Space Grotesk", "Inter", sans-serif;  /* başlıklar, sayılar */
--font-mono:    "JetBrains Mono", monospace;            /* koordinatlar, veri */
--font-body:    "Inter", sans-serif;                    /* açıklamalar */

--text-xs:   11px;  /* meta, koordinatlar */
--text-sm:   12px;  /* panel içerik */
--text-base: 13px;  /* default */
--text-md:   15px;
--text-lg:   18px;  /* event başlığı */
--text-xl:   24px;  /* stats */
--text-2xl:  32px;  /* hero sayılar */
--text-mono-data: "JetBrains Mono"; /* tüm sayısal veriler */
```

### Earth Render Kalitesi (Kritik)

Bu projeyi diğerlerinden ayıran şey Earth'ün görsel kalitesi. **globe.gl'in varsayılanını KULLANMA.** Custom shader'lar:

1. **Day texture:** NASA Blue Marble (4K, optimize)
2. **Night texture:** NASA Black Marble (şehir ışıkları)
3. **Day/night blend:** Gerçek güneş pozisyonuna göre terminatör çizgisi
4. **Specular map:** Okyanus yansıması (gündüz tarafında güneş parıltısı)
5. **Normal/bump map:** Dağ kabartması
6. **Cloud layer:** Ayrı şeffaf sphere, yavaş bağımsız rotasyon
7. **Atmosphere shader:** Fresnel rim glow + atmospheric scattering (mavi-teal gradient)
8. **Star field:** Arka plan, Milky Way texture veya prosedürel
9. **Sun glow:** Güneş yönünden gelen lens flare hissi (opsiyonel)

### Animasyon

- **Globe idle rotation:** Çok yavaş (0.05 rad/s), opsiyonel durdurulabilir
- **Cloud rotation:** Globe'dan biraz farklı hız (parallax)
- **Event spawn:** Nokta belirince scale 0→1 spring + glow pulse
- **Arc draw:** Uçuş arkları progressive draw (0.6s)
- **Camera fly:** `cubic-bezier(0.4, 0, 0.2, 1)`, 1.2s
- **Layer toggle:** Olaylar fade in/out 300ms
- **Panel transitions:** 200ms ease-out

---

## 🛰️ VERİ KAYNAKLARI

Tümü ücretsiz public API'ler. Çoğu key gerektirmiyor.

| Katman | Kaynak | Endpoint | Key | Tip |
|---|---|---|---|---|
| **Depremler** | USGS | `earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` | ❌ | Polling (60s) / GeoJSON feed |
| **ISS** | wheretheiss.at | `api.wheretheiss.at/v1/satellites/25544` | ❌ | Polling (5s) |
| **Uçuşlar** | OpenSky Network | `opensky-network.org/api/states/all` | ⚠️ opsiyonel | Polling (10s, rate limited) |
| **Yangınlar** | NASA FIRMS | `firms.modaps.eosdis.nasa.gov/api/` | ✅ free | Polling (günlük) |
| **Aurora** | NOAA SWPC | `services.swpc.noaa.gov/json/ovation_aurora_latest.json` | ❌ | Polling (5dk) |
| **Gemiler** | AISStream | `aisstream.io` (websocket) | ✅ free | WebSocket (canlı) |
| **Uydular** | Celestrak | `celestrak.org/NORAD/elements/` (TLE) | ❌ | Static TLE + client propagation |
| **Denizaltı Kabloları** | TeleGeography | static GeoJSON | ❌ | Static |
| **Volkanlar** | Smithsonian GVP | weekly report | ❌ | Static/weekly |
| **Hava Durumu** | Open-Meteo | `api.open-meteo.com` | ❌ | Polling |

### Veri Stratejisi

- **Sunucu tarafı proxy:** API key gerektirenler (FIRMS, AIS) Edge Function üzerinden, key gizli
- **CORS handling:** Bazı API'ler CORS izni vermiyor → Next.js API route proxy
- **Rate limiting:** OpenSky agresif rate limit yapıyor → cache + 10s polling
- **Caching:** Vercel Edge cache (örn. depremler 60s, kablolar 1 gün)
- **Normalization:** Tüm kaynaklar ortak formata map edilir:
  ```ts
  interface GeoEvent {
    id: string;
    layer: LayerType;
    lat: number;
    lng: number;
    alt?: number;          // ISS, uçuşlar için yükseklik
    magnitude?: number;    // önem/boyut
    timestamp: number;
    label: string;
    meta: Record<string, any>;
  }
  ```

---

## 🏗️ MİMARİ GENEL BAKIŞ

```
┌──────────────────────────────────────────────────────────────┐
│                         TOP BAR                              │
│  OVERVIEW    [Earthquakes ▾]  layers: 3        🔊 ⚙ Share  │
├───────────┬──────────────────────────────────────────────────┤
│           │                                                  │
│  LAYERS   │                                                  │
│  ☑ Quakes │              ╭────────────╮                      │
│  ☑ ISS    │            ╱   3D EARTH    ╲                    │
│  ☐ Flights│           │  · custom GLSL  │                    │
│  ☐ Fires  │           │  · atmosphere   │                    │
│  ☐ Aurora │            ╲  · terminator ╱                    │
│  ☐ Ships  │              ╰────────────╯       ┌──────────┐  │
│           │                                    │ M6.2     │  │
│  STATS    │                                    │ Japan    │  │
│  142 today│                                    │ 12m ago  │  │
│           │                                    └──────────┘  │
├───────────┴──────────────────────────────────────────────────┤
│  ◀━━━━━━━━●━━━━━━━━━━━━▶  -24h ········· now    ⏯ LIVE     │
└──────────────────────────────────────────────────────────────┘
   AI narration ticker: "6.2 earthquake near Japan, 12 minutes ago..."
```

### Render Katmanları (z-order)

```
1. Star field background (skybox)
2. Earth sphere (day/night/specular shader)
3. Cloud sphere (transparent, slow rotation)
4. Atmosphere sphere (fresnel glow, backside)
5. Data layer points (instanced)
6. Data layer arcs (flights, cables)
7. Data layer rings (event ripples)
8. ISS / satellite models
9. UI overlay (HTML, not WebGL)
```

### Veri Akışı

```
API/WebSocket → Edge proxy → normalize → GeoEvent[]
  → Zustand store (layer-keyed)
  → R3F components subscribe
  → lat/lng → Vector3 conversion
  → instanced rendering (binlerce nokta tek draw call)
  → time filter (replay modu): only events in [scrubTime - window, scrubTime]
```

---

## 🖼️ UI LAYOUT

### Top Bar (52px)

```
[Logo OVERVIEW]   [Active Layer ▾]  [layer count badge]    [🔊 sound] [⚙ settings] [Share]
```

### Left Panel: Layers (collapsible, 260px)

- **Layer toggles** — her katman: checkbox, renk indicator, ikon, canlı event sayısı
- **Layer settings** — expand: opacity, point size, color, filter (örn. "min magnitude: 4.0")
- **Stats card** — aktif katmanın istatistikleri (bugünkü toplam, en büyük, vb.)
- **Legend** — renk skalası (örn. magnitude → renk)

### Center: Earth Canvas (full)

- Three.js canvas, full viewport
- OrbitControls (drag rotate, scroll zoom, sınırlı pan)
- Hover event → highlight + tooltip
- Click event → detail card + camera fly-to

### Floating: Event Detail Card (sağ, seçilince)

```
┌─────────────────────────┐
│ ● EARTHQUAKE            │
│ Magnitude 6.2           │
│ 38.2°N, 142.4°E         │
│ 24km depth              │
│ near Sendai, Japan      │
│ 12 minutes ago          │
│ [USGS link →]           │
└─────────────────────────┘
```

### Bottom: Timeline Scrubber (64px)

```
◀━━━━━━━━●━━━━━━━━━━━━━━▶
-24h        now
[⏯ LIVE]  [speed: 1x ▾]  [▶ auto-tour]
```

- Drag handle → zaman geri sar
- Olaylar timeline üzerinde tick olarak (yoğunluk görünür)
- "LIVE" butonu → şimdiye dön, canlı moda geç
- Replay speed: 1x / 5x / 20x / 60x
- Auto-tour button → cinematic mode

### AI Narration Ticker (bottom, scrubber üstü)

```
🛰 "A magnitude 6.2 earthquake just occurred near Japan. 
    The ISS is currently over the Pacific Ocean..."
```

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Play/pause rotation |
| `L` | Toggle layers panel |
| `T` | Toggle timeline |
| `M` | Toggle sound |
| `R` | Reset camera |
| `F` | Fullscreen |
| `A` | Toggle auto-tour |
| `1-8` | Toggle layer N |
| `Esc` | Deselect / close card |

---

## 📁 KLASÖR YAPISI

```
overview/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                       # ana globe sayfası
│   ├── embed/page.tsx                 # embeddable widget
│   ├── globals.css
│   └── api/
│       ├── earthquakes/route.ts       # USGS proxy + cache
│       ├── iss/route.ts               # ISS position
│       ├── flights/route.ts           # OpenSky proxy
│       ├── fires/route.ts             # NASA FIRMS proxy (key gizli)
│       ├── aurora/route.ts            # NOAA proxy
│       ├── ships/route.ts             # AIS websocket relay
│       ├── narrate/route.ts           # AI narration (Edge)
│       └── og/route.tsx               # dynamic OG image
│
├── components/
│   ├── globe/
│   │   ├── GlobeCanvas.tsx            # R3F canvas root
│   │   ├── Earth.tsx                  # earth sphere + shaders
│   │   ├── Clouds.tsx                 # cloud layer
│   │   ├── Atmosphere.tsx             # atmosphere glow
│   │   ├── StarField.tsx              # background stars
│   │   ├── Sun.tsx                    # sun position + light
│   │   ├── CameraRig.tsx              # orbit + fly-to
│   │   └── shaders/
│   │       ├── earth.vert.glsl
│   │       ├── earth.frag.glsl        # day/night/specular
│   │       ├── atmosphere.vert.glsl
│   │       ├── atmosphere.frag.glsl   # fresnel scattering
│   │       └── glow.frag.glsl
│   │
│   ├── layers/
│   │   ├── PointLayer.tsx             # instanced points (quakes, fires)
│   │   ├── ArcLayer.tsx               # arcs (flights, cables)
│   │   ├── RingLayer.tsx              # ripple rings (event spawn)
│   │   ├── SatelliteLayer.tsx         # ISS, satellites
│   │   ├── AuroraLayer.tsx            # aurora oval overlay
│   │   └── HeatmapLayer.tsx           # density mode
│   │
│   ├── ui/
│   │   ├── TopBar.tsx
│   │   ├── LayersPanel.tsx
│   │   ├── LayerToggle.tsx
│   │   ├── StatsCard.tsx
│   │   ├── Legend.tsx
│   │   ├── EventDetailCard.tsx
│   │   ├── TimelineScrubber.tsx
│   │   ├── NarrationTicker.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── ShareModal.tsx
│   │   └── primitives/
│   │       ├── Button.tsx
│   │       ├── Slider.tsx
│   │       ├── Toggle.tsx
│   │       └── Tooltip.tsx
│   │
│   └── upload/
│       ├── DataUploadModal.tsx        # CSV upload
│       └── CSVParser.tsx
│
├── lib/
│   ├── geo/
│   │   ├── coordinates.ts             # lat/lng → Vector3
│   │   ├── arc.ts                     # great circle arc points
│   │   ├── sun-position.ts            # solar terminator calc
│   │   └── satellite.ts              # TLE propagation (satellite.js)
│   │
│   ├── data/
│   │   ├── sources/
│   │   │   ├── earthquakes.ts
│   │   │   ├── iss.ts
│   │   │   ├── flights.ts
│   │   │   ├── fires.ts
│   │   │   ├── aurora.ts
│   │   │   ├── ships.ts
│   │   │   └── cables.ts
│   │   ├── normalize.ts               # → GeoEvent
│   │   ├── poller.ts                  # polling manager
│   │   ├── websocket.ts               # WS manager (ships)
│   │   └── history-buffer.ts          # 24h event buffer
│   │
│   ├── audio/
│   │   ├── sonify.ts                  # event → sound
│   │   ├── synth.ts                   # Tone.js synth
│   │   └── ambient.ts                 # space ambient drone
│   │
│   ├── ai/
│   │   └── narrate.ts                 # AI narration client
│   │
│   ├── tour/
│   │   └── auto-tour.ts               # cinematic camera tour
│   │
│   └── utils/
│       ├── cn.ts
│       ├── format.ts                  # time-ago, coords format
│       └── csv.ts                     # CSV parsing
│
├── content/
│   ├── cables.geojson                 # denizaltı kabloları (static)
│   └── countries.geojson              # ülke sınırları (opsiyonel)
│
├── store/
│   ├── useGlobeStore.ts               # camera, rotation, mode
│   ├── useLayersStore.ts              # active layers, settings
│   ├── useDataStore.ts                # events by layer
│   ├── useTimeStore.ts                # scrub time, replay
│   └── useUIStore.ts                  # panels, modals
│
├── public/
│   ├── textures/
│   │   ├── earth-day-4k.jpg           # NASA Blue Marble (optimize)
│   │   ├── earth-night-4k.jpg         # NASA Black Marble
│   │   ├── earth-specular-2k.jpg
│   │   ├── earth-normal-2k.jpg
│   │   ├── clouds-2k.png
│   │   └── stars-milkyway.jpg
│   ├── models/
│   │   └── iss.glb                    # ISS 3D model (low-poly)
│   ├── sounds/
│   │   └── ambient-space.mp3
│   ├── og.png
│   └── favicon.svg
│
├── tests/
│   └── geo/
│       ├── coordinates.test.ts
│       └── sun-position.test.ts
│
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── vercel.json
├── package.json
├── README.md
└── .env.local.example
```

---

## 🤖 AJAN SİSTEMİ

**9 specialized agent.** Sırayla çalışacak. Her ajan kendi alanına sahip.

### Ajanlar Genel Görünüm

```
[1] ARCHITECT       →  Proje iskeleti, store'lar, layout
[2] AESTHETICIAN    →  Design system, UI panels, space aesthetic
[3] EARTH SMITH     →  3D Earth, custom shaders, atmosphere, stars
[4] CARTOGRAPHER    →  Coord conversion, point/arc/ring rendering, camera
[5] DATA PIPELINE   →  API integrations, WebSocket, normalization, polling
[6] LAYER CONDUCTOR →  Layer system, toggles, filters, legends, detail cards
[7] TIME LORD       →  Timeline scrubber, replay, 24h history buffer
[8] THE COMPOSER    →  Sonification + AI narration + cinematic auto-tour
[9] POLISHER        →  Custom upload, embed, Vercel deploy, SEO, README
```

### Bağımlılık Grafiği

```
[1] ──┬──> [2]
      ├──> [3] ──> [4] ──┬──> [6]
      │                  └──> [7]
      ├──> [5] ──────────┘
      │         └──> [8]
      └──> [9] (son adım)
```

---

### 🟢 AJAN 1 — THE ARCHITECT

**Rol:** Proje temeli. Layout sistemi, store iskeletleri, R3F canvas mount.

**Sahip Olduğu Dosyalar:**
- `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `vercel.json`
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- `store/useGlobeStore.ts`, `useLayersStore.ts`, `useDataStore.ts`, `useTimeStore.ts`, `useUIStore.ts` (iskelet)
- `lib/utils/cn.ts`, `format.ts`
- `.env.local.example`, `.gitignore`

**Görevler:**

1. Next.js 14 App Router + TypeScript strict kur
2. Tailwind + CSS variables (space palette)
3. Klasör yapısını eksiksiz oluştur
4. Fontlar: Space Grotesk + JetBrains Mono + Inter (`next/font`)
5. **R3F Canvas mount** (boş, sadece star field placeholder):
   ```tsx
   <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
     <color attach="background" args={['#000308']} />
     {/* agents fill this */}
   </Canvas>
   ```
6. **Layout iskeleti:**
   - Full viewport canvas (absolute, z-0)
   - UI overlay (absolute, z-10): top bar, left panel slot, bottom slot
   - Pointer events: canvas alır, paneller selectif
7. **Zustand store'lar:**
   ```ts
   // useDataStore
   interface DataState {
     events: Record<LayerType, GeoEvent[]>;
     addEvents: (layer: LayerType, events: GeoEvent[]) => void;
     // ...
   }
   // useTimeStore
   interface TimeState {
     mode: 'live' | 'replay';
     scrubTime: number;
     speed: number;
     // ...
   }
   ```
8. ESLint + Prettier + Husky

**Acceptance Criteria:**
- `pnpm dev` çalışıyor, siyah ekranda boş canvas görünüyor
- `pnpm build` başarılı, 0 type error
- UI overlay layout doğru (panel slot'ları boş ama yerinde)
- Zustand store'lar devtools'ta

---

### 🎨 AJAN 2 — THE AESTHETICIAN

**Rol:** Tüm UI'ı inşa et. Design system, paneller, top bar, kartlar.

**Sahip Olduğu Dosyalar:**
- `app/globals.css` (tüm CSS variables)
- `components/ui/primitives/*.tsx`
- `components/ui/TopBar.tsx`
- `components/ui/LayersPanel.tsx`, `LayerToggle.tsx`, `StatsCard.tsx`, `Legend.tsx`
- `components/ui/EventDetailCard.tsx`
- `components/ui/SettingsModal.tsx`, `ShareModal.tsx`
- `components/ui/NarrationTicker.tsx`

**Görevler:**

1. CSS variables (space palette, typography) → `globals.css`
2. Tailwind config'e renkleri bağla
3. **Primitives:**
   - `Button` (primary teal, ghost, icon)
   - `Toggle` (layer için, renkli)
   - `Slider` (opacity, filters)
   - `Tooltip`
4. **Top Bar:**
   - Logo (OVERVIEW + minimalist globe ikon)
   - Active layer dropdown
   - Layer count badge
   - Sound toggle, settings, share buttons
   - Glassmorphism: `backdrop-blur`, subtle border-bottom
5. **Layers Panel:**
   - Slide-in from left, 260px
   - Layer list: her biri toggle + renk dot + ikon + event count
   - Expand: opacity slider, filter input, point size
   - Stats card (placeholder data)
   - Legend (renk skalası gradient)
6. **Event Detail Card:**
   - Floating, sağ tarafta
   - Layer renk indicator + tip
   - Magnitude / değer (büyük, mono font)
   - Koordinatlar (mono)
   - Konum adı, time-ago
   - External link button
   - Close button + Esc
   - Spring entrance animation
7. **Narration Ticker:**
   - Bottom, scrubber üstü
   - Scrolling text veya fade transitions
   - 🛰 ikon + AI metni
8. **Modals:**
   - Settings (rotation speed, quality, sound volume, theme)
   - Share (link copy, Twitter, LinkedIn, embed code)
9. **Tüm panellerde** glassmorphism + subtle glow, deep space hissi
10. Empty states + loading states (her panel için)

**Acceptance Criteria:**
- UI deep space estetiğinde tutarlı
- Tüm interactive elementlerde hover/focus/active
- Mobile responsive (panel'ler drawer olur)
- Glassmorphism doğru (backdrop-blur çalışıyor)
- Accessibility 100

---

### 🌍 AJAN 3 — THE EARTH SMITH

**Rol:** Nefes kesen 3D Dünya. Custom shader'lar burada. **Bu ajan projenin görsel kalitesini belirler.**

**Sahip Olduğu Dosyalar:**
- `components/globe/GlobeCanvas.tsx`
- `components/globe/Earth.tsx`
- `components/globe/Clouds.tsx`
- `components/globe/Atmosphere.tsx`
- `components/globe/StarField.tsx`
- `components/globe/Sun.tsx`
- `components/globe/shaders/*.glsl`
- `lib/geo/sun-position.ts`
- `public/textures/*` (NASA texture'ları indir + optimize)

**Görevler:**

1. **Textures hazırla:**
   - NASA Blue Marble (day) → 4K JPG, optimize
   - NASA Black Marble (night) → 4K JPG
   - Specular map (okyanus) → 2K
   - Normal/bump map → 2K
   - Cloud map → 2K PNG (alpha)
   - Milky Way stars → equirectangular
   - Hepsini `public/textures/`'a, compress (mozjpeg/sharp)

2. **Earth Sphere + Custom Shader:**
   - SphereGeometry (radius 1, 128 segments)
   - `earth.frag.glsl`:
     ```glsl
     // Day/night blend based on sun direction
     float intensity = dot(normalize(vNormal), sunDirection);
     float dayAmount = smoothstep(-0.1, 0.1, intensity);
     vec3 dayColor = texture2D(dayTexture, vUv).rgb;
     vec3 nightColor = texture2D(nightTexture, vUv).rgb * 2.0; // city lights boost
     vec3 color = mix(nightColor, dayColor, dayAmount);
     // Specular highlight on oceans (day side)
     float spec = texture2D(specularMap, vUv).r;
     // ... fresnel rim
     ```
   - Terminatör (gündüz/gece sınırı) yumuşak geçiş
   - Şehir ışıkları gece tarafında parlıyor

3. **Sun Position:**
   - `sun-position.ts`: gerçek tarihe göre güneşin subsolar noktası
   - Solar declination + hour angle hesabı
   - DirectionalLight + shader uniform olarak gönder
   - Gerçek zamanlı (gerçek saatte gerçek terminatör)

4. **Cloud Layer:**
   - Earth'ten biraz büyük sphere (radius 1.005)
   - Transparent, cloud texture alpha
   - Bağımsız yavaş rotasyon (parallax)
   - Gece tarafında karanlık

5. **Atmosphere:**
   - Earth'ten büyük sphere (radius 1.15)
   - `BackSide` render
   - `atmosphere.frag.glsl`: Fresnel-based glow
     ```glsl
     float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);
     vec3 atmoColor = mix(atmoInner, atmoOuter, fresnel);
     gl_FragColor = vec4(atmoColor, fresnel);
     ```
   - Mavi-teal gradient, güneş yönünde daha parlak

6. **Star Field:**
   - Büyük sphere (radius 50), `BackSide`
   - Milky Way texture VEYA prosedürel point stars (5000 nokta)
   - Çok hafif twinkle animasyonu

7. **GlobeCanvas:**
   - Tüm katmanları compose et
   - ACES tone mapping
   - Subtle bloom (postprocessing) — atmosfer ve şehir ışıkları için
   - devicePixelRatio capped 2

**Acceptance Criteria:**
- Earth fotorealistik görünüyor (NASA seviyesi)
- Gündüz/gece terminatörü gerçek saate göre doğru konumda
- Şehir ışıkları gece tarafında parlıyor
- Atmosfer rim glow nefes kesici
- Bulutlar bağımsız dönüyor
- Star field arka planda
- 60fps (orta seviye GPU'da)

---

### 🧭 AJAN 4 — THE CARTOGRAPHER

**Rol:** Coğrafi veriyi 3D'ye çevir. Nokta, ark, ring rendering. Kamera kontrolü.

**Sahip Olduğu Dosyalar:**
- `lib/geo/coordinates.ts`
- `lib/geo/arc.ts`
- `lib/geo/satellite.ts`
- `components/globe/CameraRig.tsx`
- `components/layers/PointLayer.tsx`
- `components/layers/ArcLayer.tsx`
- `components/layers/RingLayer.tsx`
- `components/layers/SatelliteLayer.tsx`

**Görevler:**

1. **Coordinate Conversion** (`coordinates.ts`):
   ```ts
   function latLngToVector3(lat: number, lng: number, radius = 1, alt = 0): Vector3 {
     const phi = (90 - lat) * (Math.PI / 180);
     const theta = (lng + 180) * (Math.PI / 180);
     const r = radius + alt;
     return new Vector3(
       -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
     );
   }
   ```
   - Tersine çevirme de (Vector3 → lat/lng)

2. **Point Layer (Instanced):**
   - InstancedMesh ile binlerce nokta tek draw call
   - Her nokta: pozisyon, renk, scale (magnitude'a göre)
   - Glow shader (additive blending)
   - Spawn animation: scale 0→1 + opacity pulse
   - Hover: raycaster ile detect, highlight
   - Click: event seç, detail card aç

3. **Arc Layer (Great Circle):**
   - `arc.ts`: iki nokta arası great circle arc points
   - Arc yüksekliği mesafeye göre (uzun mesafe = yüksek ark)
   - TubeGeometry veya Line
   - Progressive draw animation (uçuş rotası çiziliyormuş gibi)
   - Gradient renk (başlangıç → bitiş)
   - Kullanım: uçuşlar, denizaltı kabloları

4. **Ring Layer (Ripples):**
   - Yeni event spawn olunca genişleyen halka
   - RingGeometry, scale animasyonu + fade out
   - Deprem dalgası hissi
   - 2-3 saniye sonra kaybolur

5. **Satellite Layer:**
   - ISS: GLB model (low-poly) + glow
   - `satellite.js` ile TLE propagation (Celestrak'tan)
   - Orbit path çizgisi (geçmiş + gelecek yörünge)
   - Diğer uydular: nokta olarak

6. **Camera Rig:**
   - OrbitControls (drag rotate, scroll zoom, damping)
   - Zoom limits (çok yakın/uzak engelle)
   - **Fly-to:** bir event'e tıklayınca kamera oraya yumuşak uçar
     - Target = event pozisyonu
     - `cubic-bezier` easing, 1.2s
     - Quaternion slerp
   - **Reset:** R tuşu ile default pozisyona

**Acceptance Criteria:**
- lat/lng → 3D dönüşüm doğru (test: bilinen şehirler doğru yerde)
- 5000+ nokta 60fps render ediliyor (instanced)
- Arc'lar great circle olarak doğru çiziliyor
- Event'e tıklayınca kamera smooth uçuyor
- ISS gerçek pozisyonunda, yörüngede hareket ediyor
- Hover/click raycasting doğru çalışıyor

---

### 📡 AJAN 5 — THE DATA PIPELINE

**Rol:** Tüm veri kaynaklarını bağla. API proxy, WebSocket, normalization, polling.

**Sahip Olduğu Dosyalar:**
- `app/api/earthquakes/route.ts`, `iss/route.ts`, `flights/route.ts`, `fires/route.ts`, `aurora/route.ts`, `ships/route.ts`
- `lib/data/sources/*.ts`
- `lib/data/normalize.ts`
- `lib/data/poller.ts`
- `lib/data/websocket.ts`
- `content/cables.geojson`
- `.env.local.example` (API keys)

**Görevler:**

1. **API Proxy Routes** (CORS + key gizleme):
   - `/api/earthquakes` → USGS proxy, edge cache 60s
   - `/api/iss` → wheretheiss.at, cache 5s
   - `/api/flights` → OpenSky, cache 10s, rate limit handling
   - `/api/fires` → NASA FIRMS (key gizli), cache 1h
   - `/api/aurora` → NOAA, cache 5m
   - Her route: error handling, fallback, timeout

2. **Source Adapters** (`sources/*.ts`):
   - Her kaynak için fetch + parse fonksiyonu
   - `fetchEarthquakes(): Promise<RawQuake[]>`
   - Her biri kendi formatını döner

3. **Normalization** (`normalize.ts`):
   - Her kaynak → ortak `GeoEvent` formatı
   ```ts
   function normalizeQuake(raw: RawQuake): GeoEvent {
     return {
       id: raw.id,
       layer: 'earthquake',
       lat: raw.geometry.coordinates[1],
       lng: raw.geometry.coordinates[0],
       magnitude: raw.properties.mag,
       timestamp: raw.properties.time,
       label: raw.properties.place,
       meta: { depth: raw.geometry.coordinates[2], url: raw.properties.url },
     };
   }
   ```

4. **Polling Manager** (`poller.ts`):
   - Her aktif katman için ayrı polling interval
   - Sadece aktif (toggle açık) katmanlar polling yapar
   - Tab gizliyse polling durur (Page Visibility)
   - Exponential backoff (API hatasında)
   - Yeni veri → `useDataStore.addEvents()`

5. **WebSocket Manager** (`websocket.ts`):
   - AIS ships için (canlı stream)
   - Reconnection logic
   - Mesaj throttling (gemi pozisyonları çok hızlı gelir)
   - Sadece görünür viewport'taki gemiler (opsiyonel optimization)

6. **Static Data:**
   - `cables.geojson` — denizaltı kabloları (TeleGeography'den, repo'da static)
   - Yükleme: client-side fetch

7. **Cable/Ship/Aurora veri yapısı:**
   - Aurora: NOAA'dan grid → globe üzerinde overlay
   - Cables: GeoJSON LineString → arc layer

**Acceptance Criteria:**
- Depremler USGS'ten geliyor, 60s'de güncelleniyor
- ISS pozisyonu canlı (5s güncelleme)
- Uçuşlar OpenSky'dan geliyor (rate limit'e takılmıyor)
- Tüm kaynaklar `GeoEvent` formatına normalize ediliyor
- API key'ler client'a sızmıyor (Edge proxy)
- Tab gizliyken polling duruyor

---

### 🎛️ AJAN 6 — THE LAYER CONDUCTOR

**Rol:** Katman sistemi. Toggle, filter, layering, legend, detail card entegrasyonu.

**Sahip Olduğu Dosyalar:**
- `store/useLayersStore.ts` (tam implementasyon)
- `lib/data/sources/cables.ts`, `aurora.ts`
- `components/layers/AuroraLayer.tsx`, `HeatmapLayer.tsx`
- `components/ui/LayersPanel.tsx` (logic bağlama)
- `components/ui/EventDetailCard.tsx` (logic bağlama)
- `components/ui/Legend.tsx` (logic bağlama)
- `components/ui/StatsCard.tsx` (logic bağlama)

**Görevler:**

1. **Layer System:**
   ```ts
   interface LayerConfig {
     type: LayerType;
     name: string;
     icon: LucideIcon;
     color: string;
     enabled: boolean;
     opacity: number;
     pointSize: number;
     filter?: { field: string; min?: number; max?: number };
     renderType: 'point' | 'arc' | 'ring' | 'satellite' | 'overlay';
   }
   ```
   - 8 katman tanımı
   - Toggle on/off → poller başlat/durdur
   - Çoklu katman aynı anda aktif olabilir

2. **Layer Toggle Logic:**
   - Toggle açılınca: poller başlat, layer render et
   - Kapanınca: events fade out, poller durdur
   - State persiste (localStorage)

3. **Filters:**
   - Deprem: min magnitude slider (örn. 4.0+)
   - Uçuş: min altitude
   - Filtre değişince render güncellenir (client-side filter)

4. **Aurora Layer:**
   - NOAA aurora oval verisi → globe kuzey/güney kutup overlay
   - Yeşil-mor gradient, transparent, animasyonlu
   - Shader-based glow

5. **Heatmap Mode:**
   - Toggle: nokta → yoğunluk heatmap
   - Deprem yoğunluğu, uçuş yoğunluğu
   - Shader-based density

6. **Event Detail Card Integration:**
   - Click event → seç → card aç
   - Layer'a göre içerik (deprem: magnitude/depth, uçuş: callsign/altitude/speed)
   - External link (USGS, FlightAware vb.)

7. **Legend:**
   - Aktif katmanın renk skalası
   - Deprem: magnitude → renk gradient
   - Dynamic (aktif katmana göre)

8. **Stats Card:**
   - Aktif katman istatistikleri
   - Deprem: bugünkü toplam, en büyük, son 1 saat
   - ISS: hız, yükseklik, şu an üzerinde olduğu bölge
   - Canlı güncelleme

**Acceptance Criteria:**
- 8 katman toggle edilebiliyor, çoklu aktif olabiliyor
- Magnitude filter çalışıyor (4.0+ seçince küçükler gizleniyor)
- Aurora overlay kutuplarda görünüyor
- Heatmap mode çalışıyor
- Event click → doğru detail card
- Legend aktif katmana göre değişiyor
- Stats canlı güncelleniyor

---

### ⏳ AJAN 7 — THE TIME LORD

**Rol:** Zaman kontrolü. Timeline scrubber, replay, 24 saatlik history buffer.

**Sahip Olduğu Dosyalar:**
- `store/useTimeStore.ts` (tam implementasyon)
- `lib/data/history-buffer.ts`
- `components/ui/TimelineScrubber.tsx` (logic bağlama)

**Görevler:**

1. **History Buffer:**
   - Son 24 saatin tüm event'lerini tut (memory'de, layer-keyed)
   - USGS son 24h feed'i ilk yüklemede çek (`all_day.geojson`)
   - Yeni event'ler buffer'a eklenir, 24h öncesi temizlenir
   - Timestamp'e göre sıralı

2. **Time Modes:**
   - **LIVE:** scrubTime = now, canlı veri akar, yeni event'ler belirir
   - **REPLAY:** scrubTime sabit/hareket eden, sadece o ana kadarki event'ler görünür

3. **Timeline Scrubber:**
   - Range: now-24h → now
   - Drag handle → scrubTime değişir
   - Olaylar timeline üzerinde tick (yoğunluk görünür — çok deprem olan saatler yoğun)
   - Scrub → globe'da sadece [scrubTime - window, scrubTime] event'leri render
   - Window: ayarlanabilir (örn. son 1 saat görünür)

4. **Replay Playback:**
   - Play button → scrubTime ilerler
   - Speed: 1x / 5x / 20x / 60x
   - Event'ler "gerçekleştiği anda" spawn animation ile belirir
   - Deprem replay: dalgalar tekrar tekrar yayılır — büyüleyici
   - LIVE'a dön butonu → şimdiye atla

5. **Time Filter Integration:**
   - Layer render'ları `useTimeStore.scrubTime`'a subscribe
   - Replay modunda gelecekteki event'ler gizli
   - Smooth transition (event'ler aniden kaybolmaz)

6. **Visual Feedback:**
   - LIVE modu: yeşil "● LIVE" indicator
   - REPLAY modu: sarı "⏸ REPLAY -3h 24m" indicator
   - Timeline'da current position glow

**Acceptance Criteria:**
- 24h deprem geçmişi yükleniyor
- Scrubber ile zamanı geri sarınca globe geçmişi gösteriyor
- Replay play → event'ler gerçekleştiği anda beliriyor
- Speed kontrolü çalışıyor (60x'te 24h ~ 24 dakikada oynar)
- LIVE'a dönüş anında
- Timeline tick'leri yoğunluğu gösteriyor

---

### 🎼 AJAN 8 — THE COMPOSER

**Rol:** Deneyimi sanata çevir. Data sonification + AI narration + cinematic auto-tour. **Differentiator katmanı.**

**Sahip Olduğu Dosyalar:**
- `lib/audio/sonify.ts`, `synth.ts`, `ambient.ts`
- `lib/ai/narrate.ts`
- `lib/tour/auto-tour.ts`
- `app/api/narrate/route.ts`
- `components/ui/NarrationTicker.tsx` (logic bağlama)
- `public/sounds/ambient-space.mp3`

**Görevler:**

1. **Data Sonification** (Tone.js):
   - Her event tipi → bir ses karakteri:
     - **Deprem:** düşük frekans bass thump, magnitude → pitch/volume
     - **ISS geçişi:** yumuşak bint
     - **Uçuş kalkış/iniş:** kısa whoosh
     - **Yangın:** sıcak crackle
     - **Aurora:** ethereal pad
   - Mekansal: olayın globe pozisyonuna göre stereo pan
   - Throttle: çok event olunca ses spam olmasın (max N/s)
   - Master volume + per-layer mute

2. **Ambient Drone:**
   - Arka planda yumuşak space ambient (drone)
   - Loop, çok düşük volume
   - Toggle ile aç/kapa

3. **AI Narration:**
   - `/api/narrate` Edge Function (Anthropic Claude Haiku)
   - Her ~30s veya önemli event olunca tetiklenir
   - Context: son event'ler (en büyük deprem, ISS konumu, aktif yangın sayısı)
   - System prompt:
     ```
     You are the calm, knowledgeable narrator of OVERVIEW, a real-time 
     globe of the planet's activity. Given recent events, write ONE short 
     sentence (max 20 words) describing what's happening right now. 
     Tone: like a documentary narrator. No markdown. Present tense.
     ```
   - Örnek çıktı: "A magnitude 5.8 earthquake just struck off the coast of Chile, while the ISS passes over the Indian Ocean."
   - Ticker'da typing effect ile görünür

4. **Cinematic Auto-Tour:**
   - Toggle/A tuşu → otomatik mod
   - Kamera ilgi çekici olaylara sırayla uçar:
     - En son büyük deprem
     - ISS'in şu anki pozisyonu
     - En aktif yangın bölgesi
   - Her durakta 4-5s, smooth fly
   - Auto-tour sırasında detail card otomatik gösterilir
   - AI narration eşlik eder
   - "Ekran koruyucu" / demo modu — LinkedIn ekran kaydı için mükemmel

5. **Sound Settings:**
   - Master volume
   - Sonification on/off
   - Ambient on/off
   - Per-layer sound toggle

**Acceptance Criteria:**
- Deprem olunca bass thump duyuluyor (magnitude'a göre)
- Sesler mekansal (sol/sağ pan)
- AI narration anlamlı, güncel olayları doğru anlatıyor
- Auto-tour kamerayı olaylara uçuruyor, sinematik
- Auto-tour + narration + sound birlikte = "wow" demo
- Tüm sesler toggle edilebiliyor

---

### ✨ AJAN 9 — THE POLISHER

**Rol:** Son rötuş. Custom data upload, embed, Vercel deploy, SEO, README.

**Sahip Olduğu Dosyalar:**
- `components/upload/DataUploadModal.tsx`, `CSVParser.tsx`
- `lib/utils/csv.ts`
- `app/embed/page.tsx`
- `app/api/og/route.tsx`
- `vercel.json`, `next.config.js` (production)
- `app/layout.tsx` (metadata)
- `app/sitemap.ts`, `app/robots.ts`
- `README.md`, `LICENSE`
- `.github/workflows/ci.yml`

**Görevler:**

1. **Custom Data Upload:**
   - Modal: CSV drag-and-drop
   - Beklenen format: `lat, lng, label, value` (esnek column mapping)
   - Parse (Papaparse) → GeoEvent[]
   - "Custom" layer olarak globe'a ekle
   - Kullanıcı kendi verisini görselleştirebilir (örn. müşteri lokasyonları, seyahat geçmişi)
   - Hata handling: geçersiz koordinat, eksik kolon

2. **Embeddable Widget** (`/embed`):
   - URL params ile config: `?layer=earthquakes&autorotate=true`
   - Sadece globe, UI minimal
   - `<iframe>` embed kodu (Share modal'da)
   - Blog/portfolyoya gömülebilir

3. **Dynamic OG Image:**
   - `/api/og` → globe görünümü + "OVERVIEW — The pulse of the planet"
   - 1200x630
   - Edge cache

4. **SEO:**
   - Title: "OVERVIEW — Real-time Globe of Planet Earth"
   - Description: "Watch the planet's pulse in real time. Earthquakes, the ISS, flights, wildfires, and aurora — on a beautiful 3D Earth."
   - JSON-LD WebApplication
   - Twitter card, OG tags

5. **Performance:**
   - Texture lazy load + progressive (düşük res → yüksek res)
   - Three.js dynamic import
   - Tone.js dynamic import (sadece sound açılınca)
   - KTX2/Basis texture compression (opsiyonel, ileri seviye)
   - Geometry instancing kontrol
   - Hidden tab → render pause

6. **Vercel Config:**
   ```json
   {
     "framework": "nextjs",
     "regions": ["fra1"],
     "functions": {
       "app/api/narrate/route.ts": { "runtime": "edge", "maxDuration": 15 }
     }
   }
   ```

7. **Environment Variables:**
   ```
   ANTHROPIC_API_KEY=
   NASA_FIRMS_API_KEY=
   AISSTREAM_API_KEY=        (opsiyonel)
   OPENSKY_USERNAME=         (opsiyonel, rate limit için)
   OPENSKY_PASSWORD=
   NEXT_PUBLIC_SITE_URL=
   ```

8. **README** (LinkedIn-ready):
   - Banner GIF (auto-tour ekran kaydı)
   - Features
   - Data sources credit
   - Tech stack badges
   - Quick start
   - Self-host guide
   - License (MIT)

9. **Launch Checklist:**
   - [ ] Tüm katmanlar canlı veri çekiyor
   - [ ] Custom domain SSL
   - [ ] Env vars Vercel'de
   - [ ] OG preview test
   - [ ] AI narration production'da çalışıyor
   - [ ] Mobile responsive
   - [ ] Cross-browser (WebGL2 support check)
   - [ ] Lighthouse 90+ (landing)
   - [ ] GitHub public
   - [ ] LinkedIn post (auto-tour demo video)
   - [ ] HN Show HN draft

**Acceptance Criteria:**
- CSV upload → custom layer globe'da görünüyor
- Embed widget iframe'de çalışıyor
- OG image LinkedIn'de doğru
- AI narration production'da
- Vercel deploy başarılı, custom domain aktif
- Lighthouse hedefleri tutuyor

---

## ⚡ PERFORMANS HEDEFLERİ

| Metrik | Hedef |
|---|---|
| Landing Lighthouse Performance | ≥ 90 |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3.0s (texture yükleme dahil) |
| Globe render | 60fps |
| 5000+ event render | 60fps (instanced) |
| Texture total size | < 8MB (compressed) |
| First Load JS | < 300KB (Three.js dynamic) |
| Mobile | 60fps mid-range, 30fps low-end |
| API cold start (edge) | < 800ms |

### Optimizasyon Stratejileri

- **Instanced rendering:** Tüm nokta katmanları tek InstancedMesh
- **Texture compression:** mozjpeg + opsiyonel KTX2/Basis
- **Progressive textures:** 1K placeholder → 4K
- **LOD:** Uzaktan az segment, yakından çok
- **Frustum culling:** Görünmeyen event'ler render edilmez
- **Polling pause:** Hidden tab + sadece aktif katmanlar
- **WebGL2 check:** Desteklemeyene fallback mesaj
- **Debounced raycasting:** Hover detection throttle

---

## 🚀 VERCEL DEPLOY

### Step-by-Step

1. **Repo + Vercel Import:**
   - GitHub repo public
   - Vercel "Import Project"
   - Next.js auto-detect

2. **Environment Variables:**
   ```
   ANTHROPIC_API_KEY        (AI narration)
   NASA_FIRMS_API_KEY       (yangın verisi — free signup)
   AISSTREAM_API_KEY        (gemiler — opsiyonel)
   OPENSKY_USERNAME         (uçuş rate limit — opsiyonel)
   OPENSKY_PASSWORD
   NEXT_PUBLIC_SITE_URL     https://overview.earth
   ```

3. **API Keys Alma:**
   - **NASA FIRMS:** `firms.modaps.eosdis.nasa.gov/api/` → free map key
   - **AISStream:** `aisstream.io` → free signup
   - **OpenSky:** `opensky-network.org` → free account (rate limit artar)
   - **Anthropic:** `console.anthropic.com`

4. **Edge Functions:**
   - `narrate` route edge runtime
   - Diğer API proxy route'lar: edge cache headers

5. **Custom Domain:**
   - Öneriler: `overview.earth`, `overview.space`, `pulse.earth`, `terra.live`
   - DNS A/CNAME, SSL otomatik

6. **Analytics:**
   - Vercel Analytics + Speed Insights

### Domain Önerileri

- **overview.earth** — premium, .earth tld konuya tam uygun
- **pulse.earth** — "gezegenin nabzı"
- **terra.live** — canlı veri vurgusu
- **overview.space** — uzay teması

### Maliyet

- Vercel Hobby: $0
- Tüm veri API'leri: ücretsiz (key'li olanlar dahil)
- Anthropic API: pay-per-use (narration az token, çok ucuz)
- Domain: ~$15-30/yıl (.earth biraz pahalı olabilir)
- NASA texture'ları: ücretsiz (public domain)

---

## 📝 README ŞABLONU

```markdown
# 🌍 OVERVIEW

> The pulse of the planet, in real time. Earthquakes, the ISS, flights, wildfires, and aurora — on a beautiful 3D Earth.

[![Live Demo](https://img.shields.io/badge/demo-overview.earth-2dd4bf)](https://overview.earth)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

![OVERVIEW Banner](public/banner.gif)

## ✨ Features

- 🌍 **Photorealistic Earth** — custom GLSL: atmosphere, day/night terminator, city lights
- 📡 **8+ live data layers** — earthquakes, ISS, flights, wildfires, aurora, ships, cables
- ⏳ **Time travel** — scrub through the last 24 hours, replay events
- 🔊 **Data sonification** — hear the planet (each event makes a sound)
- 🛰 **AI narration** — a calm narrator tells you what's happening now
- 🎬 **Cinematic auto-tour** — the camera flies to interesting events
- 📊 **Upload your own data** — drop a CSV, see it on the globe
- 🌑 **Premium space aesthetic** — star field, deep space, teal atmosphere

## 🛰 Data Sources

USGS (earthquakes) · NASA (ISS textures, FIRMS fires) · OpenSky (flights) · NOAA (aurora) · AISStream (ships) · TeleGeography (cables)

## 🚀 Quick Start

\`\`\`bash
git clone https://github.com/kutluhangil/overview
cd overview
pnpm install
cp .env.local.example .env.local
# add API keys (most are free)
pnpm dev
\`\`\`

## 🛠️ Tech Stack

Next.js 14 · TypeScript · Three.js · React Three Fiber · custom GLSL · Tone.js · Anthropic SDK · Vercel Edge

## 🙏 Inspiration

NASA's Blue Marble, the Overview Effect, GitHub's globe, Stripe's globe.

## 📄 License

MIT — fork it, learn from it, build your own planet.

---

Made with care by [@kutluhangil](https://github.com/kutluhangil) · [LinkedIn](https://linkedin.com/in/kutluhangil)
```

---

## 🗓️ İMPLEMENTASYON SIRASI (Claude Code İçin)

Her ajanı ayrı bir Claude Code session olarak çalıştır. Session sonu commit.

```
Day 1-2:   Agent 1 (Architect)        → "feat: scaffold + R3F canvas + stores"
Day 3-4:   Agent 2 (Aesthetician)     → "feat: design system + UI panels"
Day 5-8:   Agent 3 (Earth Smith)      → "feat: photorealistic earth + shaders"
Day 9-11:  Agent 4 (Cartographer)     → "feat: geo conversion + layers + camera"
Day 12-14: Agent 5 (Data Pipeline)    → "feat: API integrations + websocket"
Day 15-16: Agent 6 (Layer Conductor)  → "feat: layer system + filters + cards"
Day 17-18: Agent 7 (Time Lord)        → "feat: timeline scrubber + replay"
Day 19-20: Agent 8 (Composer)         → "feat: sonification + AI narration + tour"
Day 21-22: Agent 9 (Polisher)         → "chore: upload + embed + deploy"
Day 23:    Launch
```

**~3-4 hafta solo dev.** Agent 3 (Earth Smith) en kritik ve en çok zaman alabilecek olan — görsel kalite tüm projeyi taşır, acele etme. Texture optimizasyonu ve shader tuning'e zaman ayır.

---

## 🎬 SON SÖZ

Bu proje bittiğinde elinde:

- 🟢 Gezegenin canlı nabzını gösteren nefes kesen bir deneyim
- 🟢 Custom GLSL ile NASA seviyesi bir Earth render'ı
- 🟢 8+ gerçek API entegre eden production-grade veri pipeline
- 🟢 GitHub'da yıldız çekecek, ekran kaydı doğal viral olacak bir repo
- 🟢 LinkedIn'de **auto-tour demo'su ile patlayacak** bir paylaşım
- 🟢 Show HN'de ön sayfa potansiyeli
- 🟢 9 farklı teknik alanda derinleşmiş kas:
  - Three.js / R3F ileri seviye
  - Custom GLSL shader (atmosphere, terminator, fresnel)
  - Coğrafi koordinat matematiği
  - Real-time data (polling + WebSocket)
  - 8+ public API entegrasyonu
  - Instanced rendering & performance
  - Data sonification (Tone.js)
  - AI integration (narration)
  - Cinematic camera & UX

**Şimdi başla. Agent 1'i Claude Code'a hand off et.**

```
~/overview ➜  pnpm create next-app overview --typescript --tailwind --app
[+] scaffolding...
[+] beginning Agent 1: The Architect
[+] target acquired: planet earth 🌍
```

---

`end of blueprint` · `v1.0.0` · `built with ❤️ for kutluhan.gil`
