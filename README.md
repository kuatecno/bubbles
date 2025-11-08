# Bubble Dictionary 🫧

A revolutionary AI-powered visual dictionary that displays words as interactive bubbles, showing semantic relationships, synonyms, antonyms, and translations in an intuitive 360° space.

## Features

### Phase 1 (MVP) ✅
- **Smart Bubble Visualization**: AI-powered positioning considering multiple linguistic dimensions
  - Semantic similarity (distance from center)
  - Intensity, specificity, frequency, emotional valence (360° positioning)
  - Adaptive clustering based on word type (verbs, nouns, emotions, etc.)

- **Color Coding System**:
  - 🟡 **Yellow**: Standard synonyms
  - 🟠 **Orange**: Potentially confusing words
  - 🔴 **Red**: Dangerous false friends / commonly mistaken
  - ⚫ **Dark**: Antonyms (outside main circle)

- **Multilingual Translations**:
  - Automatic translations in Spanish, French, German, Portuguese, Italian
  - Cognate highlighting
  - False friend warnings

- **Interactive Context**:
  - Click once: View usage examples and word details
  - Click twice: Recenter on new word + compare with previous

### Phase 2 (Planned)
- Intensity spectrum visualization with color gradients
- Collocation satellites
- AI-powered confusion preventer
- Personal vocabulary journey map

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with glassmorphism effects
- **D3.js** - Physics-based bubble simulation
- **Framer Motion** - Smooth animations
- **OpenAI GPT-4** - AI-powered linguistic analysis

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bubbledictionary
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project to Vercel
3. Add your `OPENAI_API_KEY` environment variable in Vercel settings
4. Deploy!

The app is optimized for Vercel deployment with automatic builds and serverless functions.

## Project Structure

```
bubbledictionary/
├── app/
│   ├── api/
│   │   ├── words/route.ts       # OpenAI word analysis API
│   │   └── compare/route.ts     # Word comparison API
│   ├── page.tsx                 # Main page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── SearchBar.tsx            # Search input component
│   ├── BubbleCanvas.tsx         # Main visualization canvas
│   ├── WordBubble.tsx           # Individual bubble component
│   └── ContextPanel.tsx         # Details/comparison panel
├── lib/
│   └── openai.ts               # OpenAI client setup
└── types/
    └── word.ts                 # TypeScript interfaces
```

## How It Works

1. **User searches for a word** → SearchBar component
2. **API calls OpenAI GPT-4** → Analyzes the word across multiple dimensions
3. **AI generates response** → Synonyms, antonyms, translations, positioning data
4. **Bubbles render** → D3.js physics simulation positions bubbles in 360° space
5. **User interacts** → Click for details, click again to recenter and compare

## API Routes

### POST /api/words
Analyzes a word and returns synonyms, antonyms, and translations with AI-powered positioning.

**Request:**
```json
{
  "word": "happy",
  "targetLanguages": ["es", "fr", "de"]
}
```

**Response:**
```json
{
  "centerWord": { /* word data */ },
  "synonyms": [ /* array of bubbles */ ],
  "antonyms": [ /* array of bubbles */ ]
}
```

### POST /api/compare
Compares two words and explains their differences.

**Request:**
```json
{
  "word1": "happy",
  "word2": "joyful"
}
```

## License

MIT

## Credits

Built with Claude Code by Anthropic
