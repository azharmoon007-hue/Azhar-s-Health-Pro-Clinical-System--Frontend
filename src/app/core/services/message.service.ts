import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Conversation, Message, SendMessageRequest, ApiResponse } from '../models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    participantOneId: 3,
    participantOneName: 'Sophia Rodriguez',
    participantOneRole: 'PATIENT',
    participantTwoId: 2,
    participantTwoName: 'Dr. Marcus Chen',
    participantTwoRole: 'DOCTOR',
    lastMessage: 'Your latest ECG looks stable. Continue with the current Metoprolol dosage.',
    lastMessageTime: '2024-02-18T14:32:00Z',
    unreadCount: 0,
    otherParticipant: {
      id: 2,
      name: 'Dr. Marcus Chen',
      role: 'Cardiologist',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
      isOnline: true
    }
  },
  {
    id: 2,
    participantOneId: 3,
    participantOneName: 'Sophia Rodriguez',
    participantOneRole: 'PATIENT',
    participantTwoId: 14,
    participantTwoName: 'Dr. Elena Vasquez',
    participantTwoRole: 'DOCTOR',
    lastMessage: 'Please send a quick photo of the forearm if redness persists past 48 hours.',
    lastMessageTime: '2024-02-17T09:10:00Z',
    unreadCount: 1,
    otherParticipant: {
      id: 14,
      name: 'Dr. Elena Vasquez',
      role: 'Dermatologist',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      isOnline: false
    }
  }
];

const MOCK_MESSAGES: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      conversationId: 1,
      senderId: 3,
      senderName: 'Sophia Rodriguez',
      senderRole: 'PATIENT',
      receiverId: 2,
      receiverName: 'Dr. Marcus Chen',
      content: 'Hello Dr. Chen, I had a quick question regarding my morning Metoprolol. Should I take it before or after breakfast?',
      sentAt: '2024-02-18T10:15:00Z',
      isRead: true
    },
    {
      id: 2,
      conversationId: 1,
      senderId: 2,
      senderName: 'Dr. Marcus Chen',
      senderRole: 'DOCTOR',
      receiverId: 3,
      receiverName: 'Sophia Rodriguez',
      content: 'Hello Sophia. It is best taken with or immediately after your meal to ensure optimal absorption and avoid mild lightheadedness.',
      sentAt: '2024-02-18T11:02:00Z',
      isRead: true
    },
    {
      id: 3,
      conversationId: 1,
      senderId: 3,
      senderName: 'Sophia Rodriguez',
      senderRole: 'PATIENT',
      receiverId: 2,
      receiverName: 'Dr. Marcus Chen',
      content: 'Understood, thank you! I have uploaded the home BP readings log as an attachment.',
      sentAt: '2024-02-18T12:40:00Z',
      isRead: true,
      attachments: [
        {
          fileName: 'Weekly_BP_Log_Feb.pdf',
          fileUrl: 'https://example.com/files/bp_log.pdf',
          fileType: 'application/pdf',
          fileSize: 145000
        }
      ]
    },
    {
      id: 4,
      conversationId: 1,
      senderId: 2,
      senderName: 'Dr. Marcus Chen',
      senderRole: 'DOCTOR',
      receiverId: 3,
      receiverName: 'Sophia Rodriguez',
      content: 'Your latest ECG looks stable. Continue with the current Metoprolol dosage.',
      sentAt: '2024-02-18T14:32:00Z',
      isRead: true
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private mockConversations = [...MOCK_CONVERSATIONS];
  private mockMessages = { ...MOCK_MESSAGES };

  // Architecture ready for WebSocket subscription
  private messageStream = new Subject<Message>();
  readonly incomingMessage$ = this.messageStream.asObservable();

  getConversations(): Observable<Conversation[]> {
    const url = `${this.baseUrl}${API_ENDPOINTS.MESSAGES.CONVERSATIONS}`;
    return this.http.get<ApiResponse<Conversation[]> | Conversation[]>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Conversation[]>).data : res)),
      catchError(() => of(this.mockConversations))
    );
  }

  getMessages(conversationId: number): Observable<Message[]> {
    const url = `${this.baseUrl}${API_ENDPOINTS.MESSAGES.BY_CONVERSATION(conversationId)}`;
    return this.http.get<ApiResponse<Message[]> | Message[]>(url).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Message[]>).data : res)),
      catchError(() => of(this.mockMessages[conversationId] || []))
    );
  }

  sendMessage(request: SendMessageRequest & { senderId: number; senderName: string; senderRole: string; receiverName?: string }): Observable<Message> {
    const url = `${this.baseUrl}${API_ENDPOINTS.MESSAGES.BASE}`;
    return this.http.post<ApiResponse<Message> | Message>(url, request).pipe(
      map(res => ('data' in res ? (res as ApiResponse<Message>).data : res)),
      catchError(() => {
        const convId = request.conversationId || 1;
        const newMsg: Message = {
          id: Date.now(),
          conversationId: convId,
          senderId: request.senderId,
          senderName: request.senderName,
          senderRole: request.senderRole,
          receiverId: request.receiverId,
          receiverName: request.receiverName || 'Recipient',
          content: request.content,
          sentAt: new Date().toISOString(),
          isRead: false,
          attachments: request.attachments
        };

        if (!this.mockMessages[convId]) {
          this.mockMessages[convId] = [];
        }
        this.mockMessages[convId].push(newMsg);

        // Update conversation preview
        const conv = this.mockConversations.find(c => c.id === convId);
        if (conv) {
          conv.lastMessage = request.content;
          conv.lastMessageTime = newMsg.sentAt;
        }

        // Notify stream for WebSocket-style reactivity
        this.messageStream.next(newMsg);
        return of(newMsg);
      })
    );
  }
}
