import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss'
})
export class DashboardAdminComponent implements OnInit {
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      { 
        data: [120, 150, 180, 140, 210, 90, 80], 
        label: 'Inscriptions',
        backgroundColor: '#1e3a8a',
        hoverBackgroundColor: '#2563eb',
        borderRadius: 12,
        barThickness: 20
      }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { display: false } },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  public barChartType: 'bar' = 'bar';

  alerts = [
    { name: 'Koffi Jude', reason: 'Documents illisibles' },
    { name: 'Amah Ayélé', reason: 'Carte ID expirée' },
    { name: 'Lawson Akouvi', reason: 'Photo floue' }
  ];

  constructor() {}
  ngOnInit(): void {}
}
