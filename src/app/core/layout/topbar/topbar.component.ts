import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar-main">
      <div class="search-container">
        <svg class="topbar-icon search-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4a6 6 0 1 0 3.73 10.72l4.28 4.28 1.41-1.41-4.28-4.28A6 6 0 0 0 10 4zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/></svg>
        <input type="text" placeholder="Rechercher une transaction...">
      </div>

      <div class="user-stack">
        <button class="icon-only" type="button" aria-label="Notifications">
          <svg class="topbar-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2zM12 7a4 4 0 0 1 4 4v6H8v-6a4 4 0 0 1 4-4z"/></svg>
        </button>
        <div class="separator"></div>
        <div class="agent-profile">
          <div class="details">
            <span class="agent-name">Agent UL-042</span>
            <span class="agent-badge">Officiel</span>
          </div>
          <div class="agent-avatar">
            <svg class="topbar-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4a3.5 3.5 0 1 1-3.5 3.5A3.5 3.5 0 0 1 12 6zm0 12.2a8.2 8.2 0 0 1-6.7-3.5c.03-2.2 4.46-3.4 6.7-3.4s6.67 1.2 6.7 3.4A8.2 8.2 0 0 1 12 18.2z"/></svg>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar-main {
      height: 72px;
      background: white;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2.5rem;
      position: sticky;
      top: 0;
      z-index: 50;
      font-family: 'Inter', sans-serif !important;
    }
    .search-container {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-container span {
      position: absolute;
      left: 14px;
      color: #94a3b8;
      font-size: 20px;
    }

    .topbar-icon {
      width: 22px;
      height: 22px;
      fill: currentColor;
      flex: 0 0 auto;
    }

    .search-container input {
      padding: 10px 16px 10px 44px;
      width: 320px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      outline: none;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .search-container input:focus {
      background: white;
      border-color: #14532d;
      box-shadow: 0 0 0 4px rgba(20, 83, 45, 0.05);
    }
    .user-stack {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .icon-only {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .separator {
      width: 1px;
      height: 24px;
      background: #f1f5f9;
    }
    .agent-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .details {
      display: flex;
      flex-direction: column;
      text-align: right;
    }
    .agent-name {
      font-weight: 700;
      font-size: 0.85rem;
      color: #1e293b;
    }
    .agent-badge {
      font-size: 0.7rem;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .agent-avatar {
      width: 38px;
      height: 38px;
      background: #f1f5f9;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
    }
  `]
})
export class TopbarComponent {
  @Input() title: string = '';
}
