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
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in Claude response');
  }
  return JSON.parse(jsonMatch[0]) as T;
}
