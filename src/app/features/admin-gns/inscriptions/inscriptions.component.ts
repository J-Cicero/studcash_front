import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Inscription {
  trackingId: string;
  studentName: string;
  universityName: string;
  amount: number;
  status: string;
  date: Date;
}

@Component({
  selector: 'app-inscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inscriptions.component.html',
  styleUrls: ['./inscriptions.component.scss']
})
export class InscriptionsComponent implements OnInit {
  inscriptions: Inscription[] = [];
  isLoading = true;
  isActionLoading = false;
  actionMessage = '';

  constructor() {}

  ngOnInit(): void {
    // Simulation API Call
    setTimeout(() => {
      this.inscriptions = [
        { trackingId: 'ins-001', studentName: 'Alice Dupont', universityName: 'Université de Douala', amount: 50000, status: 'EN_ATTENTE', date: new Date() },
        { trackingId: 'ins-002', studentName: 'Marc Ndongo', universityName: 'Université de Yaoundé I', amount: 50000, status: 'VALIDEE', date: new Date(Date.now() - 86400000) },
        { trackingId: 'ins-003', studentName: 'Sophie Mbarga', universityName: 'Université de Dschang', amount: 50000, status: 'REJETEE', date: new Date(Date.now() - 172800000) },
      ];
      this.isLoading = false;
    }, 1000);
  }

  validerInscription(id: string) {
    this.isActionLoading = true;
    this.actionMessage = '';
    
    // Simulation API
    setTimeout(() => {
      const ins = this.inscriptions.find(i => i.trackingId === id);
      if (ins) ins.status = 'VALIDEE';
      this.isActionLoading = false;
      this.actionMessage = `L'inscription ${id} a été validée avec succès.`;
    }, 800);
  }

  rejeterInscription(id: string) {
    this.isActionLoading = true;
    this.actionMessage = '';
    
    // Simulation API
    setTimeout(() => {
      const ins = this.inscriptions.find(i => i.trackingId === id);
      if (ins) ins.status = 'REJETEE';
      this.isActionLoading = false;
      this.actionMessage = `L'inscription ${id} a été rejetée.`;
    }, 800);
  }
}
