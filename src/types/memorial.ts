import type { Person } from './familyTree';

export interface MemorialElement {
  id: string;
  type: 'avatar' | 'name' | 'photo' | 'text' | 'qrcode';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  data: any;
}

export interface MemorialLayout {
  id: string;
  name: string;
  type: 'classic' | 'modern' | 'minimal' | 'festive';
  backgroundColor: string;
  backgroundImage?: string;
  elements: MemorialElement[];
  createdAt: string;
  updatedAt: string;
}

export interface MemorialPoster {
  id: string;
  familyName: string;
  familyMotto?: string;
  selectedMembers: Person[];
  layout: MemorialLayout;
  qrCodeData?: string;
  createdAt: string;
}

export interface PosterTemplate {
  id: string;
  name: string;
  type: 'classic' | 'modern' | 'minimal' | 'festive';
  description: string;
  preview: string;
  defaultLayout: Partial<MemorialLayout>;
}

export const POSTER_TEMPLATES: PosterTemplate[] = [
  {
    id: 'classic',
    name: '经典典雅',
    type: 'classic',
    description: '传统中式风格，庄重大气',
    preview: '🏮',
    defaultLayout: {
      backgroundColor: '#FFF8E7',
      elements: [],
    },
  },
  {
    id: 'modern',
    name: '现代简约',
    type: 'modern',
    description: '简洁线条，北欧风格',
    preview: '✨',
    defaultLayout: {
      backgroundColor: '#F5F5F5',
      elements: [],
    },
  },
  {
    id: 'minimal',
    name: '极简黑白',
    type: 'minimal',
    description: '黑白配色，简约而不简单',
    preview: '⬛',
    defaultLayout: {
      backgroundColor: '#1A1A1A',
      elements: [],
    },
  },
  {
    id: 'festive',
    name: '喜庆红金',
    type: 'festive',
    description: '红金配色，喜庆祥和',
    preview: '🎊',
    defaultLayout: {
      backgroundColor: '#FF4444',
      elements: [],
    },
  },
];
