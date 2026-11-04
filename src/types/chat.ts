export type ModelProvider = 'google' | 'openai' | 'anthropic' | 'simulated';

export interface AIModelOption {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  badge?: string;
  contextWindow?: string;
  isPopular?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: string;
  timestamp: number;
  model?: string;
  provider?: ModelProvider;
  tokens?: number;
  isStreaming?: boolean;
  error?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  modelId: string;
  isPinned?: boolean;
  systemPrompt?: string;
}

export type PersonaType = 'default' | 'developer' | 'architect' | 'academic' | 'creative' | 'custom';

export interface UserSettings {
  geminiApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  selectedModelId: string;
  temperature: number;
  systemPrompt: string;
  theme: 'system' | 'dark' | 'light';
  streamResponse: boolean;
  persona: PersonaType;
}

export const AVAILABLE_MODELS: AIModelOption[] = [
  // Google Gemini
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    description: 'Ultra-fast multimodal reasoning with next-gen speed & efficiency',
    badge: 'Fast & Smart',
    contextWindow: '1M Tokens',
    isPopular: true,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    description: 'Advanced reasoning, deep problem-solving and complex software engineering',
    badge: 'High Reasoning',
    contextWindow: '2M Tokens',
    isPopular: true,
  },
  // OpenAI
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Omni)',
    provider: 'openai',
    description: 'Flagship versatile model for coding, logic, and comprehensive knowledge',
    badge: 'Flagship',
    contextWindow: '128K Tokens',
    isPopular: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast, lightweight intelligence for rapid coding and daily queries',
    badge: 'Lightweight',
    contextWindow: '128K Tokens',
  },
  // Anthropic
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    description: 'State-of-the-art hybrid reasoning with extended thinking capabilities',
    badge: 'Deep Thinking',
    contextWindow: '200K Tokens',
    isPopular: true,
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Exceptional architectural analysis, nuanced writing, and visual reasoning',
    badge: 'Architect',
    contextWindow: '200K Tokens',
  },
];

export const PERSONA_PROMPTS: Record<PersonaType, string> = {
  default: 'You are an intelligent, helpful, and concise AI assistant with deep expertise in software engineering, mathematics, and science.',
  developer: 'You are a Senior Principal Software Engineer. Provide robust, production-grade code, explicit type definitions, error boundaries, and benchmarked architectural patterns.',
  architect: 'You are an Enterprise Cloud & Distributed Systems Architect. Focus on high-availability, fault-tolerance, low-latency microservices, security compliance, and scalable design.',
  academic: 'You are a Research Scientist and Academic Scholar. Provide rigorous derivations, formal definitions, KaTeX mathematical notations, and peer-reviewed scientific methodology.',
  creative: 'You are a Creative Technologist and Narrative Designer. Craft compelling, imaginative, and engaging narratives with striking metaphors and vivid detail.',
  custom: '',
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  geminiApiKey: '',
  openaiApiKey: '',
  anthropicApiKey: '',
  selectedModelId: 'gemini-2.5-flash',
  temperature: 0.7,
  systemPrompt: PERSONA_PROMPTS.default,
  theme: 'dark',
  streamResponse: true,
  persona: 'default',
};
