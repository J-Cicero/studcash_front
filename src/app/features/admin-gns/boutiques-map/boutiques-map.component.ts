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
    // Default center (Cameroon) if no boutiques are loaded yet
    this.map = L.map('map', {
      center: [4.0511, 9.7679], // Douala approximate
      zoom: 6
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadBoutiques(): void {
    this.isLoading = true;
    // We fetch a high size (e.g. 500) to display as many as possible on the map
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

    let hasMarkers = false;
    const markers: L.Marker[] = [];

    this.boutiques.forEach(b => {
      // We only place the boutique if it has valid coordinates recorded
      if (b.latitude && b.longitude) {
        hasMarkers = true;
        
        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <h3 class="font-bold text-slate-900 text-base mb-1">${b.nomBoutique}</h3>
            <p class="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">${b.categorieShop}</p>
            <div class="flex items-center mt-3">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                b.statutKYC === 'VALIDE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }">
                KYC: ${b.statutKYC}
              </span>
            </div>
          </div>
        `;

        const marker = L.marker([b.latitude, b.longitude]).bindPopup(popupContent);
        marker.addTo(this.map!);
        markers.push(marker);
      }
    });

    // If we have valid markers, zoom the map to fit them all
    if (hasMarkers && markers.length > 0) {
      const group = new L.FeatureGroup(markers);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }
}
