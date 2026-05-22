import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gns-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gns-admin-layout.component.html',
  styleUrls: ['./gns-admin-layout.component.scss']
})
export class GnsAdminLayoutComponent {
}
