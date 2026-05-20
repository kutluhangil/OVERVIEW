'use client';

import { useState, useCallback } from 'react';
import { parseCSV, csvRowsToGeoEvents } from '@/lib/utils/csv';
import { useDataStore } from '@/store/useDataStore';

interface CSVParserProps {
  onSuccess: () => void;
}

export function CSVParser({ onSuccess }: CSVParserProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const addEvents = useDataStore((s) => s.addEvents);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setCount(null);
      try {
        const text = await file.text();
        const rows = parseCSV(text);
        if (rows.length === 0) throw new Error('No valid rows found');
        const events = csvRowsToGeoEvents(rows);
        addEvents('custom', events);
        setCount(events.length);
        setTimeout(onSuccess, 1500);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to parse CSV');
      }
    },
    [addEvents, onSuccess]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
          ${isDragging ? 'border-[#2dd4bf] bg-[#2dd4bf10]' : 'border-[#1a2436] hover:border-[#2dd4bf40]'}
        `}
        onClick={() => document.getElementById('csv-input')?.click()}
      >
        <div className="text-3xl mb-2">📊</div>
        <p className="text-[#e8eef5] text-sm">Drop CSV here or click to browse</p>
        <p className="text-[#5b6b82] text-xs mt-1">
          Required columns: <span className="text-[#2dd4bf] font-mono">lat, lng</span>
          <br />Optional: label, value
        </p>
        <input
          id="csv-input"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      {count !== null && (
        <div className="bg-[#2dd4bf10] border border-[#2dd4bf30] rounded p-3 text-[#2dd4bf] text-sm">
          ✓ Loaded {count} points onto the globe
        </div>
      )}
    </div>
  );
}
