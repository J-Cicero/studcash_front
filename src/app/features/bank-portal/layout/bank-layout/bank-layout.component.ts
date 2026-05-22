import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bank-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bank-layout.component.html',
  styleUrls: ['./bank-layout.component.scss']
})
export class BankLayoutComponent {}
