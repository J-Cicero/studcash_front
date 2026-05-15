import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard-ul',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './dashboard-ul.component.html',
  styleUrls: ['./dashboard-ul.component.scss']
})
export class DashboardUlComponent {
  // Configuration du graphique en barres
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      { 
        data: [65, 59, 80, 81, 56, 55, 40], 
        label: 'Transactions journalières',
        backgroundColor: '#14532d',
        hoverBackgroundColor: '#16a34a',
        borderRadius: 8
      }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  public barChartType: 'bar' = 'bar';
}
