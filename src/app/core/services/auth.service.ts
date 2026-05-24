import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'ADMIN_GNS' | 'ADMIN_BANQUE' | 'ADMIN_DBS' | 'UNIVERSITY_ADMIN' | 'ETUDIANT' | 'COMMERCANT';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signal to track the current user's role
  currentUserRole = signal<UserRole | null>(this.getRoleFromStorage());
  universityId = signal<string | null>(localStorage.getItem('university_id'));

  constructor(private router: Router) {}

  private getRoleFromStorage(): UserRole | null {
    return localStorage.getItem('user_role') as UserRole | null;
  }

  login(role: UserRole, univId?: string) {
    localStorage.setItem('user_role', role);
    if (univId) {
        localStorage.setItem('university_id', univId);
        this.universityId.set(univId);
    }
    this.currentUserRole.set(role);
  }

  logout() {
    localStorage.removeItem('user_role');
    localStorage.removeItem('university_id');
    this.currentUserRole.set(null);
    this.universityId.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(expectedRoles: UserRole[]): boolean {
    const role = this.currentUserRole();
    return role ? expectedRoles.includes(role) : false;
  }

  isLoggedIn(): boolean {
    return this.currentUserRole() !== null;
  }
}
