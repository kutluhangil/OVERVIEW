'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Volume2, Globe } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useGlobeStore } from '@/store/useGlobeStore';
import { Slider } from './primitives/Slider';
import { Toggle } from './primitives/Toggle';
import { Button } from './primitives/Button';
import { cn } from '@/lib/utils/cn';

type Quality = 'low' | 'medium' | 'high';

const QUALITY_OPTIONS: { value: Quality; label: string; description: string }[] = [
  { value: 'low',    label: 'Low',    description: 'Best performance' },
  { value: 'medium', label: 'Medium', description: 'Balanced' },
  { value: 'high',   label: 'High',   description: 'Best visual quality' },
];

export function SettingsModal() {
  const isOpen       = useUIStore((s) => s.isSettingsOpen);
  const setOpen      = useUIStore((s) => s.setSettingsOpen);
  const isSoundEnabled = useUIStore((s) => s.isSoundEnabled);
  const setSoundEnabled = useUIStore((s) => s.setSoundEnabled);

  const rotationSpeed = useGlobeStore((s) => s.rotationSpeed);
  const quality       = useGlobeStore((s) => s.quality);
  const isRotating    = useGlobeStore((s) => s.isRotating);
  const setRotationSpeed = useGlobeStore((s) => s.setRotationSpeed);
  const setQuality       = useGlobeStore((s) => s.setQuality);
  const setRotating      = useGlobeStore((s) => s.setRotating);

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] modal-backdrop"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'fixed z-[61] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-[360px] max-h-[80vh] overflow-y-auto',
              'glass-elevated rounded-2xl'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
          >
            {/* Teal top accent */}
            <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2436]">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-accent/10 border border-accent/20">
                  <Cpu className="h-3.5 w-3.5 text-accent" />
                </div>
                <h2 className="font-display font-semibold text-md text-[#e8eef5]">
                  Settings
                </h2>
              </div>
              <Button
                variant="icon"
                size="sm"
                onClick={handleClose}
                aria-label="Close settings"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 space-y-6">
              {/* ── Globe section ──────────────────────────────────── */}
              <section>
                <SectionLabel icon={<Globe className="h-3.5 w-3.5" />} label="Globe" />
                <div className="space-y-4 mt-3">
                  {/* Auto-rotation toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#94a3b8] font-body">Auto-rotation</span>
                    <Toggle
                      checked={isRotating}
                      onChange={setRotating}
                      color="#2dd4bf"
                    />
                  </div>

                  {/* Rotation speed slider */}
                  <Slider
                    value={rotationSpeed}
                    onChange={setRotationSpeed}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    label="Rotation Speed"
                    disabled={!isRotating}
                    formatValue={(v) => `${v.toFixed(2)}×`}
                  />
                </div>
              </section>

              <Divider />

              {/* ── Render Quality ─────────────────────────────────── */}
              <section>
                <SectionLabel icon={<Cpu className="h-3.5 w-3.5" />} label="Render Quality" />
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {QUALITY_OPTIONS.map(({ value, label, description }) => (
                    <button
                      key={value}
                      onClick={() => setQuality(value)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-lg',
                        'border text-center transition-all duration-150',
                        quality === value
                          ? 'border-accent/50 bg-accent/10 shadow-[0_0_12px_rgba(45,212,191,0.15)]'
                          : 'border-[#1a2436] bg-transparent hover:border-[#2a3548] hover:bg-white/[0.03]'
                      )}
                      aria-pressed={quality === value}
                      aria-label={`Quality: ${label}`}
                    >
                      <span
                        className={cn(
                          'text-sm font-semibold font-display',
                          quality === value ? 'text-accent' : 'text-[#94a3b8]'
                        )}
                      >
                        {label}
                      </span>
                      <span className="text-[10px] text-[#5b6b82] font-body">
                        {description}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <Divider />

              {/* ── Sound settings ─────────────────────────────────── */}
              <section>
                <SectionLabel icon={<Volume2 className="h-3.5 w-3.5" />} label="Sound" />
                <div className="space-y-4 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#94a3b8] font-body">Enable Sound</span>
                    <Toggle
                      checked={isSoundEnabled}
                      onChange={setSoundEnabled}
                      color="#2dd4bf"
                    />
                  </div>

                  {isSoundEnabled && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#94a3b8] font-body">Ambient Sound</span>
                        <Toggle
                          checked={true}
                          onChange={() => {}}
                          color="#2dd4bf"
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#94a3b8] font-body">Event Sounds</span>
                        <Toggle
                          checked={true}
                          onChange={() => {}}
                          color="#2dd4bf"
                          size="sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleClose}
              >
                Save Changes
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-accent">{icon}</span>
      <span className="text-[10px] text-[#5b6b82] tracking-widest uppercase font-body">
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[#1a2436]" />;
}
