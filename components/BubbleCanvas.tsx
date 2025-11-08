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

interface SimulationNode extends d3.SimulationNodeDatum {
  bubble: WordBubble | CenterWord;
  radius: number;
}

export default function BubbleCanvas({ data, onWordClick }: BubbleCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedBubble, setSelectedBubble] = useState<WordBubble | CenterWord | undefined>();
  const [previousSelection, setPreviousSelection] = useState<string | undefined>();
  const [comparisonData, setComparisonData] = useState<ComparisonData | undefined>();
  const [allBubbles, setAllBubbles] = useState<(WordBubble | CenterWord)[]>([]);
  const simulationRef = useRef<d3.Simulation<SimulationNode, undefined> | null>(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    // Combine all bubbles
    const bubbles: (WordBubble | CenterWord)[] = [
      data.centerWord,
      ...data.synonyms,
      ...data.antonyms,
    ];

    // Calculate bubble sizes and create simulation nodes
    const nodes: SimulationNode[] = bubbles.map((bubble) => {
      const isCenter = bubble.id === 'center';
      // Smaller bubbles to accommodate more of them
      const baseSize = isCenter ? 55 : 30;
      const radius = baseSize + (bubble.similarity * 12);

      return {
        bubble,
        radius,
        x: isCenter ? width / 2 : bubble.position.x + width / 2,
        y: isCenter ? height / 2 : bubble.position.y + height / 2,
      };
    });

    // Stop any existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Create force simulation with stronger forces for more bubbles
    const simulation = d3.forceSimulation<SimulationNode>(nodes)
      .force('charge', d3.forceManyBody().strength(-80))
      .force('collision', d3.forceCollide<SimulationNode>().radius(d => d.radius + 8).iterations(4))
      .force('x', d3.forceX<SimulationNode>(width / 2).strength(d => {
        // Keep center word strongly at center
        if (d.bubble.id === 'center') return 1;
        // Pull synonyms toward center based on similarity
        if (!d.bubble.isAntonym) return 0.03 + (d.bubble.similarity * 0.08);
        // Push antonyms away from center
        return -0.08;
      }))
      .force('y', d3.forceY<SimulationNode>(height / 2).strength(d => {
        if (d.bubble.id === 'center') return 1;
        return 0.08;
      }))
      .force('radial', d3.forceRadial<SimulationNode>(
        d => {
          if (d.bubble.id === 'center') return 0;
          // Synonyms orbit at a distance based on similarity (inverse)
          // More granular distances for more bubbles
          if (!d.bubble.isAntonym) {
            return 90 + (1 - d.bubble.similarity) * 200;
          }
          // Antonyms orbit MUCH further at outer edge
          return 450;
        },
        width / 2,
        height / 2
      ).strength(0.4))
      .alphaDecay(0.015)
      .velocityDecay(0.35);

    // Update positions on each tick
    simulation.on('tick', () => {
      const updatedBubbles = nodes.map(node => ({
        ...node.bubble,
        position: {
          x: (node.x || width / 2) - width / 2,
          y: (node.y || height / 2) - height / 2,
        },
      }));
      setAllBubbles(updatedBubbles);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
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
        className="relative w-full h-[900px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-white/10"
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
