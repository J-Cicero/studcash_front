import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ThemeEvent {
  key: string;
  bodyClass: string;
  isDark: boolean;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private subject = new BehaviorSubject<ThemeEvent>({ key: 'app-theme', bodyClass: 'app-dark', isDark: false });

  changes(): Observable<ThemeEvent> {
    return this.subject.asObservable();
  }

  init(themeKey = 'app-theme', bodyClass = 'app-dark') {
    const saved = localStorage.getItem(themeKey);
    const isDark = saved === 'dark';
    this.syncBody(bodyClass, isDark);
    this.subject.next({ key: themeKey, bodyClass, isDark });
  }

  toggle(themeKey = 'app-theme', bodyClass = 'app-dark') {
    const current = localStorage.getItem(themeKey) === 'dark';
    const next = current ? 'light' : 'dark';
    localStorage.setItem(themeKey, next);
    const isDark = next === 'dark';
    this.syncBody(bodyClass, isDark);
    this.subject.next({ key: themeKey, bodyClass, isDark });
  }

  private syncBody(bodyClass: string, isDark: boolean) {
    if (isDark) document.body.classList.add(bodyClass);
    else document.body.classList.remove(bodyClass);
  }
}
