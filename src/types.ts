/**
 * MeetLog TypeScript Type System Configurations
 */

export interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  completed: boolean;
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  durationSec: number;
  project: string; // matches Project name or ID
  summary: string;
  topics: string[];
  actionItems: ActionItem[];
  transcript: TranscriptSegment[];
  tags: string[];
  audioUrl?: string; // local playback blob URL if available
  isPending?: boolean; // currently processing or waiting for online retry
  isFailed?: boolean; // failed to analyze with AI, saved only as raw local backup
  insights?: string[];
  nextTouchpoints?: string[];
  
  // Echo AI Organizer Organizer pipeline schema fields
  snapshot?: string;
  classification?: {
    primary: string;
    secondary: string[];
  };
  participantsInfo?: {
    name: string;
    role?: string;
    share?: string;
    matchStatus?: "Matched" | "Probable" | "Unknown";
  }[];
  decisions?: {
    decision: string;
    agreedBy: string;
  }[];
  checklist?: string[];
  openQuestions?: {
    question: string;
    raisedBy?: string;
  }[];
  memoryUpdates?: string[];
  ownerName?: string;
  ownerRole?: string;
  statedContext?: string;
  customPrompt?: string;
  cbtPsychologist?: boolean;
  reflectionCbt?: string;
  // Companion reflection modes
  negotiationCoach?: boolean;
  reflectionNegotiation?: string;
  performanceReviewLens?: boolean;
  reflectionPerformance?: string;
  difficultConversationDebrief?: boolean;
  reflectionDebrief?: string;
  // Personal Assistant mode
  personalAssistant?: boolean;
  personalAssistantOutput?: string;
  personalAssistantActions?: AssistantAction[];
}

export interface AssistantAction {
  platform: "openclaw" | "google_spark" | "email" | "whatsapp" | "google_tasks";
  title: string;
  details: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface TagMetric {
  tag: string;
  count: number;
}

export interface ProjectMetric {
  project: string;
  count: number;
  duration: number; // total duration in minutes
}

export type ActiveTab = "home" | "record" | "projects" | "relations" | "analytics" | "profile";
