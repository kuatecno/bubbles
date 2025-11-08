import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { WordAnalysisResponse, WordBubble, CenterWord, BubbleColor, WordType } from '@/types/word';

export async function POST(request: NextRequest) {
  try {
    const { word, targetLanguages = ['es', 'fr', 'de'] } = await request.json();

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    // Use OpenAI to analyze the word and generate synonym/antonym bubbles
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a linguistic expert creating data for an interactive bubble dictionary visualization.

Your task is to analyze words and return structured JSON data for visualization.

For each word, provide:
1. Synonyms with multi-dimensional attributes (intensity, specificity, frequency, emotional valence, formality)
2. Antonyms
3. Translations in specified languages
4. Usage examples
5. Color coding based on confusion risk:
   - yellow: standard synonyms
   - orange: potentially confusing words (similar meaning but different connotations)
   - red: dangerous false friends or commonly mistaken
   - dark: antonyms

Important positioning guidelines:
- Distance from center = semantic similarity (0-1)
- AI should consider ALL attributes simultaneously for smart positioning
- Different word types (verbs, nouns, emotions) should cluster differently
- Provide x,y coordinates that reflect multi-dimensional relationships
- x,y should be in range -100 to 100 (center word is at 0,0)

Return ONLY valid JSON, no additional text.`,
        },
        {
          role: 'user',
          content: `Analyze the word "${word}" and provide translations in: ${targetLanguages.join(', ')}.

Return JSON in this exact format:
{
  "centerWord": {
    "id": "center",
    "word": "${word}",
    "type": "noun|verb|adjective|adverb|emotion|number|other",
    "color": "yellow",
    "position": { "x": 0, "y": 0 },
    "similarity": 1,
    "partOfSpeech": "detailed part of speech",
    "definition": "concise definition",
    "translations": [
      { "language": "es", "word": "translation", "isCognate": false, "isFalseFriend": false }
    ],
    "example": "usage example sentence",
    "attributes": {
      "intensity": 0.5,
      "specificity": 0.5,
      "frequency": 0.8,
      "emotionalValence": 0,
      "formality": 0.5
    }
  },
  "synonyms": [
    {
      "id": "syn1",
      "word": "synonym",
      "type": "noun|verb|adjective|etc",
      "color": "yellow|orange|red",
      "position": { "x": 20, "y": 15 },
      "similarity": 0.9,
      "example": "example sentence",
      "attributes": { "intensity": 0.5, "specificity": 0.6, "frequency": 0.7, "emotionalValence": 0, "formality": 0.5 },
      "confusionRisk": "low|medium|high"
    }
  ],
  "antonyms": [
    {
      "id": "ant1",
      "word": "antonym",
      "type": "noun|verb|adjective|etc",
      "color": "dark",
      "position": { "x": -80, "y": -60 },
      "similarity": 0,
      "isAntonym": true,
      "example": "example sentence",
      "attributes": { "intensity": 0.5, "specificity": 0.5, "frequency": 0.7, "emotionalValence": -0.8, "formality": 0.5 }
    }
  ]
}

Provide 8-12 synonyms and 3-5 antonyms. Use smart multi-dimensional positioning.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const analysis: WordAnalysisResponse = JSON.parse(content);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing word:', error);
    return NextResponse.json(
      { error: 'Failed to analyze word', details: error.message },
      { status: 500 }
    );
  }
}
