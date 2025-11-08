import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { ComparisonData } from '@/types/word';

export async function POST(request: NextRequest) {
  try {
    const { word1, word2 } = await request.json();

    if (!word1 || !word2) {
      return NextResponse.json({ error: 'Both words are required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a linguistic expert explaining subtle differences between similar words.

Provide clear, concise explanations of how two words differ, including:
1. Nuanced meaning differences
2. Contextual usage differences
3. Minimal pair examples (sentences that differ by only one word)
4. Common mistakes learners make

Return ONLY valid JSON, no additional text.`,
        },
        {
          role: 'user',
          content: `Compare these words: "${word1}" vs "${word2}"

Return JSON in this format:
{
  "word1": "${word1}",
  "word2": "${word2}",
  "differences": "Clear explanation of how these words differ in meaning, connotation, and usage contexts. Include any important nuances.",
  "examples": {
    "word1": "Example sentence using ${word1} that highlights its specific usage",
    "word2": "Example sentence using ${word2} that highlights its specific usage and shows the contrast"
  }
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const comparison: ComparisonData = JSON.parse(content);

    return NextResponse.json(comparison);
  } catch (error: any) {
    console.error('Error comparing words:', error);
    return NextResponse.json(
      { error: 'Failed to compare words', details: error.message },
      { status: 500 }
    );
  }
}
