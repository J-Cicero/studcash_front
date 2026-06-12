import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { BoutiqueService, BoutiqueResponse } from '../../../core/services/boutique.service';

// Fix for leaflet default icons in Angular
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-boutiques-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boutiques-map.component.html',
  styleUrls: ['./boutiques-map.component.scss']
})
export class BoutiquesMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map: L.Map | undefined;
  boutiques: BoutiqueResponse[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private boutiqueService: BoutiqueService) {}

  ngOnInit(): void {
    this.loadBoutiques();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Centre sur le Togo
    this.map = L.map('map', {
      center: [8.6195, 0.8248],
      zoom: 7
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadBoutiques(): void {
    this.isLoading = true;
    this.boutiqueService.getAllBoutiques(0, 500).subscribe({
      next: (res) => {
        this.boutiques = res.content || [];
        this.isLoading = false;
        this.addMarkersToMap();
      },
      error: (err) => {
        this.boutiques = [];
        this.isLoading = false;
      }
    });
  }

  private addMarkersToMap(): void {
    if (!this.map) return;

    const bounds = L.latLngBounds([]);

    this.boutiques.forEach(b => {
      const lat = Number(b.latitude);
      const lng = Number(b.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const popupContent = `
          <div class="p-3">
            <h3 class="font-bold text-lg text-slate-900">${b.nomBoutique}</h3>
            <p class="text-sm text-slate-600">${b.categorieShop || 'Boutique'}</p>
            <p class="text-xs text-slate-400 mt-2">KYC: ${b.statutKYC}</p>
          </div>
        `;

        const marker = L.marker([lat, lng])
          .bindPopup(popupContent)
          .on('mouseover', (e) => {
            marker.openPopup();
          });
        
        marker.addTo(this.map!);
        bounds.extend([lat, lng]);
      }
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }
}
