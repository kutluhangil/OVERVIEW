import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          void: '#000308',
          deep: '#050810',
          panel: '#0a0f1a',
          elevated: '#101725',
        },
        border: {
          faint: '#131b2a',
          subtle: '#1a2436',
          glow: '#2dd4bf',
        },
        accent: {
          DEFAULT: '#2dd4bf',
          bright: '#5eead4',
          dim: '#2dd4bf20',
          glow: '#2dd4bf40',
        },
        data: {
          quake: '#ff5a5f',
          iss: '#ffd93d',
          flight: '#5eead4',
          fire: '#ff7847',
          aurora: '#a78bfa',
          ship: '#60a5fa',
          cable: '#34d399',
          volcano: '#f472b6',
        },
        live: '#34d399',
        replay: '#fbbf24',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'base': '13px',
        'md': '15px',
        'lg': '18px',
        'xl': '24px',
        '2xl': '32px',
      },
      backgroundImage: {
        'space-gradient': 'radial-gradient(ellipse at center, #0a0f1a 0%, #000308 100%)',
        'teal-glow': 'radial-gradient(ellipse, #2dd4bf40 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-teal': '0 0 20px #2dd4bf30, 0 0 40px #2dd4bf15',
        'glow-teal-sm': '0 0 10px #2dd4bf40',
        'panel': '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(45,212,191,0.1)',
        'card': '0 8px 32px rgba(0,0,0,0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
