import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'operator';
}

/**
 * Authentication service using Signals
 * Manages user session state reactively
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Private writable signals
  private readonly _token = signal<string | null>(this.getStoredToken());
  private readonly _user = signal<User | null>(null);

  // Public readonly signals
  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();

  // Computed signals for derived state
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly userName = computed(() => this._user()?.name ?? 'Guest');

  /**
   * Simulate login - in production, this would call an API
   */
  login(email: string, password: string): void {
    // Simulated authentication
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';
    const mockUser: User = {
      id: '1',
      email,
      name: 'Warehouse Manager',
      role: 'manager',
    };

    this._token.set(mockToken);
    this._user.set(mockUser);
    localStorage.setItem('auth_token', mockToken);
  }

  /**
   * Clear authentication state
   */
  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('auth_token');
  }

  /**
   * Retrieve token from storage on init
   */
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }
}
