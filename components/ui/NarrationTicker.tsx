'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { askGlobe } from '@/lib/ai/narrate';
import { cn } from '@/lib/utils/cn';

export function NarrationTicker() {
  const narrationText = useUIStore((s) => s.narrationText);
  const narrationKey  = useUIStore((s) => s.narrationKey);
  const setNarration  = useUIStore((s) => s.setNarration);

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping]           = useState(false);
  const [isAskOpen, setIsAskOpen]         = useState(false);
  const [question, setQuestion]           = useState('');
  const [isAsking, setIsAsking]           = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  // Typewriter effect — reruns on narrationKey change
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
    intervalRef.current = setTimeout(type, 200);
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrationKey]);

  // Focus input when ask panel opens
  useEffect(() => {
    if (isAskOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isAskOpen]);

  const handleAsk = useCallback(async () => {
    const q = question.trim();
    if (!q || isAsking) return;
    setIsAsking(true);
    setQuestion('');
    setIsAskOpen(false);
    setNarration('...');
    const answer = await askGlobe(q);
    setNarration(answer);
    setIsAsking(false);
  }, [question, isAsking, setNarration]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleAsk();
      if (e.key === 'Escape') setIsAskOpen(false);
    },
    [handleAsk]
  );

  if (!narrationText && !isAskOpen) return null;

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-30 bottom-[64px]',
        'flex items-center gap-3 px-4',
        'bg-[#050810]/85 backdrop-blur-md',
        'border-t border-[#1a2436]',
        'border-b border-[#1a2436]',
        'transition-all duration-200',
        isAskOpen ? 'py-2.5' : 'py-2'
      )}
      role="status"
      aria-live="polite"
      aria-label="Mission narration"
    >
      {/* Satellite icon */}
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

      <div className="h-3.5 w-px bg-accent/30 flex-shrink-0" />

      {/* Ask panel or narration text */}
      {isAskOpen ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the globe anything…"
            maxLength={120}
            className={cn(
              'flex-1 bg-transparent outline-none',
              'mono-data text-xs text-[#e8eef5] placeholder:text-[#3d5068]',
              'caret-accent'
            )}
            aria-label="Ask the globe a question"
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim()}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-md',
              'text-[10px] mono-data font-medium uppercase tracking-wider',
              'border transition-all duration-150',
              question.trim()
                ? 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
                : 'border-[#1a2436] text-[#3d5068] cursor-not-allowed'
            )}
            aria-label="Submit question"
          >
            <Send className="h-3 w-3" />
            Ask
          </button>
          <button
            onClick={() => setIsAskOpen(false)}
            className="text-[#3d5068] hover:text-[#5b6b82] transition-colors mono-data text-[10px]"
            aria-label="Cancel"
          >
            Esc
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-3 overflow-hidden min-w-0">
          <p className="flex-1 mono-data text-xs text-[#94a3b8] truncate min-w-0">
            {isAsking ? (
              <span className="text-accent/60 italic">Asking the globe…</span>
            ) : (
              <>
                {displayedText}
                {isTyping && (
                  <span
                    className="inline-block w-0.5 h-3 bg-accent ml-0.5 align-middle"
                    style={{ animation: 'typingCursor 0.7s ease-in-out infinite' }}
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </p>

          {!isTyping && !isAsking && displayedText && (
            <span
              className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-accent/60 animate-pulse"
              aria-hidden="true"
            />
          )}

          {/* Ask button */}
          <Tooltip content="Ask the globe a question">
            <button
              onClick={() => setIsAskOpen(true)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded',
                'text-[10px] mono-data tracking-wider text-[#3d5068]',
                'border border-transparent hover:border-accent/30 hover:text-accent/80',
                'transition-all duration-150'
              )}
              aria-label="Ask the globe"
            >
              <Send className="h-2.5 w-2.5" />
              Ask
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <div className="relative group">
      {children}
      <div
        className={cn(
          'absolute bottom-full right-0 mb-1.5 px-2 py-1 rounded',
          'bg-[#0d1b2e] border border-[#1a2436]',
          'text-[10px] mono-data text-[#94a3b8] whitespace-nowrap',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none'
        )}
      >
        {content}
      </div>
    </div>
  );
}
