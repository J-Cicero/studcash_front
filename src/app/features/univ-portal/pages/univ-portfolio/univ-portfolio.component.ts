import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-univ-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './univ-portfolio.component.html',
  styleUrls: ['./univ-portfolio.component.scss']
})
export class UnivPortfolioComponent {}
