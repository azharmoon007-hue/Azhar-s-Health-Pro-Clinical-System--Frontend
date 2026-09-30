import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { MessageService } from '../../../core/services/message.service';
import { AuthService } from '../../../core/services/auth.service';
import { Conversation, Message, MessageAttachment } from '../../../core/models';

@Component({
  selector: 'app-messages-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  template: `
    <div class="chat-page">
      <div class="chat-layout card-glass">
        <!-- Left: Conversations List -->
        <aside class="conversations-pane">
          <div class="conversations-header">
            <h3>Direct Messages</h3>
            <span class="online-indicator">Real-Time</span>
          </div>

          <div class="conversations-list">
            <div
              *ngFor="let c of conversations"
              class="conversation-item"
              [class.active]="selectedConversation?.id === c.id"
              (click)="selectConversation(c)"
            >
              <div class="participant-avatar">
                {{ c.otherParticipant?.name?.charAt(0) || 'D' }}
                <span class="active-dot" *ngIf="c.otherParticipant?.isOnline"></span>
              </div>
              <div class="conv-info">
                <div class="name-time">
                  <strong>{{ c.otherParticipant?.name }}</strong>
                  <span class="time">{{ c.lastMessageTime | date:'shortTime' }}</span>
                </div>
                <span class="role-desc">{{ c.otherParticipant?.role }}</span>
                <p class="preview-msg">{{ c.lastMessage }}</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Right: Chat Window & Input Area -->
        <main class="chat-main" *ngIf="selectedConversation">
          <!-- Active Conversation Header -->
          <div class="chat-header">
            <div class="chat-participant">
              <div class="avatar-circle">
                {{ selectedConversation.otherParticipant?.name?.charAt(0) || 'D' }}
              </div>
              <div>
                <h4>{{ selectedConversation.otherParticipant?.name }}</h4>
                <span class="sub-status">{{ selectedConversation.otherParticipant?.role }} • HIPAA Secured Channel</span>
              </div>
            </div>
          </div>

          <!-- Messages Stream Viewport -->
          <div class="messages-viewport" #messagesViewport>
            <div
              *ngFor="let msg of messages"
              class="message-bubble-wrapper"
              [class.sent]="isSentByMe(msg)"
            >
              <div class="bubble">
                <p class="msg-content">{{ msg.content }}</p>

                <!-- Attachments if any -->
                <div class="attachments-wrap" *ngIf="msg.attachments && msg.attachments.length > 0">
                  <div *ngFor="let att of msg.attachments" class="att-tile">
                    <mat-icon>attachment</mat-icon>
                    <span>{{ att.fileName }}</span>
                  </div>
                </div>

                <div class="bubble-meta">
                  <span class="time">{{ msg.sentAt | date:'shortTime' }}</span>
                  <mat-icon *ngIf="isSentByMe(msg)" class="read-icon">done_all</mat-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Attachment Pill -->
          <div class="pending-attachment-strip" *ngIf="pendingAttachment">
            <mat-icon>attach_file</mat-icon>
            <span>Attached: <strong>{{ pendingAttachment.fileName }}</strong></span>
            <button mat-icon-button (click)="pendingAttachment = null"><mat-icon>close</mat-icon></button>
          </div>

          <!-- Message Composer Input -->
          <div class="composer-strip">
            <input
              type="file"
              #fileInput
              (change)="onAttachmentSelected($event)"
              style="display: none"
            />
            <button
              mat-icon-button
              type="button"
              class="attach-btn"
              (click)="fileInput.click()"
              matTooltip="Attach Clinical Record or Document"
            >
              <mat-icon>attach_file</mat-icon>
            </button>

            <input
              type="text"
              [(ngModel)]="newMessageText"
              (keydown.enter)="sendMessage()"
              placeholder="Type your message to physician or patient..."
              class="message-input"
              id="chat-message-input"
            />

            <button
              mat-flat-button
              color="primary"
              class="send-btn"
              (click)="sendMessage()"
              [disabled]="!newMessageText.trim() && !pendingAttachment"
              id="send-message-btn"
            >
              <mat-icon>send</mat-icon>
            </button>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .chat-page {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 150px);
      min-height: 550px;
    }

    .chat-layout {
      display: flex;
      height: 100%;
      border-radius: 18px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      background: #ffffff;
    }

    .conversations-pane {
      width: 320px;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      background: #f8fafc;

      @media (max-width: 768px) {
        width: 100px;
      }

      .conversations-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem;
        border-bottom: 1px solid #e2e8f0;

        h3 { margin: 0; font-size: 1.05rem; font-weight: 800; color: #0f172a; }

        .online-indicator {
          font-size: 0.7rem;
          font-weight: 700;
          color: #10b981;
          background: #d1fae5;
          padding: 0.15rem 0.45rem;
          border-radius: 9999px;
        }
      }

      .conversations-list {
        overflow-y: auto;
        flex: 1;

        .conversation-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 1rem 1.25rem;
          cursor: pointer;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s ease;

          &:hover {
            background: #f1f5f9;
          }

          &.active {
            background: #e0f2fe;
          }

          .participant-avatar {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: #0284c7;
            color: #ffffff;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            flex-shrink: 0;

            .active-dot {
              position: absolute;
              bottom: -2px;
              right: -2px;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: #10b981;
              border: 2px solid #ffffff;
            }
          }

          .conv-info {
            flex: 1;
            overflow: hidden;

            @media (max-width: 768px) {
              display: none;
            }

            .name-time {
              display: flex;
              justify-content: space-between;
              strong { font-size: 0.9rem; color: #0f172a; }
              .time { font-size: 0.7rem; color: #94a3b8; }
            }

            .role-desc {
              font-size: 0.75rem;
              color: #0284c7;
              font-weight: 600;
              display: block;
            }

            .preview-msg {
              font-size: 0.775rem;
              color: #64748b;
              margin: 0.2rem 0 0 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }

    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #ffffff;

      .chat-header {
        display: flex;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;

        .chat-participant {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .avatar-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e0f2fe;
            color: #0284c7;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          h4 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
          .sub-status { font-size: 0.75rem; color: #64748b; }
        }
      }

      .messages-viewport {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: #fafafa;
      }

      .message-bubble-wrapper {
        display: flex;
        justify-content: flex-start;

        &.sent {
          justify-content: flex-end;

          .bubble {
            background: #0284c7;
            color: #ffffff;
            border-radius: 16px 16px 2px 16px;

            .msg-content { color: #ffffff; }
            .bubble-meta { color: rgba(255, 255, 255, 0.8); }
          }
        }

        .bubble {
          max-width: 65%;
          padding: 0.85rem 1.15rem;
          border-radius: 16px 16px 16px 2px;
          background: #f1f5f9;
          color: #0f172a;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

          .msg-content {
            margin: 0;
            font-size: 0.925rem;
            line-height: 1.45;
          }

          .attachments-wrap {
            margin: 0.5rem 0 0.25rem 0;

            .att-tile {
              display: inline-flex;
              align-items: center;
              gap: 0.35rem;
              background: rgba(0, 0, 0, 0.08);
              padding: 0.25rem 0.5rem;
              border-radius: 6px;
              font-size: 0.75rem;
              font-weight: 600;

              mat-icon { font-size: 14px; width: 14px; height: 14px; }
            }
          }

          .bubble-meta {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 0.25rem;
            margin-top: 0.35rem;
            font-size: 0.65rem;
            color: #94a3b8;

            .read-icon {
              font-size: 14px;
              width: 14px;
              height: 14px;
            }
          }
        }
      }

      .pending-attachment-strip {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1.5rem;
        background: #f0fdf4;
        border-top: 1px solid #bbf7d0;
        font-size: 0.8rem;
        color: #166534;
      }

      .composer-strip {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.85rem 1.5rem;
        border-top: 1px solid #e2e8f0;
        background: #ffffff;

        .attach-btn {
          color: #64748b;
        }

        .message-input {
          flex: 1;
          height: 44px;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 0 1rem;
          font-size: 0.925rem;
          outline: none;

          &:focus {
            border-color: #0284c7;
          }
        }

        .send-btn {
          height: 44px;
          border-radius: 12px;
          min-width: 48px;
          padding: 0 1rem;
        }
      }
    }
  `]
})
export class MessagesChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesViewport') messagesViewport!: ElementRef<HTMLDivElement>;

  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  newMessageText = '';
  pendingAttachment: MessageAttachment | null = null;
  private sub?: Subscription;

  ngOnInit(): void {
    this.messageService.getConversations().subscribe(convs => {
      this.conversations = convs;
      if (convs.length > 0) {
        this.selectConversation(convs[0]);
      }
    });

    // Subscribe to incoming stream (WebSocket simulation / architecture)
    this.sub = this.messageService.incomingMessage$.subscribe(newMsg => {
      if (this.selectedConversation && newMsg.conversationId === this.selectedConversation.id) {
        this.messages.push(newMsg);
        this.scrollToBottom();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  selectConversation(conv: Conversation): void {
    this.selectedConversation = conv;
    this.messageService.getMessages(conv.id).subscribe(msgs => {
      this.messages = msgs;
      this.scrollToBottom();
    });
  }

  isSentByMe(msg: Message): boolean {
    const user = this.authService.currentUser();
    return msg.senderId === (user?.id || 3);
  }

  onAttachmentSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.pendingAttachment = {
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        fileSize: file.size
      };
    }
  }

  sendMessage(): void {
    if (!this.newMessageText.trim() && !this.pendingAttachment) return;
    if (!this.selectedConversation) return;

    const user = this.authService.currentUser();
    const attachments = this.pendingAttachment ? [this.pendingAttachment] : undefined;

    this.messageService.sendMessage({
      conversationId: this.selectedConversation.id,
      senderId: user?.id || 3,
      senderName: user ? `${user.firstName} ${user.lastName}` : 'Sophia Rodriguez',
      senderRole: user?.role || 'PATIENT',
      receiverId: this.selectedConversation.otherParticipant?.id || 2,
      receiverName: this.selectedConversation.otherParticipant?.name,
      content: this.newMessageText.trim(),
      attachments
    }).subscribe(() => {
      this.newMessageText = '';
      this.pendingAttachment = null;
      this.scrollToBottom();
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesViewport) {
        this.messagesViewport.nativeElement.scrollTop = this.messagesViewport.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
