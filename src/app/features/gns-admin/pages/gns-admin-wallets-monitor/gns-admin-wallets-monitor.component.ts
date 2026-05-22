import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gns-admin-wallets-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gns-admin-wallets-monitor.component.html',
  styleUrls: ['./gns-admin-wallets-monitor.component.scss']
})
export class GnsAdminWalletsMonitorComponent {
  isModalOpen = signal(false);

  openModal() {
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen.set(false);
    document.body.style.overflow = 'auto';
  }
}
