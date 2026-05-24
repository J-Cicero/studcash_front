import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-dbs-settings',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  templateUrl: './dbs-settings.component.html',
  styleUrls: ['./dbs-settings.component.scss']
})
export class DbsSettingsComponent implements OnInit {
  isLoading = signal(true);
  profile = signal<any>(null);

  private userService = inject(UserService);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profile.set(user);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching DBS profile', err);
        this.isLoading.set(false);
      }
    });
  }
}
