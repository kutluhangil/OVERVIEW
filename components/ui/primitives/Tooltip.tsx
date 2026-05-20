'use client';

import React, { useState, useRef, useId } from 'react';
import { cn } from '@/lib/utils/cn';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  children: React.ReactElement;
  className?: string;
  disabled?: boolean;
}

const placementStyles: Record<TooltipPlacement, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles: Record<TooltipPlacement, string> = {
  top:    'top-full left-1/2 -translate-x-1/2 border-t-[#1a2436] border-x-transparent border-b-0 border-[5px]',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#1a2436] border-x-transparent border-t-0 border-[5px]',
  left:   'left-full top-1/2 -translate-y-1/2 border-l-[#1a2436] border-y-transparent border-r-0 border-[5px]',
  right:  'right-full top-1/2 -translate-y-1/2 border-r-[#1a2436] border-y-transparent border-l-0 border-[5px]',
};

export function Tooltip({
  content,
  placement = 'top',
  delay = 300,
  children,
  className,
  disabled = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const show = () => {
    if (disabled) return;
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  };

  const child = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      show();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      show();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hide();
      children.props.onBlur?.(e);
    },
    'aria-describedby': visible ? tooltipId : undefined,
  });

  return (
    <div className="relative inline-flex">
      {child}

      {visible && content && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-[9999] pointer-events-none',
            'animate-fade-in',
            placementStyles[placement]
          )}
        >
          <div
            className={cn(
              'glass rounded-md px-2.5 py-1.5',
              'text-xs text-[#e8eef5] font-body',
              'whitespace-nowrap max-w-[200px]',
              'shadow-[0_4px_16px_rgba(0,0,0,0.6)]',
              className
            )}
          >
            {content}
          </div>
          <div
            className={cn(
              'absolute w-0 h-0',
              arrowStyles[placement]
            )}
          />
        </div>
      )}
    </div>
  );
}
