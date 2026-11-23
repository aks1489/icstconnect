export interface MailboxActionResult {
  success: boolean
  message?: string
  error?: string
}

export interface MailboxSyncResult {
  success: boolean
  message?: string
  syncedCount?: number
  lastSyncTimestamp?: number
  skipped?: boolean
  error?: string
}

export interface MailboxMessagesResult {
  success: boolean
  folder: string
  total: number
  unreadCount: number
  messages: any[]
  error?: string
}

export interface SendEmailPayload {
  to: string
  subject: string
  html: string
  text?: string
  inReplyTo?: string
  references?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  message?: string
  error?: string
}

export interface ActionPayload {
  messageId?: string
  action: 'read' | 'unread' | 'star' | 'unstar' | 'trash' | 'restore' | 'delete_permanent' | 'empty_trash'
  value?: boolean
}

export declare const inMemoryMailbox: Map<string, any>
export declare const permanentlyDeletedIds: Set<string>
export declare const resolvedFolders: {
  inbox: string
  trash: string
  all: string
  sent: string
  starred: string
}

export declare function normId(id?: string): string
export declare function htmlToPlainText(html?: string): string
export declare function getTransporter(): any
export declare function getImapClient(): any
export declare function getSupabaseClient(): any
export declare function detectGmailFolders(client: any): Promise<typeof resolvedFolders>
export declare function executeImapAction(action: string, messageId?: string, value?: boolean): Promise<MailboxActionResult>
export declare function performImapSync(): Promise<MailboxSyncResult>
export declare function getMailboxMessages(folder?: string, search?: string): Promise<MailboxMessagesResult>
export declare function sendMailboxEmail(payload: SendEmailPayload): Promise<SendEmailResult>
export declare function updateMessageAction(payload: ActionPayload): Promise<MailboxActionResult>
export declare function startBackgroundSync(intervalMs?: number): void
