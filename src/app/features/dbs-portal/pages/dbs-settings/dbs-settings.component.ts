import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dbs-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dbs-settings.component.html',
  styleUrls: ['./dbs-settings.component.scss']
})
export class DbsSettingsComponent {
  activeTab = signal<string>('profile');

  switchTab(tabId: string) {
    this.activeTab.set(tabId);
  }
}
