import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

export interface User {
  id: string;
  username: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';
  
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();
  }

  private loadUserFromToken() {
    const token = this.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser.set({ id: payload.userId, username: payload.username });
      } catch (e) {
        this.currentUser.set(null);
      }
    }
  }

  register(username: string, passwordPlain: string): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, { username, password: passwordPlain });
  }

  login(username: string, passwordPlain: string): Observable<boolean> {
    return this.http.post<Tokens>(`${this.API_URL}/login`, { username, password: passwordPlain }).pipe(
      tap(tokens => {
        this.saveTokens(tokens);
        this.loadUserFromToken();
      }),
      map(() => true)
    );
  }

  refreshTokens(): Observable<Tokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<Tokens>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      tap(tokens => {
        this.saveTokens(tokens);
        this.loadUserFromToken();
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.API_URL}/logout`, { refreshToken }).subscribe({
        error: () => {} // Ignore errors on logout
      });
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private saveTokens(tokens: Tokens) {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }
}
