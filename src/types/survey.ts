export type SurveyType = 'principios' | 'ambiente_seguro' | 'job_description' | 'engagement';

export interface QuestionDetail {
  id: string;
  questionText: string;
  pointsObtained: number;
  maxPoints: number;
  userAnswer: string;
  comments?: string;
  isCorrect: boolean;
}

export interface ParticipantResponse {
  id: string | number;
  surveyType?: SurveyType;
  name: string;
  email: string;
  identification: string;
  regional: string;
  city: string;
  operator: string;
  cargo: string;
  trainingType: string;
  startTime: string;
  endTime: string;
  year: string;
  month: string;
  durationMinutes: number;
  totalPoints: number;
  maxPointsPossible: number;
  scorePercentage: number;
  statusType: 'PROMOTOR' | 'NEUTRO' | 'DETRACTOR';
  passed: boolean;
  generalComments?: string;
  questions: QuestionDetail[];
  rawRow: Record<string, any>;
}

export interface QuestionAnalysis {
  questionText: string;
  maxPoints: number;
  totalAttempts: number;
  correctCount: number;
  partialCount: number;
  failedCount: number;
  avgPointsObtained: number;
  successRate: number; // 0 to 100
  failedParticipants: {
    participantId: string | number;
    name: string;
    regional: string;
    userAnswer: string;
    pointsObtained: number;
  }[];
}

export interface FilterState {
  regional: string;
  city: string;
  operator: string;
  cargo: string;
  trainingType: string;
  year: string;
  month: string;
  status: 'ALL' | 'PASSED' | 'FAILED';
  satisfaction: 'ALL' | 'PROMOTOR' | 'NEUTRO' | 'DETRACTOR';
  searchTerm: string;
}

export interface SurveySummary {
  totalParticipants: number;
  passedCount: number;
  failedCount: number;
  promotersCount: number;
  neutralsCount: number;
  detractorsCount: number;
  satisfactionPercentage: number;
  passRate: number;
  averageScore: number;
  averageMaxScore: number;
  averagePercentage: number;
  averageDurationMinutes: number;
  passingScorePercent: number;
  inicialCount: number;
  reentrenamientoCount: number;
  npsScore: number;
}
