import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversityPortalService } from '../../../core/services/university-portal.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-university-inscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inscriptions.component.html',
  styleUrls: ['./inscriptions.component.scss']
})
export class InscriptionsComponent implements OnInit {
  inscriptions: any[] = [];
  isLoading = true;

  constructor(private universityPortalService: UniversityPortalService) {}

  ngOnInit(): void {
    this.universityPortalService.getMyProfile().pipe(
      switchMap(profile => this.universityPortalService.getInscriptions(profile.universiteTrackingId))
    ).subscribe({
      next: (data) => {
        this.inscriptions = data.content || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
