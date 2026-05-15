import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="flex h-screen bg-[#f8fafc] font-sans">
      <!-- Sidebar fixe (cachée sur mobile) -->
      <app-sidebar class="hidden lg:block"></app-sidebar>

      <!-- Zone de contenu -->
      <div class="flex-1 flex flex-col lg:ml-64 min-h-screen overflow-hidden w-full">
        <!-- Topbar fixe en haut -->
        <app-topbar></app-topbar>

        <!-- Contenu variable avec scroll indépendant -->
        <main class="flex-1 overflow-y-auto p-4 md:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class MainLayoutComponent {}
