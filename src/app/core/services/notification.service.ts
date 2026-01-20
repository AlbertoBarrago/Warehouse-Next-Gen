import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
}

/**
 * Notification service using Signals
 * Manages toast notifications reactively
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);

  readonly notifications = this._notifications.asReadonly();
  readonly hasNotifications = computed(() => this._notifications().length > 0);
  readonly latestNotification = computed(() => this._notifications()[0] ?? null);

  private createNotification(type: NotificationType, message: string): void {
    const notification: Notification = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
    };

    this._notifications.update((current) => [notification, ...current]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => this.dismiss(notification.id), 5000);
  }

  success(message: string): void {
    this.createNotification('success', message);
  }

  error(message: string): void {
    this.createNotification('error', message);
  }

  warning(message: string): void {
    this.createNotification('warning', message);
  }

  info(message: string): void {
    this.createNotification('info', message);
  }

  dismiss(id: string): void {
    this._notifications.update((current) =>
      current.filter((n) => n.id !== id)
    );
  }

  clearAll(): void {
    this._notifications.set([]);
  }
}
