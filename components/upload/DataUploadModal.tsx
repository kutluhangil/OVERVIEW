'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { CSVParser } from './CSVParser';

export function DataUploadModal() {
  const { isUploadOpen, setUploadOpen } = useUIStore();

  return (
    <AnimatePresence>
      {isUploadOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setUploadOpen(false)}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative z-10 bg-[#0a0f1a] border border-[#1a2436] rounded-xl p-6 w-full max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#e8eef5] font-display font-semibold">Upload Custom Data</h2>
              <button
                onClick={() => setUploadOpen(false)}
                className="text-[#5b6b82] hover:text-[#e8eef5] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <CSVParser onSuccess={() => setUploadOpen(false)} />

            <div className="mt-4 p-3 bg-[#050810] rounded-lg border border-[#131b2a]">
              <p className="text-[#5b6b82] text-xs font-mono">
                Example CSV format:
              </p>
              <pre className="text-[#2dd4bf] text-xs font-mono mt-1">
                {`lat,lng,label,value\n37.7749,-122.4194,San Francisco,1\n51.5074,-0.1278,London,2`}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
