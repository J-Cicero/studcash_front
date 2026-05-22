import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gns-admin-mass-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gns-admin-mass-actions.component.html',
  styleUrls: ['./gns-admin-mass-actions.component.scss']
})
export class GnsAdminMassActionsComponent implements OnInit, OnDestroy {
  progress = signal(68);
  private progressInterval: any;

  ngOnInit() {
    this.progressInterval = setInterval(() => {
      if (this.progress() < 100) {
        this.progress.update(val => val + Math.floor(Math.random() * 2));
      } else {
        this.progress.set(68);
      }
    }, 3000);
  }

  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }
}
