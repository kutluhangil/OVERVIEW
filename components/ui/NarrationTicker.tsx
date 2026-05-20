'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils/cn';

export function NarrationTicker() {
  const narrationText = useUIStore((s) => s.narrationText);
  const narrationKey = useUIStore((s) => s.narrationKey);

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Typing effect: re-runs when narrationKey changes
  useEffect(() => {
    if (!narrationText) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    const type = () => {
      if (index < narrationText.length) {
        setDisplayedText(narrationText.slice(0, index + 1));
        index++;
        intervalRef.current = setTimeout(type, 22);
      } else {
        setIsTyping(false);
      }
    };

    // Small delay before starting to type
    intervalRef.current = setTimeout(type, 200);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrationKey]);

  if (!narrationText) return null;

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-30',
        'bottom-[64px]',
        'flex items-center gap-3 px-4 py-2',
        'bg-[#050810]/85 backdrop-blur-md',
        'border-t border-[#1a2436]',
        'border-b border-[#1a2436]'
      )}
      role="status"
      aria-live="polite"
      aria-label="Mission narration"
    >
      {/* Satellite icon with teal glow */}
      <span
        className="flex-shrink-0 text-base leading-none select-none"
        style={{
          textShadow: '0 0 8px rgba(45,212,191,0.9), 0 0 20px rgba(45,212,191,0.4)',
          filter: 'drop-shadow(0 0 4px rgba(45,212,191,0.6))',
        }}
        aria-hidden="true"
      >
        🛰
      </span>

      {/* Vertical separator */}
      <div className="h-3.5 w-px bg-accent/30 flex-shrink-0" />

      {/* Narration text */}
      <div className="flex-1 overflow-hidden">
        <p className="mono-data text-xs text-[#94a3b8] truncate">
          {displayedText}
          {isTyping && (
            <span
              className="inline-block w-0.5 h-3 bg-accent ml-0.5 align-middle"
              style={{ animation: 'typingCursor 0.7s ease-in-out infinite' }}
              aria-hidden="true"
            />
          )}
        </p>
      </div>

      {/* Subtle scanning dot */}
      {!isTyping && displayedText && (
        <span
          className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-accent/60 animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
