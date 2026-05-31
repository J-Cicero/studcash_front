import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DashboardStats {
  totalStudents: number;
  totalMerchants: number;
  totalUniversities: number;
  globalTransactionVolume: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalStudents: 0,
    totalMerchants: 0,
    totalUniversities: 0,
    globalTransactionVolume: 0
  };
  isLoading = true;

  constructor() {}

  ngOnInit(): void {
    // TODO: Connect to actual backend DashboardService
    setTimeout(() => {
      this.stats = {
        totalStudents: 12450,
        totalMerchants: 312,
        totalUniversities: 15,
        globalTransactionVolume: 45210000
      };
      this.isLoading = false;
    }, 800);
  }
}
