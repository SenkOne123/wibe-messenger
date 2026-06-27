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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatCardModule, MatInputModule, MatButtonModule, MatFormFieldModule],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Регистрация</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Имя пользователя</mat-label>
              <input matInput formControlName="username" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Пароль</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>

            <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>

            <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid" class="full-width">
              Зарегистрироваться
            </button>
          </form>
          <div class="auth-links">
            Уже есть аккаунт? <a routerLink="/login">Войти</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { username, password } = this.registerForm.value;
      this.authService.register(username, password).subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => this.errorMessage = err.error?.error || 'Ошибка регистрации'
      });
    }
  }
}
