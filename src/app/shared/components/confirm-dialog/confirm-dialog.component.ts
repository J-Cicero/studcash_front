import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService, ConfirmState } from '../../../core/services/confirm-dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="activeIsOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 transform transition-all scale-100 duration-200">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div class="flex items-center">
            <div [ngClass]="iconBgClass" class="p-2 rounded-lg mr-3">
              <svg class="w-5 h-5" [ngClass]="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path *ngIf="activeType === 'danger' || activeType === 'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                <path *ngIf="activeType === 'info' || activeType === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ activeTitle }}</h3>
          </div>
          <button (click)="onCancel()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <p class="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {{ activeMessage }}
          </p>
        </div>

        <!-- Actions -->
        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
          <button 
            *ngIf="!activeIsAlert"
            type="button" 
            (click)="onCancel()" 
            class="py-2 px-4 border border-slate-300 dark:border-slate-700 shadow-sm text-sm font-bold rounded-xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-all">
            {{ activeCancelText }}
          </button>
          <button 
            type="button" 
            (click)="onConfirm()" 
            [ngClass]="confirmBtnClass"
            class="inline-flex justify-center items-center py-2 px-5 border border-transparent shadow-lg text-sm font-bold rounded-xl text-white focus:outline-none transition-all">
            {{ activeConfirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  // Inputs for standalone usage
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirmation';
  @Input() message: string = '';
  @Input() confirmText: string = 'Oui';
  @Input() cancelText: string = 'Non';
  @Input() type: 'danger' | 'warning' | 'info' | 'success' = 'danger';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  private serviceState: ConfirmState | null = null;
  private sub?: Subscription;

  constructor(private confirmService: ConfirmDialogService) {}

  ngOnInit(): void {
    this.sub = this.confirmService.dialogState$.subscribe(state => {
      this.serviceState = state;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get activeIsOpen(): boolean {
    return (this.serviceState?.isOpen) || this.isOpen;
  }

  get activeTitle(): string {
    return (this.serviceState?.isOpen ? this.serviceState.title : null) || this.title || 'Confirmation';
  }

  get activeMessage(): string {
    return (this.serviceState?.isOpen ? this.serviceState.message : null) || this.message;
  }

  get activeConfirmText(): string {
    return (this.serviceState?.isOpen ? this.serviceState.confirmText : null) || this.confirmText || 'Oui';
  }

  get activeCancelText(): string {
    return (this.serviceState?.isOpen ? this.serviceState.cancelText : null) || this.cancelText || 'Non';
  }

  get activeType(): string {
    return (this.serviceState?.isOpen ? this.serviceState.type : null) || this.type || 'danger';
  }

  get activeIsAlert(): boolean {
    return !!(this.serviceState?.isOpen && this.serviceState.isAlert);
  }

  get iconBgClass(): string {
    switch (this.activeType) {
      case 'danger': return 'bg-red-50 dark:bg-red-900/30';
      case 'warning': return 'bg-amber-50 dark:bg-amber-900/30';
      case 'success': return 'bg-emerald-50 dark:bg-emerald-900/30';
      default: return 'bg-blue-50 dark:bg-blue-900/30';
    }
  }

  get iconClass(): string {
    switch (this.activeType) {
      case 'danger': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-amber-600 dark:text-amber-400';
      case 'success': return 'text-emerald-600 dark:text-emerald-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  }

  get confirmBtnClass(): string {
    switch (this.activeType) {
      case 'danger': return 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/20';
      case 'warning': return 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/20';
      case 'success': return 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20';
      default: return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20';
    }
  }

  onConfirm(): void {
    if (this.serviceState?.isOpen) {
      this.confirmService.handleResult(true);
    } else {
      this.confirm.emit();
    }
  }

  onCancel(): void {
    if (this.serviceState?.isOpen) {
      this.confirmService.handleResult(false);
    } else {
      this.cancel.emit();
    }
  }
}
