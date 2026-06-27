import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatCardModule, MatInputModule, MatButtonModule, MatFormFieldModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Вход</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Имя пользователя</mat-label>
              <input matInput formControlName="username" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Пароль</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>

            <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>

            <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid" class="full-width">
              Войти
            </button>
          </form>
          <div class="auth-links">
            Нет аккаунта? <a routerLink="/register">Зарегистрироваться</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: () => this.router.navigate(['/messenger']),
        error: () => this.errorMessage = 'Неверные учетные данные'
      });
    }
  }
}
