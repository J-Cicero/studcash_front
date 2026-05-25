import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../../core/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <button pButton type="button" class="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 p-button-text"
      [icon]="isDark ? 'pi pi-sun' : 'pi pi-moon'" (click)="toggle()" [attr.title]="isDark ? 'Mode clair' : 'Mode sombre'"></button>
  `
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  @Input() themeKey = 'gns-admin-theme';
  @Input() bodyClass = 'gns-admin-dark';

  isDark = false;
  private sub: Subscription | null = null;

  constructor(private theme: ThemeService) {}

  ngOnInit(): void {
    this.sub = this.theme.changes().subscribe(evt => {
      if (evt.key === this.themeKey) this.isDark = evt.isDark;
    });
    this.theme.init(this.themeKey, this.bodyClass);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggle(): void {
    this.theme.toggle(this.themeKey, this.bodyClass);
  }
}
