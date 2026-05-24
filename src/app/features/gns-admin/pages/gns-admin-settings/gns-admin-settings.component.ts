import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { ConfigurationService, ConfigurationGns } from '../../../../core/services/configuration.service';
import { SkeletonModule } from 'primeng/skeleton';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gns-admin-settings',
  standalone: true,
  imports: [CommonModule, SkeletonModule, FormsModule],
  templateUrl: './gns-admin-settings.component.html',
  styleUrls: ['./gns-admin-settings.component.scss']
})
export class GnsAdminSettingsComponent implements OnInit {
  activeTab = signal<string>('mon-profil');
  isLoading = signal(true);
  
  profile = signal<any>(null);
  configs = signal<ConfigurationGns[]>([]);

  private userService = inject(UserService);
  private configService = inject(ConfigurationService);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.userService.getProfile().subscribe({
      next: (user) => this.profile.set(user),
      error: (err) => console.error('Error fetching profile', err)
    });

    this.configService.getAll().subscribe({
      next: (data) => {
        this.configs.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching configs', err);
        this.isLoading.set(false);
      }
    });
  }

  switchTab(tabId: string) {
    this.activeTab.set(tabId);
  }

  updateConfig(cle: string, valeur: string) {
    this.configService.update(cle, valeur).subscribe({
        next: () => console.log('Config updated'),
        error: (err) => console.error('Update failed', err)
    });
  }
}
