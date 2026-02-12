
export interface Speaker {
  name: string;
  designation: string;
  takeaways: string;
}

export interface AgendaItem {
  particulars: string;
  startTime: string;
  endTime: string;
  speaker: string;
  remarks: string;
  isActivity: boolean;
}

export interface WorkshopMetrics {
  participantCount: number;
  demographic: string;
}

export interface FeedbackSummary {
  averageRating: number; // 1-5
  qualitativeComments: string[];
}

export interface BudgetItem {
  description: string;
  amount: number;
}

export interface WorkshopBudget {
  allocated: number;
  expenses: BudgetItem[];
}

export interface Workshop {
  id: string;
  title: string;
  theme: string;
  category: string;
  lead: string;
  date: string;
  venue: string;
  frequency: 'Annual' | 'Bi-Annual' | 'One-time';
  agenda: AgendaItem[];
  speakers: Speaker[];
  activities: string[];
  metrics: WorkshopMetrics;
  feedback: FeedbackSummary;
  budget: WorkshopBudget;
  actionPlan: string[];
}

export enum WorkshopCategory {
  SecurityExcellence = 'Security Excellence',
  AILiteracy = 'AI Literacy',
  SpiritualCurriculum = 'Spiritual Curriculum',
  TeacherTraining = 'Teacher Training',
  LeadershipDevelopment = 'Leadership Development',
  AdministrativeExcellence = 'Administrative Excellence'
}
