import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Mandat {
  id: string;
  name: string;
  amount: string;
  time: string;
  matricule: string;
}

@Component({
  selector: 'app-bank-mandats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bank-mandats.component.html',
  styleUrls: ['./bank-mandats.component.scss']
})
export class BankMandatsComponent {
  mandats = signal<Mandat[]>([
    { id: 'REF-2023-0045', name: 'KOFFI Amenan Esther', amount: '75 000 FCFA', time: 'Il y a 14 mins', matricule: '23-UAO-1284' },
    { id: 'REF-2023-0044', name: 'DIABATE Moussa', amount: '120 000 FCFA', time: 'Il y a 32 mins', matricule: '23-UAO-1285' },
    { id: 'REF-2023-0043', name: 'TRAORE Bakary', amount: '50 000 FCFA', time: 'Il y a 1 heure', matricule: '23-UAO-1286' },
    { id: 'REF-2023-0042', name: 'YABOUE Ange', amount: '95 000 FCFA', time: 'Hier, 16:45', matricule: '23-UAO-1287' }
  ]);
  
  activeMandat = signal<Mandat>(this.mandats()[0]);
  zoomScale = signal<number>(1);

  selectMandat(m: Mandat) {
    this.activeMandat.set(m);
  }

  zoomIn() {
    this.zoomScale.update(s => s + 0.1);
  }

  zoomOut() {
    this.zoomScale.update(s => s > 0.5 ? s - 0.1 : s);
  }
}
