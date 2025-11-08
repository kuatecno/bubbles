'use client';

import { motion } from 'framer-motion';
import { WordBubble as WordBubbleType } from '@/types/word';

interface WordBubbleProps {
  bubble: WordBubbleType;
  isCenter?: boolean;
  onClick?: () => void;
  scale?: number;
}

const getColorClasses = (color: string, isCenter: boolean) => {
  const baseClasses = 'backdrop-blur-md border transition-all duration-300 cursor-pointer';

  if (isCenter) {
    return `${baseClasses} bg-gradient-to-br from-blue-500/30 to-purple-600/30 border-blue-400/50 shadow-xl shadow-blue-500/20`;
  }

  switch (color) {
    case 'yellow':
      return `${baseClasses} bg-yellow-400/20 border-yellow-400/40 hover:bg-yellow-400/30`;
    case 'orange':
      return `${baseClasses} bg-orange-500/20 border-orange-500/40 hover:bg-orange-500/30`;
    case 'red':
      return `${baseClasses} bg-red-500/20 border-red-500/40 hover:bg-red-500/30`;
    case 'dark':
      return `${baseClasses} bg-gray-900/40 border-gray-700/60 hover:bg-gray-900/50`;
    default:
      return `${baseClasses} bg-white/10 border-white/20 hover:bg-white/20`;
  }
};

const getTextColor = (color: string, isCenter: boolean) => {
  if (isCenter) return 'text-white font-bold';
  return color === 'dark' ? 'text-gray-200' : 'text-white';
};

export default function WordBubble({ bubble, isCenter = false, onClick, scale = 1 }: WordBubbleProps) {
  // Smaller sizing for more bubbles
  const size = isCenter ? 100 : 50 + (bubble.similarity * 12);
  const fontSize = isCenter ? 'text-base' : bubble.similarity > 0.85 ? 'text-xs' : 'text-[10px]';
  const padding = isCenter ? 'p-3' : 'p-1.5';

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: scale, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: bubble.id === 'center' ? 0 : Math.random() * 0.2
      }}
      whileHover={{ scale: scale * 1.15, zIndex: 50 }}
      whileTap={{ scale: scale * 0.95 }}
      onClick={onClick}
      className={`
        absolute rounded-full flex items-center justify-center text-center
        ${getColorClasses(bubble.color, isCenter)}
        ${getTextColor(bubble.color, isCenter)}
        ${fontSize}
        ${padding}
      `}
      style={{
        width: size,
        height: size,
        left: `calc(50% + ${bubble.position.x}px - ${size / 2}px)`,
        top: `calc(50% + ${bubble.position.y}px - ${size / 2}px)`,
      }}
    >
      <div className="select-none leading-tight">
        {bubble.word}
        {isCenter && (
          <div className="text-[10px] font-normal mt-1 opacity-60">
            click to explore
          </div>
        )}
      </div>
    </motion.div>
  );
}
