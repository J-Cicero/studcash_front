import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boutique-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boutique-map.component.html',
  styleUrl: './boutique-map.component.scss'
})
export class BoutiqueMapComponent implements OnInit {
  shops = [
    { name: 'Cafétéria Centrale', lat: 6.175, lng: 1.213 },
    { name: 'Photocopie Plus', lat: 6.176, lng: 1.214 },
    { name: 'Librairie UL', lat: 6.174, lng: 1.212 }
  ];

  constructor() {}
  ngOnInit(): void {}
}
