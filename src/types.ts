export type QuestionType =
  | 'multiple'
  | 'checkbox'
  | 'truefalse'
  | 'numeric'
  | 'match'
  | 'scale'
  | 'open';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GroupLetter = 'A' | 'B' | 'C';

export interface MatchPair {
  a: string;
  b: string;
}

export interface MediaAttachment {
  type: 'image' | 'video' | 'audio' | 'pdf' | 'link';
  url?: string;
  data?: string;
  size?: number;
  name?: string;
}

export interface SenaQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correct?: number | boolean;
  corrects?: number[];
  tolerance?: number;
  pairs?: MatchPair[];
  score: number;
  timeLimit?: number;
  category?: string;
  difficulty: Difficulty;
  feedback?: string;
  media?: MediaAttachment;
}

export interface Student {
  docType: string;
  docNumber: string;
  fullName: string;
  email: string;
}

export interface GradedDetail {
  earned: number;
  total: number;
  auto: boolean;
  pendingReview?: boolean;
}

export interface SubjectiveReview {
  status?: 'correct' | 'incorrect' | 'partial';
  earned?: number;
  feedback?: string;
}

export interface Attempt {
  id: string;
  student: Student;
  group: GroupLetter;
  difficulty: Difficulty;
  questions: SenaQuestion[];
  answers: Record<string, any>;
  gradedDetails: Record<string, GradedDetail>;
  autoScore: number;
  autoTotal: number;
  finalScore: number;
  finalTotal: number;
  reviewStatus: 'pending' | 'completed';
  reviews: Record<string, SubjectiveReview>;
  date: string;
  emailSentInitial?: boolean;
  emailSentFinal?: boolean;
}

export type ThemeMode = 'normal' | 'beige' | 'dark';

// Legacy compatibility types
export interface QuestionOption {
  id: string;
  option_key: string;
  option_text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  group_letter: any;
  category?: string;
  question_text: string;
  question_type: 'multiple_choice' | 'open_text';
  points: number;
  image_url?: string;
  options?: QuestionOption[];
}

export interface Candidate {
  id: string;
  doc_type: string;
  doc_number: string;
  full_name: string;
  email: string;
  group_letter: any;
  created_at: string;
  retry_allowed?: boolean;
  is_admin?: boolean;
}

export interface AssessmentAnswer {
  question_id: string;
  selected_option_id?: string;
  selected_option_index?: number;
  open_text?: string;
  is_correct?: boolean;
  points_awarded: number;
  feedback?: string;
}

export interface Assessment {
  id: string;
  candidate_id: string;
  phase?: 1 | 2;
  group_letter: any;
  started_at: string;
  completed_at?: string;
  status: any;
  score_obtained?: number;
  closed_score_obtained?: number;
  score_total?: number;
  percentage?: number;
  answers: AssessmentAnswer[];
  reviewer_notes?: string;
  [key: string]: any;
}

export interface SystemConfig {
  timer_enabled?: boolean;
  time_limit_minutes?: number;
  phase1_duration_seconds?: number;
  phase2_duration_seconds?: number;
  phase1_min_passing_percentage?: number;
  anti_cheat_window_blur_limit?: number;
  anti_cheat_paste_disabled?: boolean;
  [key: string]: any;
}

export interface EmailLog {
  id: string;
  assessment_id?: string;
  recipient_email: string;
  recipient_name: string;
  phase: any;
  subject: string;
  body_html: string;
  body_text?: string;
  sent_at: string;
  status_verdict?: string;
}

export interface RetryRequest {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email?: string;
  doc_number?: string;
  group_letter?: any;
  reason?: string;
  created_at?: string;
  requested_at?: string;
  status: any;
  assessment_id?: string;
  [key: string]: any;
}

