import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ChatService, Conversation } from '../../services/chat.service';
import { SocketService } from '../../services/socket.service';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { UserSearchDialogComponent } from './user-search-dialog/user-search-dialog.component';

@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatToolbarModule, MatIconModule,
    MatListModule, MatInputModule, MatFormFieldModule, MatDialogModule, FormsModule
  ],
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, OnDestroy {
  newMessageText = '';

  constructor(
    public authService: AuthService,
    public chatService: ChatService,
    private socketService: SocketService,
    private dialog: MatDialog
  ) {
    // Listen for new messages from Socket
    effect(() => {
      const msg = this.socketService.newMessageSignal();
      if (msg) {
        this.chatService.appendMessage(msg);
      }
    });
  }

  ngOnInit() {
    this.socketService.connect();
    this.chatService.loadConversations().subscribe();
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  logout() {
    this.authService.logout();
    this.socketService.disconnect();
  }

  openUserSearch() {
    const dialogRef = this.dialog.open(UserSearchDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(participantId => {
      if (participantId) {
        this.chatService.createOrGetConversation(participantId).subscribe(conv => {
          this.chatService.setActiveConversation(conv);
        });
      }
    });
  }

  selectConversation(conv: Conversation) {
    this.chatService.setActiveConversation(conv);
  }

  getOtherUser(conv: Conversation) {
    const currentUser = this.authService.currentUser();
    return conv.users.find(u => u.id !== currentUser?.id)?.username || 'Unknown';
  }

  sendMessage() {
    if (!this.newMessageText.trim()) return;
    
    const activeConv = this.chatService.activeConversation();
    if (!activeConv) return;

    this.chatService.sendMessage(activeConv.id, this.newMessageText).subscribe(() => {
      this.newMessageText = '';
    });
  }
}
