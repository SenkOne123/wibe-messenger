import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Message {
  id: string;
  text: string;
  createdAt: string;
  senderId: string;
  conversationId: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  users: { id: string; username: string }[];
  messages: Message[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_URL = '/api';

  conversations = signal<Conversation[]>([]);
  activeConversation = signal<Conversation | null>(null);
  activeMessages = signal<Message[]>([]);

  constructor(private http: HttpClient) {}

  searchUsers(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/users/search?username=${username}`);
  }

  createOrGetConversation(participantId: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.API_URL}/conversations`, { participantId }).pipe(
      tap(() => this.loadConversations().subscribe())
    );
  }

  loadConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.API_URL}/conversations`).pipe(
      tap(data => this.conversations.set(data))
    );
  }

  loadMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.API_URL}/conversations/${conversationId}/messages`).pipe(
      tap(msgs => this.activeMessages.set(msgs))
    );
  }

  sendMessage(conversationId: string, text: string): Observable<Message> {
    return this.http.post<Message>(`${this.API_URL}/conversations/${conversationId}/messages`, { text });
  }

  setActiveConversation(conv: Conversation) {
    this.activeConversation.set(conv);
    this.loadMessages(conv.id).subscribe();
  }

  appendMessage(msg: Message) {
    const activeConv = this.activeConversation();
    if (activeConv && activeConv.id === msg.conversationId) {
      // Append to active messages
      this.activeMessages.update(msgs => [...msgs, msg]);
    }

    // Also update the conversation list snippet
    this.conversations.update(convs => {
      const idx = convs.findIndex(c => c.id === msg.conversationId);
      if (idx !== -1) {
        const c = convs[idx];
        c.messages = [msg];
        c.updatedAt = msg.createdAt;
        // Move to top
        convs.splice(idx, 1);
        return [c, ...convs];
      }
      return convs; // optionally reload if not found
    });
  }
}
