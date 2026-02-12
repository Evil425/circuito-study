
import { Subject, CircuitItem, StudyStatus } from './types';

export const INITIAL_SUBJECTS: string[] = [
  'Português e Redação Oficial',
  'Seguridade Social',
  'Raciocínio Lógico Matemático',
  'Informática',
  'Direito Administrativo',
  'Direito Constitucional'
];

export const INITIAL_CIRCUIT: CircuitItem[] = [
  { id: '1', subjectName: 'Português e Redação Oficial', status: StudyStatus.PENDING },
  { id: '2', subjectName: 'Seguridade Social', status: StudyStatus.LAST_STUDIED },
  { id: '3', subjectName: 'Português e Redação Oficial', status: StudyStatus.PENDING },
  { id: '4', subjectName: 'Raciocínio Lógico Matemático', status: StudyStatus.PENDING },
  { id: '5', subjectName: 'Português e Redação Oficial', status: StudyStatus.PENDING },
  { id: '6', subjectName: 'Informática', status: StudyStatus.NEXT },
  { id: '7', subjectName: 'Português e Redação Oficial', status: StudyStatus.PENDING },
  { id: '8', subjectName: 'Raciocínio Lógico Matemático', status: StudyStatus.PENDING },
  { id: '9', subjectName: 'Seguridade Social', status: StudyStatus.PENDING },
  { id: '10', subjectName: 'Informática', status: StudyStatus.PENDING },
  { id: '11', subjectName: 'Direito Administrativo', status: StudyStatus.PENDING },
];
