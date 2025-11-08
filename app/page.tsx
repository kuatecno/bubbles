'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import BubbleCanvas from '@/components/BubbleCanvas';
import { WordAnalysisResponse } from '@/types/word';

export default function Home() {
  const [analysisData, setAnalysisData] = useState<WordAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (word: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          targetLanguages: ['es', 'fr', 'de', 'pt', 'it']
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze word');
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Bubble Dictionary
        </h1>
        <p className="text-white/60 text-lg">
          Explore words in a revolutionary visual way - powered by AI
        </p>
      </header>

      {/* Search */}
      <div className="max-w-7xl mx-auto">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-center">
            {error}
          </div>
        )}

        {/* Bubble Visualization */}
        <BubbleCanvas data={analysisData} onWordClick={handleSearch} />

        {/* Info Section */}
        {!analysisData && !isLoading && (
          <div className="mt-12 max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-white font-semibold mb-2">Smart Positioning</h3>
              <p className="text-white/60 text-sm">
                AI analyzes intensity, specificity, frequency, and emotional valence to position words
                in 360° space
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🌈</div>
              <h3 className="text-white font-semibold mb-2">Color Coding</h3>
              <p className="text-white/60 text-sm">
                Yellow for standard synonyms, orange for confusing words, red for false friends, dark
                for antonyms
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="text-white font-semibold mb-2">Multilingual</h3>
              <p className="text-white/60 text-sm">
                See translations, cognates, and false friends across multiple languages
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-16 text-center text-white/40 text-sm">
        <p>Powered by OpenAI GPT-4 • Built with Next.js, D3.js, and Framer Motion</p>
      </footer>
    </div>
  );
}
