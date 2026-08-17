import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ScolariteYear {
  trackingId: string;
  label: string;
  isOpen: boolean;
  isClosed: boolean;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AcademicYearContextService {

  private selectedYearSubject = new BehaviorSubject<ScolariteYear | null>(null);
  public selectedYear$ = this.selectedYearSubject.asObservable();

  /**
   * Returns true if the selected year is NOT the active open year.
   * This disables write operations (validation, creation, etc.) in historical mode.
   */
  public isReadOnly$: Observable<boolean> = this.selectedYear$.pipe(
    map(year => year !== null && !year.isOpen)
  );

  get selectedYear(): ScolariteYear | null {
    return this.selectedYearSubject.value;
  }

  setSelectedYear(year: ScolariteYear | null): void {
    this.selectedYearSubject.next(year);
  }

  /**
   * Returns true if we are currently in historical read-only mode.
   */
  get isReadOnly(): boolean {
    const year = this.selectedYearSubject.value;
    return year !== null && !year.isOpen;
  }
}
