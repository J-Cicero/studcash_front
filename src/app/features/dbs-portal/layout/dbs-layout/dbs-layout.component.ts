import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dbs-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dbs-layout.component.html',
  styleUrls: ['./dbs-layout.component.scss']
})
export class DbsLayoutComponent {
}
