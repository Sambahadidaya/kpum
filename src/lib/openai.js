import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || '';

export const openai = new OpenAI({
  apiKey: apiKey,
});

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
