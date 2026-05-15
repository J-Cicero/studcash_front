import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../core/layout/sidebar/sidebar.component';
import { TopbarComponent } from '../../../core/layout/topbar/topbar.component';

@Component({
  selector: 'app-dashboard-ul',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent],
  templateUrl: './dashboard-ul.component.html',
  styles: [`
    :host { display: block; height: 100vh; width: 100%; background: #f8fafc; }
    
    .dashboard-frame { display: flex; width: 100%; }

    .content-body {
      margin-left: 256px; /* Largeur sidebar fixe */
      flex: 1;
      height: 100vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .view-content {
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    /* KPI GRID 1 LIGNE */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .kpi-card {
      background: white;
      padding: 1.5rem 2rem;
      border-radius: 16px;
      border: 1px solid #f1f5f9;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .special { background: #14532d; border: none; }

    .tag {
      font-size: 0.7rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    /* TABLEAU MINIMALISTE */
    .data-container {
      background: white;
      border-radius: 16px;
      border: 1px solid #f1f5f9;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      overflow: hidden;
    }

    .section-header {
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h3 { font-size: 0.9rem; font-weight: 800; color: #1e293b; margin: 0; }

    table { width: 100%; border-collapse: collapse; }
    th {
      background: #f8fafc;
      padding: 0.85rem 1.75rem;
      text-align: left;
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }

    td {
      padding: 1.25rem 1.75rem;
      font-size: 0.85rem;
      color: #475569;
      border-bottom: 1px solid #f8fafc;
    }

    .pill-success { 
      padding: 0.35rem 0.85rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      background: #f0fdf4; 
      color: #166534; 
    }

    .pdf-icon {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
    }

    .pdf-icon:hover { border-color: #14532d; color: #14532d; }

    .action-btn {
      background: #14532d;
      color: white;
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
    }

    .currency { font-size: 14px; color: #94a3b8; font-weight: 600; }
    .text-white { color: white !important; }
    .text-light-50 { color: rgba(255,255,255,0.5) !important; }
    .bold { font-weight: 700; }
    .dark { color: #0f172a; }

    * { font-family: 'Inter', sans-serif !important; }
  `]
})
export class DashboardUlComponent {
  currentTab: string = 'Tableau de bord';

  switchTab(tabId: string): void {
    this.currentTab = tabId;
  }
}
