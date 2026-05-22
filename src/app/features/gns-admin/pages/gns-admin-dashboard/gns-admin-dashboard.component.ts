import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-gns-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, SkeletonModule],
  templateUrl: './gns-admin-dashboard.component.html',
  styleUrls: ['./gns-admin-dashboard.component.scss']
})
export class GnsAdminDashboardComponent implements OnInit {
  lineData: any;
  lineOptions: any;
  doughnutData: any;
  doughnutOptions: any;

  isLoading = true;

  ngOnInit() {
    this.initCharts();
    
    // Simulate API loading
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }

  initCharts() {
    const textColorSecondary = '#757682'; 
    const surfaceBorder = '#e2e8f0'; 

    this.lineData = {
        labels: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Bourses Émises',
                data: [65, 59, 80, 81, 56, 55, 40, 50, 75, 80, 85, 90],
                fill: false,
                borderColor: '#00236f',
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#00236f'
            },
            {
                label: 'Remboursements',
                data: [28, 48, 40, 19, 86, 27, 90, 80, 60, 45, 55, 65],
                fill: false,
                borderColor: '#757682',
                borderDash: [5, 5],
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#757682'
            }
        ]
    };

    this.lineOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                display: false 
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            x: {
                ticks: { color: textColorSecondary, font: { family: 'Inter', size: 12 } },
                grid: { color: 'transparent', drawBorder: false }
            },
            y: {
                ticks: { color: textColorSecondary, font: { family: 'Inter', size: 12 } },
                grid: { color: surfaceBorder, drawBorder: false }
            }
        }
    };

    this.doughnutData = {
        labels: ['UCAD', 'UGB', 'UASZ', 'Autres'],
        datasets: [
            {
                data: [45, 30, 15, 10],
                backgroundColor: [
                    '#00236f', 
                    '#264191', 
                    '#b6c4ff', 
                    '#e4e9ed'  
                ],
                hoverBackgroundColor: [
                    '#001a52',
                    '#1e3371',
                    '#8fa7fe',
                    '#d6dade'
                ],
                borderWidth: 0
            }
        ]
    };

    this.doughnutOptions = {
        cutout: '75%',
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return context.label + ': ' + context.raw + '%';
                    }
                }
            }
        }
    };
  }
}
