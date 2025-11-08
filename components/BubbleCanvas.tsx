'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { WordBubble, CenterWord, WordAnalysisResponse, ComparisonData } from '@/types/word';
import WordBubbleComponent from './WordBubble';
import ContextPanel from './ContextPanel';

interface BubbleCanvasProps {
  data: WordAnalysisResponse | null;
  onWordClick?: (word: string) => void;
}

export default function BubbleCanvas({ data, onWordClick }: BubbleCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedBubble, setSelectedBubble] = useState<WordBubble | CenterWord | undefined>();
  const [previousSelection, setPreviousSelection] = useState<string | undefined>();
  const [comparisonData, setComparisonData] = useState<ComparisonData | undefined>();
  const [allBubbles, setAllBubbles] = useState<(WordBubble | CenterWord)[]>([]);

  useEffect(() => {
    if (!data) return;

    // Combine all bubbles
    const bubbles: (WordBubble | CenterWord)[] = [
      data.centerWord,
      ...data.synonyms,
      ...data.antonyms,
    ];

    setAllBubbles(bubbles);
  }, [data]);

  const handleBubbleClick = async (bubble: WordBubble | CenterWord) => {
    // First click: show context
    if (!selectedBubble || selectedBubble.id !== bubble.id) {
      setSelectedBubble(bubble);
      setPreviousSelection(bubble.word);
      setComparisonData(undefined);
      return;
    }

    // Second click on same bubble: recenter (if not center word)
    if (bubble.id !== 'center') {
      // If we have a previous selection, compare
      if (previousSelection && previousSelection !== bubble.word) {
        await fetchComparison(previousSelection, bubble.word);
      }

      // Recenter on this word
      if (onWordClick) {
        onWordClick(bubble.word);
      }
    }
  };

  const fetchComparison = async (word1: string, word2: string) => {
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word1, word2 }),
      });

      if (response.ok) {
        const comparison = await response.json();
        setComparisonData(comparison);
      }
    } catch (error) {
      console.error('Error fetching comparison:', error);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96 text-white/60">
        <p>Search for a word to see the bubble visualization</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={canvasRef}
        className="relative w-full h-[600px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-white/10"
      >
        <AnimatePresence>
          {allBubbles.map((bubble) => (
            <WordBubbleComponent
              key={bubble.id}
              bubble={bubble}
              isCenter={bubble.id === 'center'}
              onClick={() => handleBubbleClick(bubble)}
            />
          ))}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md rounded-xl p-4 text-sm">
          <h3 className="text-white font-semibold mb-2">Color Guide</h3>
          <div className="space-y-1 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400/40 border border-yellow-400/60" />
              <span>Standard synonym</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500/40 border border-orange-500/60" />
              <span>Potentially confusing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500/40 border border-red-500/60" />
              <span>False friend / Dangerous</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-900/60 border border-gray-700/80" />
              <span>Antonym</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md rounded-xl p-3 text-xs text-white/60">
          <p>Click once: view details</p>
          <p>Click twice: recenter &amp; compare</p>
        </div>
      </div>

      <ContextPanel
        selectedBubble={selectedBubble}
        comparisonData={comparisonData}
        onClose={() => {
          setSelectedBubble(undefined);
          setComparisonData(undefined);
        }}
      />
    </>
  );
}
