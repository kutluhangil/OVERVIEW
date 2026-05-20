'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const sizeMap: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-8 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-base gap-2',
};

const iconSizeMap: Record<ButtonSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

const variantMap: Record<ButtonVariant, string> = {
  primary: [
    'bg-accent text-space-void font-semibold',
    'border border-accent',
    'hover:bg-accent-bright hover:border-accent-bright',
    'hover:shadow-[0_0_16px_rgba(45,212,191,0.5)]',
    'active:bg-accent/80 active:scale-[0.97]',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none',
  ].join(' '),

  ghost: [
    'bg-transparent text-accent font-medium',
    'border border-accent/40',
    'hover:bg-accent/10 hover:border-accent/80',
    'hover:shadow-[0_0_10px_rgba(45,212,191,0.2)]',
    'active:bg-accent/20 active:scale-[0.97]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  icon: [
    'bg-transparent text-[#94a3b8]',
    'border border-transparent',
    'hover:bg-white/5 hover:text-[#e8eef5] hover:border-[#1a2436]',
    'active:bg-white/10 active:scale-[0.93]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'ghost',
      size = 'md',
      active = false,
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isIcon = variant === 'icon';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-md',
          'transition-all duration-150 ease-out',
          'focus-visible:outline focus-visible:outline-[1.5px] focus-visible:outline-accent focus-visible:outline-offset-2',
          'select-none whitespace-nowrap font-body',
          isIcon ? iconSizeMap[size] : sizeMap[size],
          variantMap[variant],
          active && variant === 'icon' && 'text-accent bg-accent/10 border-accent/30',
          active && variant === 'ghost' && 'bg-accent/15 border-accent/60',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
            {!isIcon && children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
