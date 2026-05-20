import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #000308 0%, #0a0f1a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Stars */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 20% 30%, #2dd4bf08 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, #4a9eff08 0%, transparent 50%)',
          }}
        />

        {/* Globe circle */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #4a9eff 0%, #1a4a8a 40%, #050810 100%)',
            boxShadow: '0 0 60px #2dd4bf40, 0 0 120px #2dd4bf20, inset 0 0 30px rgba(0,0,0,0.5)',
            marginBottom: 32,
            border: '1px solid #2dd4bf30',
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#e8eef5',
            letterSpacing: '-2px',
            marginBottom: 12,
          }}
        >
          OVERVIEW
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: '#2dd4bf',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          The pulse of the planet
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 16,
            color: '#5b6b82',
            marginTop: 16,
            textAlign: 'center',
            maxWidth: 600,
          }}
        >
          Earthquakes · ISS · Flights · Wildfires · Aurora — live on a 3D Earth
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
