import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gns-admin-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gns-admin-settings.component.html',
  styleUrls: ['./gns-admin-settings.component.scss']
})
export class GnsAdminSettingsComponent {
  activeTab = signal<string>('mon-profil');

  switchTab(tabId: string) {
    this.activeTab.set(tabId);
  }
}
