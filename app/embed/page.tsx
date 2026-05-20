import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const GlobeCanvas = dynamic(
  () => import('@/components/globe/GlobeCanvas').then((m) => m.GlobeCanvas),
  { ssr: false }
);

export default function EmbedPage() {
  return (
    <div className="w-full h-screen bg-[#000308] overflow-hidden">
      <Suspense fallback={<div className="w-full h-full bg-[#000308]" />}>
        <GlobeCanvas minimal />
      </Suspense>
    </div>
  );
}
