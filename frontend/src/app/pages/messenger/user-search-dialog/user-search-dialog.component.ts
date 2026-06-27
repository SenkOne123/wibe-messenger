import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-user-search-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatListModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Поиск пользователя</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill" style="width: 100%;">
        <mat-label>Имя пользователя</mat-label>
        <input matInput [(ngModel)]="searchQuery" (keyup.enter)="search()" />
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="search()">Найти</button>

      <mat-list>
        <mat-list-item *ngFor="let user of searchResults" (click)="selectUser(user)" style="cursor: pointer;">
          <span matListItemTitle>{{ user.username }}</span>
        </mat-list-item>
        <div *ngIf="searched && searchResults.length === 0" style="margin-top: 10px;">
          Пользователи не найдены.
        </div>
      </mat-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Отмена</button>
    </mat-dialog-actions>
  `,
  styles: []
})
export class UserSearchDialogComponent {
  searchQuery = '';
  searchResults: any[] = [];
  searched = false;

  constructor(
    public dialogRef: MatDialogRef<UserSearchDialogComponent>,
    private chatService: ChatService
  ) {}

  search() {
    if (!this.searchQuery.trim()) return;
    
    this.chatService.searchUsers(this.searchQuery).subscribe(users => {
      this.searchResults = users;
      this.searched = true;
    });
  }

  selectUser(user: any) {
    this.dialogRef.close(user.id);
  }
}
