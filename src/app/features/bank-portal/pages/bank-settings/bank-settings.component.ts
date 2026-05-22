import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bank-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bank-settings.component.html',
  styleUrls: ['./bank-settings.component.scss']
})
export class BankSettingsComponent {
  activeTab = signal('profile');

  setTab(tab: string) {
    this.activeTab.set(tab);
  }
}
