import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { UniversiteService } from '../../../../core/services/universite.service';

@Component({
  selector: 'app-univ-settings',
  standalone: true,
  imports: [CommonModule, SkeletonModule, TagModule],
  templateUrl: './univ-settings.component.html',
  styleUrls: ['./univ-settings.component.scss']
})
export class UnivSettingsComponent implements OnInit {
  isLoading = signal(true);
  profile = signal<any>(null);
  university = signal<any>(null);

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private univService = inject(UniversiteService);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    const univId = this.authService.universityId();

    this.userService.getProfile().subscribe({
      next: (user) => this.profile.set(user),
      error: (err) => console.error('Error fetching profile', err)
    });

    if (univId) {
      this.univService.getByTrackingId(univId).subscribe({
        next: (univ) => {
          this.university.set(univ);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error fetching university', err);
          this.isLoading.set(false);
        }
      });
    } else {
        this.isLoading.set(false);
    }
  }
}
