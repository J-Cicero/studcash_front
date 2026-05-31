import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface WalletAlert {
  id: string;
  type: 'Etudiant' | 'Boutique';
  ownerName: string;
  balance: number;
  status: 'ACTIF' | 'GELE' | 'BLOQUE';
  suspiciousActivity: boolean;
  lastTransactionDate: Date;
}

@Component({
  selector: 'app-surveillance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './surveillance.component.html',
  styleUrls: ['./surveillance.component.scss']
})
export class SurveillanceComponent implements OnInit {
  wallets: WalletAlert[] = [];
  isLoading = true;
  isActionLoading = false;
  actionMessage = '';

  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.wallets = [
        { id: 'W-001', type: 'Etudiant', ownerName: 'Alice Dupont', balance: 450000, status: 'ACTIF', suspiciousActivity: true, lastTransactionDate: new Date() },
        { id: 'W-002', type: 'Boutique', ownerName: 'Librairie Universitaire', balance: 8000000, status: 'GELE', suspiciousActivity: false, lastTransactionDate: new Date(Date.now() - 86400000) },
        { id: 'W-003', type: 'Etudiant', ownerName: 'Marc Ndongo', balance: 12000, status: 'ACTIF', suspiciousActivity: false, lastTransactionDate: new Date(Date.now() - 172800000) },
      ];
      this.isLoading = false;
    }, 800);
  }

  gelerWallet(id: string) {
    this.isActionLoading = true;
    this.actionMessage = '';
    
    setTimeout(() => {
      const w = this.wallets.find(w => w.id === id);
      if (w) w.status = 'GELE';
      this.isActionLoading = false;
      this.actionMessage = `Le portefeuille ${id} a été gelé. Les transactions sortantes sont suspendues.`;
    }, 800);
  }

  bloquerWallet(id: string) {
    this.isActionLoading = true;
    this.actionMessage = '';
    
    setTimeout(() => {
      const w = this.wallets.find(w => w.id === id);
      if (w) w.status = 'BLOQUE';
      this.isActionLoading = false;
      this.actionMessage = `Le portefeuille ${id} a été strictement bloqué pour suspicion de fraude.`;
    }, 800);
  }

  debloquerWallet(id: string) {
    this.isActionLoading = true;
    this.actionMessage = '';
    
    setTimeout(() => {
      const w = this.wallets.find(w => w.id === id);
      if (w) {
        w.status = 'ACTIF';
        w.suspiciousActivity = false;
      }
      this.isActionLoading = false;
      this.actionMessage = `Le portefeuille ${id} est à nouveau actif.`;
    }, 800);
  }
}
