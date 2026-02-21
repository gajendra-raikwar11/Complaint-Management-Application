
export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export enum ComplaintCategory {
  ACADEMIC = 'Academic',
  HOSTEL = 'Hostel',
  MAINTENANCE = 'Maintenance',
  FINANCE = 'Finance',
  OTHERS = 'Others'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum Sentiment {
  URGENT = 'Urgent',
  FRUSTRATED = 'Frustrated',
  NEUTRAL = 'Neutral',
  CONSTRUCTIVE = 'Constructive'
}

export enum NotificationType {
  STATUS_CHANGE = 'STATUS_CHANGE',
  NEW_COMMENT = 'NEW_COMMENT',
  SYSTEM = 'SYSTEM'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: Priority;
  status: ComplaintStatus;
  sentiment?: Sentiment;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  aiSummary?: string;
  rating?: number;
  attachmentUrl?: string;
}

export interface AnalyticsReport {
  trendSummary: string;
  keyInsights: string[];
  sentimentScore: number;
}
