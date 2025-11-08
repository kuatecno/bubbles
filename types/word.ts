export type BubbleColor = 'yellow' | 'orange' | 'red' | 'dark';

export type WordType = 'noun' | 'verb' | 'adjective' | 'adverb' | 'emotion' | 'number' | 'other';

export interface Translation {
  language: string;
  word: string;
  isCognate?: boolean;
  isFalseFriend?: boolean;
}

export interface WordBubble {
  id: string;
  word: string;
  type: WordType;
  color: BubbleColor;
  position: {
    x: number;
    y: number;
  };
  // Semantic similarity to center word (0-1)
  similarity: number;
  // Usage example
  example?: string;
  // Multi-dimensional attributes (used by AI for positioning)
  attributes: {
    intensity?: number; // 0-1 scale (mild to extreme)
    specificity?: number; // 0-1 scale (general to specific)
    frequency?: number; // 0-1 scale (rare to common)
    emotionalValence?: number; // -1 to 1 (negative to positive)
    formality?: number; // 0-1 scale (casual to formal)
  };
  // For antonyms
  isAntonym?: boolean;
  // For false friends / confusing words
  confusionRisk?: 'low' | 'medium' | 'high';
}

export interface CenterWord extends WordBubble {
  translations: Translation[];
  partOfSpeech: string;
  definition: string;
}

export interface WordAnalysisRequest {
  word: string;
  targetLanguages?: string[];
}

export interface WordAnalysisResponse {
  centerWord: CenterWord;
  synonyms: WordBubble[];
  antonyms: WordBubble[];
}

export interface ComparisonData {
  word1: string;
  word2: string;
  differences: string;
  examples: {
    word1: string;
    word2: string;
  };
}
