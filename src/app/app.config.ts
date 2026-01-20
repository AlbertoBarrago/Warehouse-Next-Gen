import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';

/**
 * Application configuration for Warehouse Next-Gen
 * 
 * Key Features:
 * - Zoneless mode: No zone.js, Signal-driven change detection
 * - Functional interceptors: Modern HTTP interceptor pattern
 * - View transitions: Native browser view transitions API
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // ============================================
    // ZONELESS MODE - Core Angular 21 Feature
    // ============================================
    // Removes zone.js dependency entirely
    // Change detection is now Signal-driven
    // Results in smaller bundles and faster performance
    provideZonelessChangeDetection(),

    // ============================================
    // ROUTING
    // ============================================
    provideRouter(
      routes,
      // Automatically bind route params to component inputs
      withComponentInputBinding(),
      // Enable native View Transitions API
      withViewTransitions()
    ),

    // ============================================
    // HTTP CLIENT
    // ============================================
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
      ])
    ),
  ],
};
