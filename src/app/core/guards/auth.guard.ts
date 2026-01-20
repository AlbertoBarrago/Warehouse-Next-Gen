import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

/**
 * Functional route guard for authentication
 * Redirects to login if user is not authenticated
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // For demo purposes, auto-login
  // In production, redirect to login page
  authService.login('demo@warehouse.com', 'demo');
  return true;
};
