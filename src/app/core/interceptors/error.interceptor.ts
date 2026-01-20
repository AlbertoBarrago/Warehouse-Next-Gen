import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

/**
 * Functional HTTP interceptor for error handling
 * Catches HTTP errors and displays notifications
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.status === 0) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      notificationService.error(errorMessage);

      return throwError(() => error);
    })
  );
};
