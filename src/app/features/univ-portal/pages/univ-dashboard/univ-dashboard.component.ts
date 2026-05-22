import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-univ-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './univ-dashboard.component.html',
  styleUrls: ['./univ-dashboard.component.scss']
})
export class UnivDashboardComponent implements OnInit {
  currentDate = signal('');

  ngOnInit() {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    this.currentDate.set(new Date().toLocaleDateString('fr-FR', options));
  }
}
