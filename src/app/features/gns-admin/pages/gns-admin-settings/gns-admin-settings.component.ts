import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { ParametreGnsService } from '../../../../core/services/parametre-gns.service';
import { ParametreGnsResponse, ParametreGnsRequest, TypeParametreGns } from '../../../../core/models/gns-admin.model';
import { SkeletonModule } from 'primeng/skeleton';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-gns-admin-settings',
  standalone: true,
  imports: [CommonModule, SkeletonModule, FormsModule, FloatLabelModule, InputSwitchModule, InputTextModule, ButtonModule],
  templateUrl: './gns-admin-settings.component.html',
  styleUrls: ['./gns-admin-settings.component.scss']
})
export class GnsAdminSettingsComponent implements OnInit {
  activeTab = signal<string>('plateforme');
  isLoading = signal(true);
  
  profile = signal<any>(null);
  configs = signal<ParametreGnsResponse[]>([]);
  
  newParam = signal({ nomParametre: '', valeurParametre: '', description: '', estActif: true });

  private userService = inject(UserService);
  private parametreService = inject(ParametreGnsService);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.userService.getProfile().subscribe({
      next: (user) => this.profile.set(user),
      error: (err) => console.error('Error fetching profile', err)
    });

    this.parametreService.getAll(0, 100).subscribe({
      next: (data) => {
        this.configs.set(data.content || []);
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

  updateConfig(config: ParametreGnsResponse) {
    const request = {
      nomParametre: config.nomParametre,
      valeurParametre: config.valeurParametre,
      description: config.description,
      estActif: config.estActif
    };
    this.parametreService.saveOrUpdate(request).subscribe({
        next: () => console.log('Config updated'),
        error: (err) => console.error('Update failed', err)
    });
  }

  createConfig() {
    const p = this.newParam();
    if (!p.nomParametre || !p.valeurParametre) return;
    
    const request: ParametreGnsRequest = {
      nomParametre: p.nomParametre as TypeParametreGns,
      valeurParametre: p.valeurParametre,
      description: p.description,
      estActif: p.estActif
    };

    this.parametreService.saveOrUpdate(request).subscribe({
        next: () => {
            this.newParam.set({ nomParametre: '', valeurParametre: '', description: '', estActif: true });
            this.loadData();
        },
        error: (err) => console.error('Create param failed', err)
    });
  }
}
