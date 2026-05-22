import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gns-admin-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gns-admin-students.component.html',
  styleUrls: ['./gns-admin-students.component.scss']
})
export class GnsAdminStudentsComponent {
  selectedRows = signal<Set<string>>(new Set());

  toggleRow(id: string, event: Event) {
    const target = event.target as HTMLElement;
    // Ignore clicks on buttons inside the row
    if (target.closest('button')) {
      return;
    }
    
    const newSet = new Set(this.selectedRows());
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    this.selectedRows.set(newSet);
  }
}
