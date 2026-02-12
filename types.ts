
export enum StudyStatus {
  LAST_STUDIED = 'ÚLTIMA ESTUDADA',
  NEXT = 'PRÓXIMA',
  PENDING = 'PENDENTE'
}

export interface Subject {
  id: string;
  name: string;
}

export interface CircuitItem {
  id: string;
  subjectName: string;
  status: StudyStatus;
  studyCount?: number; // Contador de quantas vezes esta instância foi completada
}

export interface ReviewContent {
  id: string;
  subject: string;
  topic: string;
  notes: string;
  lastReviewDate: string; // ISO string
  stage: number; // 1: 24h, 2: 7d, 3: 15d, 4: 30d+
  createdAt: string;
}

export interface WrongQuestion {
  id: string;
  subject: string;
  questionRef: string;
  notes: string;
  lastReviewDate: string;
  stage: number;
  createdAt: string;
}

export interface Simulado {
  id: string;
  name: string;
  totalQuestions: number;
  correctAnswers: number;
  date: string;
}

export interface Profile {
  id: string;
  name: string;
  circuit: CircuitItem[];
  performanceData: any[];
  simulados: Simulado[];
  reviewContents: ReviewContent[];
  wrongQuestions: WrongQuestion[];
}

export type ViewType = 'dashboard' | 'circuit' | 'activity' | 'simulados' | 'timer' | 'summary' | 'review';
