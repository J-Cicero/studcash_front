import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StudentTransactionView {
  id: string;
  name: string;
  scholarshipType: string;
  totalReceived: number;
  totalSpent: number;
  balance: number;
  lastActivity: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  students: StudentTransactionView[] = [];
  isLoading = true;

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.students = [
        { id: 'STU-001', name: 'Marc Ndongo', scholarshipType: 'Excellence (150k)', totalReceived: 150000, totalSpent: 45000, balance: 105000, lastActivity: new Date() },
        { id: 'STU-002', name: 'Alice Dupont', scholarshipType: 'Sociale (50k)', totalReceived: 50000, totalSpent: 48000, balance: 2000, lastActivity: new Date(Date.now() - 3600000) },
        { id: 'STU-003', name: 'Jean Mvondo', scholarshipType: 'Mérite (100k)', totalReceived: 100000, totalSpent: 0, balance: 100000, lastActivity: new Date(Date.now() - 86400000) },
      ];
      this.isLoading = false;
    }, 800);
  }
}
