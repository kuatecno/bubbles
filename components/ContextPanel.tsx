'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { WordBubble, CenterWord, ComparisonData, Translation } from '@/types/word';

interface ContextPanelProps {
  selectedBubble?: WordBubble | CenterWord;
  comparisonData?: ComparisonData;
  onClose: () => void;
}

function isCenterWord(bubble: WordBubble | CenterWord): bubble is CenterWord {
  return 'translations' in bubble;
}

export default function ContextPanel({ selectedBubble, comparisonData, onClose }: ContextPanelProps) {
  if (!selectedBubble && !comparisonData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-6 max-h-[40vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {comparisonData ? (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Comparison: <span className="text-blue-400">{comparisonData.word1}</span> vs{' '}
              <span className="text-purple-400">{comparisonData.word2}</span>
            </h2>

            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <h3 className="text-lg font-semibold text-white/90 mb-2">Key Differences</h3>
              <p className="text-white/70 leading-relaxed">{comparisonData.differences}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-blue-400 font-semibold mb-2">{comparisonData.word1}</h4>
                <p className="text-white/70 italic">&ldquo;{comparisonData.examples.word1}&rdquo;</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <h4 className="text-purple-400 font-semibold mb-2">{comparisonData.word2}</h4>
                <p className="text-white/70 italic">&ldquo;{comparisonData.examples.word2}&rdquo;</p>
              </div>
            </div>
          </div>
        ) : selectedBubble ? (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2">{selectedBubble.word}</h2>

            {isCenterWord(selectedBubble) && (
              <>
                <p className="text-white/60 mb-4">{selectedBubble.partOfSpeech}</p>
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <p className="text-white/80">{selectedBubble.definition}</p>
                </div>

                {selectedBubble.translations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white/90 mb-2">Translations</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBubble.translations.map((trans: Translation, idx: number) => (
                        <div
                          key={idx}
                          className={`px-3 py-2 rounded-lg ${
                            trans.isFalseFriend
                              ? 'bg-red-500/20 border border-red-500/40'
                              : trans.isCognate
                              ? 'bg-green-500/20 border border-green-500/40'
                              : 'bg-white/10 border border-white/20'
                          }`}
                        >
                          <span className="text-white/60 text-sm uppercase">{trans.language}:</span>{' '}
                          <span className="text-white font-medium">{trans.word}</span>
                          {trans.isFalseFriend && (
                            <span className="ml-2 text-xs text-red-400">⚠️ false friend</span>
                          )}
                          {trans.isCognate && <span className="ml-2 text-xs text-green-400">✓ cognate</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedBubble.example && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl p-4 mt-4">
                <h3 className="text-sm font-semibold text-white/70 mb-2">Usage Example</h3>
                <p className="text-white/90 italic">&ldquo;{selectedBubble.example}&rdquo;</p>
              </div>
            )}

            {selectedBubble.confusionRisk && (
              <div className="mt-4 flex items-center gap-2 text-orange-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">
                  {selectedBubble.confusionRisk === 'high'
                    ? 'High confusion risk - commonly mistaken'
                    : selectedBubble.confusionRisk === 'medium'
                    ? 'Medium confusion risk - similar connotations'
                    : 'Low confusion risk'}
                </span>
              </div>
            )}
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
