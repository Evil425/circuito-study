export enum StudyStatus {
  PENDING = "PENDING",
  NEXT = "NEXT",
  LAST_STUDIED = "LAST_STUDIED"
}

export interface CircuitItem {
  id: string;
  subjectName: string;
  status: StudyStatus;
  studyCount?: number;
}
