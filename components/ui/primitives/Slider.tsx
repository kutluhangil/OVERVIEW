'use client';

import React, { useId, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  formatValue?: (v: number) => string;
  accentColor?: string;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  label,
  showValue = true,
  formatValue,
  accentColor = '#2dd4bf',
  disabled = false,
  className,
}: SliderProps) {
  const id = useId();

  const percent = useMemo(
    () => ((value - min) / (max - min)) * 100,
    [value, min, max]
  );

  const displayValue = formatValue
    ? formatValue(value)
    : value % 1 === 0
    ? String(value)
    : value.toFixed(2);

  // The track fill is driven by a CSS linear-gradient injected inline.
  // Pseudo-element thumb styling is handled globally in globals.css;
  // the accent color is passed as a CSS variable so each slider can
  // tint its own thumb without requiring styled-jsx.
  const rootStyle = {
    '--slider-accent': accentColor,
    '--slider-fill': `${percent}%`,
  } as React.CSSProperties;

  return (
    <div className={cn('flex flex-col gap-1', className)} style={rootStyle}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={id}
              className="text-xs text-[#94a3b8] font-body select-none"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span
              className="mono-data text-xs tabular-nums"
              style={{ color: accentColor }}
            >
              {displayValue}
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center h-4">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={cn(
            'w-full cursor-pointer',
            'appearance-none bg-transparent',
            // Track
            '[&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full',
            '[&::-moz-range-track]:h-0.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[#1a2436]',
            // Thumb
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:cursor-grab',
            '[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3',
            '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-grab',
            disabled && 'opacity-40 cursor-not-allowed [&::-webkit-slider-thumb]:cursor-not-allowed'
          )}
          style={{
            // Fill track via background gradient (works cross-browser for webkit)
            background: `linear-gradient(to right, ${accentColor} ${percent}%, #1a2436 ${percent}%)`,
          }}
          // Inline thumb color via data attribute — consumed by globals.css
          data-accent={accentColor}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
    </div>
  );
}
