export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export enum ModelId {
  GATEWAY_AUTO = 'gateway-auto', // Router
  DEEPSEEK_V3 = 'deepseek-v3', // Complex/Reasoning mapped to Pro
  QWEN_MAX = 'qwen-max', // Thinking/Logic mapped to Pro+Thinking
  DOUBAO_PRO = 'doubao-pro', // Chat/Daily mapped to Flash
  KLING_AI = 'kling-ai', // Drawing/Creative mapped to Flash Image
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  usedModel?: string; // To track which model the gateway selected
  attachments?: string[]; // Array of base64 data URLs
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
}

export type Theme = 'light' | 'dark';