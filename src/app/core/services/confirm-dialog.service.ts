import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  isAlert?: boolean;
}

export interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialogState = new BehaviorSubject<ConfirmState>({
    isOpen: false,
    message: '',
  });

  dialogState$: Observable<ConfirmState> = this.dialogState.asObservable();

  confirm(options: ConfirmOptions | string): Promise<boolean> {
    const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
    return new Promise<boolean>((resolve) => {
      this.dialogState.next({
        isOpen: true,
        title: opts.title || 'Confirmation',
        message: opts.message,
        confirmText: opts.confirmText || 'Confirmer',
        cancelText: opts.cancelText || 'Annuler',
        type: opts.type || 'danger',
        isAlert: false,
        resolve
      });
    });
  }

  alert(message: string, title: string = 'Information', type: 'danger' | 'warning' | 'info' | 'success' = 'info'): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.dialogState.next({
        isOpen: true,
        title: title,
        message: message,
        confirmText: 'D\'accord',
        cancelText: '',
        type: type,
        isAlert: true,
        resolve
      });
    });
  }

  handleResult(result: boolean): void {
    const current = this.dialogState.value;
    if (current.resolve) {
      current.resolve(result);
    }
    this.dialogState.next({ ...current, isOpen: false, resolve: undefined });
  }
}
