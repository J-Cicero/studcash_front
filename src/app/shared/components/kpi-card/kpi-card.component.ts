import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss']
})
export class KpiCardComponent {
  @Input() title: string = '';
  @Input() value: number | string | null = 0;
  @Input() isLoading: boolean = false;
  @Input() hasError: boolean = false;
  @Input() suffix: string = '';
  
  // Icon and gradient classes
  @Input() iconSvgPath: string = '';
  @Input() gradientClass: string = 'from-blue-500 to-blue-600';
  @Input() iconBgClass: string = 'bg-blue-500/10';
  @Input() shadowClass: string = 'shadow-blue-500/30';

  // Action button
  @Input() actionButtonText: string = '';
  @Input() actionButtonRoute: string = '';

  formatNumberCompact(val: number | string | null | undefined): string {
    if (val === null || val === undefined) return '0';
    const num = Number(val);
    if (isNaN(num)) return val.toString();
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return new Intl.NumberFormat('fr-FR').format(num);
  }
}
