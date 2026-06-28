export interface Milestone {
  id: string;
  text: string;
  durationMin: number;
  focusType: 'High Focus' | 'Design Work' | 'Admin' | 'Routine' | 'Creative';
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project?: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string; // e.g. "2026-06-24T14:30:00"
  estimatedHours: number;
  completedAt?: string;
  milestones: Milestone[];
  riskLevel: 'LOW' | 'MONITORING' | 'HIGH';
  riskReason?: string;
}

export interface Habit {
  id: string;
  name: string;
  category: 'Physical' | 'Mental' | 'Personal' | 'Professional';
  streak: number;
  history: { [date: string]: boolean }; // e.g. { "2026-06-23": true }
  frequency: 'daily' | 'weekly';
}

export interface Goal {
  id: string;
  title: string;
  target: string;
  current: string;
  progress: number; // 0 to 100
  category: string;
}

export interface AIProposal {
  id: string;
  type: 'RESCHEDULE' | 'BATCH' | 'POSTPONE';
  targetTaskId: string;
  targetTaskTitle: string;
  title: string;
  description: string;
  applied: boolean;
}

export interface AutonomySettings {
  level: 'Assistant' | 'Co-Pilot' | 'Autopilot';
  optimizationAggression: number; // 0 to 100
  interruptDoNotDisturb: boolean;
  smsFallback: boolean;
  morningBrief: boolean;
  contextualReminders: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string; // e.g. "11:00 AM"
  type: 'AI_ASSISTANT' | 'SYSTEM_ALERT' | 'USER_ACTION';
  message: string;
}

export interface ProfileData {
  name: string;
  role: string;
  location: string;
  avatarUrl: string;
  email: string;
  phone: string;
  timezone: string;
  twoFactorEnabled: boolean;
  subscriptionTier: string;
}

