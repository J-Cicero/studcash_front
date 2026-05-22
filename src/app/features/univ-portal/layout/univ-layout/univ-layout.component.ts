import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-univ-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './univ-layout.component.html',
  styleUrls: ['./univ-layout.component.scss']
})
export class UnivLayoutComponent {}
