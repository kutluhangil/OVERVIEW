'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  color?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  color = '#2dd4bf',
  size = 'md',
  disabled = false,
  className,
  id: externalId,
}: ToggleProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  const trackSm = 'h-4 w-7';
  const thumbSm = 'h-3 w-3';
  const translateSm = 'translate-x-3';

  const trackMd = 'h-5 w-9';
  const thumbMd = 'h-3.5 w-3.5';
  const translateMd = 'translate-x-4';

  const isSm = size === 'sm';
  const trackCls = isSm ? trackSm : trackMd;
  const thumbCls = isSm ? thumbSm : thumbMd;
  const translateCls = isSm ? translateSm : translateMd;

  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer select-none',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      <div className={cn('relative flex-shrink-0', trackCls)}>
        {/* Track */}
        <div
          className={cn(
            'absolute inset-0 rounded-full transition-all duration-200 ease-out',
            checked ? 'opacity-100' : 'bg-[#1a2436] opacity-100'
          )}
          style={
            checked
              ? {
                  backgroundColor: `${color}26`,
                  borderColor: `${color}60`,
                  border: `1px solid ${color}60`,
                  boxShadow: `0 0 6px ${color}30`,
                }
              : {
                  border: '1px solid #1a2436',
                }
          }
        />

        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 rounded-full',
            'transition-all duration-200 ease-out',
            thumbCls,
            checked ? translateCls : 'translate-x-0.5'
          )}
          style={
            checked
              ? {
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}80`,
                }
              : {
                  backgroundColor: '#5b6b82',
                }
          }
        />

        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
          role="switch"
          aria-checked={checked}
        />
      </div>

      {label && (
        <span
          className={cn(
            'text-sm transition-colors duration-150',
            checked ? 'text-[#e8eef5]' : 'text-[#5b6b82]'
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}
