import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatToolbarModule],
  template: `
    <mat-toolbar color="primary">
      <span>Wibe Messenger</span>
      <span class="spacer"></span>
      <span>Welcome, {{ authService.currentUser()?.username }}</span>
      <button mat-button (click)="logout()">Logout</button>
    </mat-toolbar>
    <div class="content">
      <h2>Messenger is under construction</h2>
      <p>You have successfully authenticated using Access and Refresh tokens!</p>
    </div>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    .content {
      padding: 20px;
      text-align: center;
    }
  `]
})
export class MessengerComponent {
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
