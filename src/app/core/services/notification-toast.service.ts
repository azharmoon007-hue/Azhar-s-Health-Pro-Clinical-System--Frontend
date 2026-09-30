import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationToastService {
  private snackBar = inject(MatSnackBar);

  success(message: string, duration = 4000): void {
    this.show(message, 'toast-success', '✓', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'toast-error', '✕', duration);
  }

  warning(message: string, duration = 4500): void {
    this.show(message, 'toast-warning', '⚠', duration);
  }

  info(message: string, duration = 3500): void {
    this.show(message, 'toast-info', 'ℹ', duration);
  }

  private show(message: string, panelClass: string, actionLabel: string, duration: number): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['app-toast', panelClass]
    };
    this.snackBar.open(message, actionLabel, config);
  }
}
