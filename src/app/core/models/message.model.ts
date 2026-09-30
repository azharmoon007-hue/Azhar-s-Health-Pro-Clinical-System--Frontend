export interface MessageAttachment {
  id?: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  receiverId: number;
  receiverName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  attachments?: MessageAttachment[];
}

export interface Conversation {
  id: number;
  participantOneId: number;
  participantOneName: string;
  participantOneRole: string;
  participantTwoId: number;
  participantTwoName: string;
  participantTwoRole: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  otherParticipant?: {
    id: number;
    name: string;
    role: string;
    avatarUrl?: string;
    isOnline?: boolean;
  };
}

export interface SendMessageRequest {
  conversationId?: number;
  receiverId: number;
  content: string;
  attachments?: MessageAttachment[];
}
