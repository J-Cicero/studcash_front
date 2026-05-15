import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar-wrapper">
      <div class="brand-section">
        <div class="logo-circle">sC</div>
        <span class="app-name text-white">studCash</span>
      </div>
      
      <nav class="navigation-links">
        <button 
          (click)="onTabClick('Tableau de bord')"
          [class.active]="currentTab === 'Tableau de bord'"
          class="nav-btn">
          <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4V4zm9 0h7v4h-7V4zM13 10h7v10h-7V10zM4 13h7v7H4v-7z"/></svg>
          <span>Tableau de bord</span>
        </button>
        
        <button 
          (click)="onTabClick('Paiements')"
          [class.active]="currentTab === 'Paiements'"
          class="nav-btn">
          <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 4h16V8H4v2zm0 4h6v2H4v-2z"/></svg>
          <span>Paiements</span>
        </button>

        <button 
          (click)="onTabClick('Profil')"
          [class.active]="currentTab === 'Profil'"
          class="nav-btn">
          <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>
          <span>Profil</span>
        </button>
      </nav>
      
      <div class="sidebar-bottom">
        <button class="nav-btn secondary">
          <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 18h2v-2h-2v2zm1-16a8 8 0 0 0-4 14.9V19h8v-2.1A8 8 0 0 0 12 2zm0 14a6 6 0 1 1 6-6 6.007 6.007 0 0 1-6 6zm0-10a2.5 2.5 0 0 0-2.5 2.5h2A.5.5 0 1 1 12 8a1.5 1.5 0 0 0-1.5 1.5V10h2v-.5A.5.5 0 1 1 13 9c0 .8-.67 1.5-1.5 1.5V11h-2c0-1.65 1.35-3 3-3z"/></svg>
          <span>Aide</span>
        </button>
        <button class="logout-action">
          <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17v-2h4v2h-4zm-4-1V8a2 2 0 0 1 2-2h6V4l4 4-4 4V9H8v7h4v2H8a2 2 0 0 1-2-2zm10 0h2v2h-2v-2z"/></svg>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-wrapper {
      width: 256px;
      height: 100vh;
      background-color: #14532d;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      font-family: 'Inter', sans-serif !important;
    }
    .brand-section {
      padding: 2.5rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-circle {
      width: 32px;
      height: 32px;
      background: white;
      color: #14532d;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-style: italic;
    }
    .app-name {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .navigation-links {
      flex: 1;
      padding: 0 1rem;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      cursor: pointer;
      color: rgba(255,255,255,0.6);
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
      flex: 0 0 auto;
    }

    .nav-btn:hover, .nav-btn.active {
      color: white;
      background: rgba(255,255,255,0.1);
    }
    .sidebar-bottom {
      padding: 1.5rem 1rem;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .secondary { opacity: 0.8; font-size: 0.85rem; }
    .logout-action {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
      border: none;
      width: 100%;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .logout-action:hover { background: rgba(239, 68, 68, 0.2); }
  `]
})
export class SidebarComponent {
  @Input() currentTab: string = '';
  @Output() tabChange = new EventEmitter<string>();

  onTabClick(tabId: string): void {
    this.tabChange.emit(tabId);
  }
}
