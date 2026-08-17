import { Component, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationResponse } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <!-- Bell Icon Button -->
      <button 
        (click)="toggleDropdown($event)"
        class="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60"
        aria-label="Notifications">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        <!-- Red dot indicator -->
        <span 
          *ngIf="(unreadCount$ | async) !== 0"
          class="absolute top-1.5 right-1.5 flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500 ring-2 ring-white dark:ring-slate-950"></span>
        </span>
      </button>

      <!-- Glassmorphic Dropdown Panel -->
      <div 
        *ngIf="isOpen"
        class="absolute right-0 mt-3 w-96 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl z-50 overflow-hidden transform transition-all duration-300 origin-top-right scale-100 opacity-100">
        
        <!-- Header -->
        <div class="px-5 py-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <div>
            <h3 class="font-bold text-slate-800 dark:text-slate-200 text-sm">Notifications</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {{ (unreadCount$ | async) }} non lues
            </p>
          </div>
          <button 
            *ngIf="(unreadCount$ | async) !== 0"
            (click)="markAllAsRead($event)"
            class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            Tout marquer comme lu
          </button>
        </div>

        <!-- Notification List -->
        <div class="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 custom-scrollbar">
          <div *ngIf="notifications.length === 0" class="py-12 text-center">
            <svg class="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 4h-2a2 2 0 00-2 2v1a2 2 0 01-2 2H8a2 2 0 01-2-2v-1a2 2 0 00-2-2H2" />
            </svg>
            <p class="text-sm font-medium text-slate-400 dark:text-slate-500">Aucune notification pour le moment</p>
          </div>

          <div 
            *ngFor="let item of notifications" 
            [class.bg-blue-50/20]="!item.isRead"
            [class.dark:bg-blue-950/5]="!item.isRead"
            (click)="markAsRead(item, $event)"
            class="px-5 py-4 flex gap-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 cursor-pointer transition-all duration-200 group">
            
            <!-- Type Icon Indicator -->
            <div class="shrink-0">
              <div [ngClass]="getIconBgClass(item.type)" class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                <span [innerHTML]="getNotificationIconSvg(item.type)"></span>
              </div>
            </div>

            <!-- Content Area -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-1">
                <p class="text-[13px] font-bold truncate transition-colors" [ngClass]="item.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'">
                  {{ item.title }}
                </p>
                <!-- Dot indicator for unread -->
                <span *ngIf="!item.isRead" class="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1 shadow-sm shadow-blue-500/50"></span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 break-words">
                {{ item.message }}
              </p>
              <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 block mt-2">
                {{ item.createdAt | date: 'dd/MM/yyyy HH:mm' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(156, 163, 175, 0.25);
      border-radius: 9999px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(156, 163, 175, 0.45);
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  isOpen = false;
  notifications: NotificationResponse[] = [];
  unreadCount$ = this.notificationService.unreadCount$;
  private sub = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.notificationService.notifications$.subscribe(list => {
        this.notifications = list;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      // Force refreshing the list on open
      this.notificationService.fetchNotifications(15).subscribe();
      this.notificationService.fetchUnreadCount().subscribe();
    }
  }

  markAsRead(item: NotificationResponse, event: Event): void {
    event.stopPropagation();
    if (!item.isRead) {
      this.notificationService.markAsRead(item.trackingId).subscribe();
    }
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe();
  }

  // Click outside listener to close dropdown
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  getIconBgClass(type: string): string {
    switch (type) {
      case 'SCOLARITE_YEAR':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'INSCRIPTION':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'LIQUIDATION_MERCHANT':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      case 'LIQUIDATION_STUDENT':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  }

  getNotificationIconSvg(type: string): string {
    switch (type) {
      case 'SCOLARITE_YEAR':
        // Calendar icon
        return `<svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>`;
      case 'INSCRIPTION':
        // Student file validation / card icon
        return `<svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>`;
      case 'LIQUIDATION_MERCHANT':
        // Boutique cashout icon
        return `<svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>`;
      case 'LIQUIDATION_STUDENT':
        // Student cashout icon
        return `<svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
      default:
        // Regular bell
        return `<svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>`;
    }
  }
}
