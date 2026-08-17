import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, Subscription } from 'rxjs';
import { switchMap, tap, startWith, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface NotificationResponse {
  trackingId: string;
  title: string;
  message: string;
  targetRole: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  private notificationsSubject = new BehaviorSubject<NotificationResponse[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private pollingSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Start polling automatically when currentUser changes (login/logout/page refresh)
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.startPolling();
      } else {
        this.stopPolling();
        this.notificationsSubject.next([]);
        this.unreadCountSubject.next(0);
      }
    });
  }

  private getRoleQueryParam(): string {
    if (this.authService.hasRole('ADMIN_GNS')) {
      return 'ADMIN_GNS';
    }
    if (this.authService.hasRole('ADMIN_BANQUE') || this.authService.hasRole('BANQUE')) {
      return 'ADMIN_BANQUE';
    }
    return 'ALL';
  }

  public fetchNotifications(limit: number = 20): Observable<NotificationResponse[]> {
    const role = this.getRoleQueryParam();
    const params = new HttpParams()
      .set('role', role)
      .set('limit', limit.toString());

    return this.http.get<NotificationResponse[]>(this.apiUrl, { params }).pipe(
      tap(notifications => {
        this.notificationsSubject.next(notifications);
      }),
      catchError(err => {
        console.error('Error fetching notifications:', err);
        return [];
      })
    );
  }

  public fetchUnreadCount(): Observable<number> {
    const role = this.getRoleQueryParam();
    const params = new HttpParams().set('role', role);

    return this.http.get<{ unreadCount: number }>(`${this.apiUrl}/unread-count`, { params }).pipe(
      map(res => res.unreadCount),
      tap(count => {
        this.unreadCountSubject.next(count);
      }),
      catchError(err => {
        console.error('Error fetching unread count:', err);
        return [0];
      })
    );
  }

  public markAsRead(trackingId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${trackingId}/read`, {}).pipe(
      tap(() => {
        // Update local state
        const currentList = this.notificationsSubject.value.map(n => 
          n.trackingId === trackingId ? { ...n, isRead: true } : n
        );
        this.notificationsSubject.next(currentList);
        this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
      })
    );
  }

  public markAllAsRead(): Observable<void> {
    const role = this.getRoleQueryParam();
    const params = new HttpParams().set('role', role);

    return this.http.put<void>(`${this.apiUrl}/read-all`, {}, { params }).pipe(
      tap(() => {
        // Update local state
        const currentList = this.notificationsSubject.value.map(n => ({ ...n, isRead: true }));
        this.notificationsSubject.next(currentList);
        this.unreadCountSubject.next(0);
      })
    );
  }

  public startPolling(intervalMs: number = 10000): void {
    this.stopPolling();

    // Trigger immediate fetch, then poll every interval
    this.pollingSubscription = interval(intervalMs)
      .pipe(
        startWith(0),
        switchMap(() => this.fetchUnreadCount().pipe(
          switchMap(() => this.fetchNotifications(15))
        ))
      )
      .subscribe();
  }

  public stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }
}
