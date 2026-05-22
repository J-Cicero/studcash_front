import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gns-admin-universities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gns-admin-universities.component.html',
  styleUrls: ['./gns-admin-universities.component.scss']
})
export class GnsAdminUniversitiesComponent {
  isSidePanelOpen = signal(false);

  toggleSidePanel() {
    this.isSidePanelOpen.update(val => !val);
  }
}
