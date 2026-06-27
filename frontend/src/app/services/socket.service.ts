import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  public onNewMessage = new Subject<any>();

  constructor(private authService: AuthService, private ngZone: NgZone) {
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
      console.log('new message', message);
      this.ngZone.run(() => {
        this.onNewMessage.next(message);
      });
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
