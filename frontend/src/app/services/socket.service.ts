import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  public newMessageSignal = signal<any>(null);

  constructor(private authService: AuthService) {
    // Listen to token changes or initialization
  }

  connect() {
    const token = this.authService.getAccessToken();
    if (!token || this.socket) return;

    this.socket = io('/', {
      auth: { token },
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    this.socket.on('newMessage', (message) => {
      this.newMessageSignal.set(message);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
