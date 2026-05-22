import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dbs-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dbs-reports.component.html',
  styleUrls: ['./dbs-reports.component.scss']
})
export class DbsReportsComponent implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
      const bars = this.el.nativeElement.querySelectorAll('.chart-bar') as NodeListOf<HTMLElement>;
      bars.forEach(bar => {
        const targetHeight = bar.style.height;
        bar.style.height = '0px';
        setTimeout(() => {
          bar.style.height = targetHeight;
        }, 100);
      });
    }, 100);
  }
}
