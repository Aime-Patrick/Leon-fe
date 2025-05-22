export type EmailFolder =
  | "INBOX"
  | "SENT"
  | "DRAFT"
  | "TRASH"
  | "SPAM"
  | "STARRED"
  | "inbox"
  | "sent"
  | "draft"
  | "trash"
  | "spam"
  | "starred";

export interface Email {
  id: string;
  from: string;
  to?: string[];
  subject: string;
  snippet: string;
  date: string;
  isRead: boolean;
  isStarred?: boolean;
  labels?: string[];
  images?: string | string[];
}

export interface ComposeEmail {
  to: string | string[]; // allow either
  subject: string;
  body: string;
}

export interface EmailDetails extends Email {
  body: string;
  attachments: {
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
  }[];
}
