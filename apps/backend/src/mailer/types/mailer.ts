
export interface MailerOptions {
  to: string | string[];
  subject: string;
  html?: string;
  template?: string;
  templateData?: Record<string, unknown>;
  attachments?: EmailAttachment[];
  metadata?: EmailMetadata;
}


export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  cid?: string; // Content-ID for embedding images
}


export interface EmailMetadata {
  platformName?: string;
  platformIcon?: string;
  platformUrl?: string;
  workspaceName?: string;
  workspaceIcon?: string;
  workspaceUrl?: string;
  [key: string]: string | number | boolean | null | undefined; // Allow additional custom metadata
}

export interface EmailLog {
  success: boolean;
  to: string | string[];
  subject: string;
  template?: string;
  error?: string;
  metadata?: EmailMetadata;
  timestamp: Date;
  retryAttempts?: number;
}

export interface BulkMailResponse {
  total: number;
  success: number;
  failed: number;
  errors: EmailError[];
}


export interface EmailError {
  to: string;
  error: string;
  retryable?: boolean;
}


export interface SMTPError extends Error {
  code?: string;
  response?: string;
  responseCode?: number;
  command?: string;
}


export interface EmailTemplate {
  subject: string;
  html: string;
}


export type TemplateBuilder = (data: Record<string, unknown>) => EmailTemplate;


export interface QueueStatus {
  size: number;
  isProcessing: boolean;
  isHealthy: boolean;
  failureRate: number;
}


export interface RetryConfig {
  maxRetries: number;
  retryDelays: number[]; 
}


export interface EmailServiceConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: {
    name: string;
    email: string;
  };
  concurrent: number;
  rateLimit: number;
  preview?: boolean;
}

export type TemplateCategory = 'AUTH' | 'USER' | 'BOOKING';


/** Payload for lecturer assigned emails */
export interface LecturerAssignedPayload {
  fullName?: string | null;
  courseTitle: string;
  assignedBy?: string | null;
  courseUrl?: string;
  institutionName?: string | null;
  platformName?: string;
}
