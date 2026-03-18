import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface ClaudeOptions {
  maxTokens?: number;
  temperature?: number;
}

export async function callClaude(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  options?: ClaudeOptions
): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model,
    max_tokens: options?.maxTokens ?? 2048,
    temperature: options?.temperature ?? 0.7,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Claude response');
  }

  return textBlock.text;
}

export async function callClaudeVision(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  imageBase64: string,
  options?: ClaudeOptions
): Promise<string> {
  const anthropic = getClient();

  let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
  if (imageBase64.startsWith('data:')) {
    const match = imageBase64.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,/);
    if (match?.[1]) {
      mediaType = match[1] as typeof mediaType;
    }
    imageBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  }

  const response = await anthropic.messages.create({
    model,
    max_tokens: options?.maxTokens ?? 2048,
    temperature: options?.temperature ?? 0.7,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: userPrompt,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Claude Vision response');
  }

  return textBlock.text;
}

export function parseClaudeJson<T>(text: string): T {
  // Strategy 1: Try parsing the full text as JSON
  try { return JSON.parse(text) as T; } catch { /* continue */ }

  // Strategy 2: Extract from code block
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock?.[1]) {
    try { return JSON.parse(codeBlock[1].trim()) as T; } catch { /* continue */ }
  }

  // Strategy 3: Lazy match for first complete JSON object
  const jsonMatch = text.match(/\{[\s\S]*?\}(?=[^}]*$|\s*$)/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]) as T; } catch { /* continue */ }
  }

  // Strategy 4: Greedy match as final fallback
  const greedyMatch = text.match(/\{[\s\S]*\}/);
  if (greedyMatch) {
    return JSON.parse(greedyMatch[0]) as T;
  }

  throw new Error('No JSON object found in Claude response');
}
