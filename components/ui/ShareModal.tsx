'use client';

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, Code2, Twitter, Linkedin } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useLayersStore } from '@/store/useLayersStore';
import { Button } from './primitives/Button';
import { cn } from '@/lib/utils/cn';

export function ShareModal() {
  const isOpen  = useUIStore((s) => s.isShareOpen);
  const setOpen = useUIStore((s) => s.setShareOpen);
  const layers  = useLayersStore((s) => s.layers);

  const [copiedLink, setCopiedLink]   = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab]     = useState<'link' | 'embed'>('link');

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  // Build shareable URL with active layers encoded
  const shareUrl = useMemo(() => {
    const base =
      typeof window !== 'undefined'
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://overview.earth');
    const activeLayers = layers
      .filter((l) => l.enabled)
      .map((l) => l.type)
      .join(',');
    const params = new URLSearchParams();
    if (activeLayers) params.set('layers', activeLayers);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [layers]);

  const embedCode = useMemo(
    () =>
      `<iframe\n  src="${shareUrl}&embed=1"\n  width="100%"\n  height="600"\n  style="border:none;border-radius:12px;"\n  title="OVERVIEW — Earth Intelligence"\n  allowfullscreen\n></iframe>`,
    [shareUrl]
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch { /* noop */ }
  }, [shareUrl]);

  const handleCopyEmbed = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch { /* noop */ }
  }, [embedCode]);

  const twitterUrl = useMemo(() => {
    const text = encodeURIComponent(
      'Visualizing real-time Earth data in 3D — earthquakes, ISS, wildfires and more.'
    );
    return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
  }, [shareUrl]);

  const linkedinUrl = useMemo(
    () =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    [shareUrl]
  );

  const enabledCount = layers.filter((l) => l.enabled).length;

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
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className={cn(
              'fixed z-[61] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-[380px]',
              'glass-elevated rounded-2xl overflow-hidden'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Share OVERVIEW"
          >
            {/* Top accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2436]">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-accent/10 border border-accent/20">
                  <Share2 className="h-3.5 w-3.5 text-accent" />
                </div>
                <h2 className="font-display font-semibold text-md text-[#e8eef5]">
                  Share OVERVIEW
                </h2>
              </div>
              <Button variant="icon" size="sm" onClick={handleClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 space-y-4">
              {/* Tab switcher */}
              <div className="flex rounded-lg overflow-hidden border border-[#1a2436] p-0.5 bg-[#050810]/60 gap-0.5">
                {(['link', 'embed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md',
                      'text-xs font-medium font-body transition-all duration-150',
                      activeTab === tab
                        ? 'bg-accent/15 text-accent border border-accent/30'
                        : 'text-[#5b6b82] hover:text-[#94a3b8]'
                    )}
                    aria-pressed={activeTab === tab}
                  >
                    {tab === 'link' ? (
                      <Share2 className="h-3 w-3" />
                    ) : (
                      <Code2 className="h-3 w-3" />
                    )}
                    {tab === 'link' ? 'Share Link' : 'Embed Code'}
                  </button>
                ))}
              </div>

              {/* ── Link tab ───────────────────────────────────── */}
              {activeTab === 'link' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#050810] border border-[#1a2436]">
                    <span className="flex-1 mono-data text-xs text-[#5b6b82] truncate select-all">
                      {shareUrl}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className={cn(
                        'flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded',
                        'text-[10px] font-medium transition-all duration-150',
                        copiedLink
                          ? 'bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30'
                          : 'text-[#94a3b8] hover:text-accent hover:bg-accent/5 border border-transparent'
                      )}
                      aria-label="Copy link"
                    >
                      {copiedLink ? (
                        <><Check className="h-3 w-3" /> Copied!</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Copy</>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-[#5b6b82] font-body">
                    Sharing{' '}
                    <span className="text-accent">
                      {enabledCount} active layer{enabledCount !== 1 ? 's' : ''}
                    </span>{' '}
                    with this link.
                  </p>

                  <div>
                    <p className="text-[10px] text-[#5b6b82] tracking-widest uppercase font-body mb-2">
                      Share to
                    </p>
                    <div className="flex gap-2">
                      <SocialButton
                        href={twitterUrl}
                        label="X (Twitter)"
                        icon={<Twitter className="h-3.5 w-3.5" />}
                        colorClass="hover:bg-[#1d9bf0]/10 hover:border-[#1d9bf0]/40 hover:text-[#1d9bf0]"
                      />
                      <SocialButton
                        href={linkedinUrl}
                        label="LinkedIn"
                        icon={<Linkedin className="h-3.5 w-3.5" />}
                        colorClass="hover:bg-[#0a66c2]/10 hover:border-[#0a66c2]/40 hover:text-[#0a66c2]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Embed tab ──────────────────────────────────── */}
              {activeTab === 'embed' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="relative">
                    <pre
                      className={cn(
                        'mono-data text-[10px] text-[#5b6b82] leading-relaxed',
                        'p-3 pt-8 rounded-lg bg-[#050810] border border-[#1a2436]',
                        'whitespace-pre-wrap break-all overflow-x-auto'
                      )}
                    >
                      {embedCode}
                    </pre>
                    <button
                      onClick={handleCopyEmbed}
                      className={cn(
                        'absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded',
                        'text-[10px] font-medium transition-all duration-150',
                        copiedEmbed
                          ? 'bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30'
                          : 'bg-[#0a0f1a] text-[#94a3b8] hover:text-accent border border-[#1a2436] hover:border-accent/30'
                      )}
                      aria-label="Copy embed code"
                    >
                      {copiedEmbed ? (
                        <><Check className="h-3 w-3" /> Copied!</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Copy code</>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-[#5b6b82] font-body">
                    Embed OVERVIEW on any webpage. The iframe is responsive and renders
                    at full quality.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── SocialButton ────────────────────────────────────────────────────── */
interface SocialButtonProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
}

function SocialButton({ href, label, icon, colorClass }: SocialButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Share on ${label}`}
      className={cn(
        'flex items-center justify-center gap-2 flex-1 py-2 rounded-lg',
        'text-xs font-medium text-[#5b6b82]',
        'border border-[#1a2436] transition-all duration-150',
        'active:scale-[0.97]',
        colorClass
      )}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
