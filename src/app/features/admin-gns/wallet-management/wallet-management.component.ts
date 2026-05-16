import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Wallet {
  id: string;
  ownerName: string;
  ownerType: 'ETUDIANT' | 'BOUTIQUE';
  soldeRelais: number;
  soldeHorizon: number;
  status: 'ACTIVE' | 'BLOCKED';
}

@Component({
  selector: 'app-wallet-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet-management.component.html',
  styleUrl: './wallet-management.component.scss'
})
export class WalletManagementComponent implements OnInit {
  wallets: Wallet[] = [
    { id: 'W-001', ownerName: 'Koffi Jude', ownerType: 'ETUDIANT', soldeRelais: 25000, soldeHorizon: 150000, status: 'ACTIVE' },
    { id: 'W-002', ownerName: 'Boutique Central UL', ownerType: 'BOUTIQUE', soldeRelais: 450000, soldeHorizon: 0, status: 'ACTIVE' },
    { id: 'W-003', ownerName: 'Amah Ayélé', ownerType: 'ETUDIANT', soldeRelais: 5000, soldeHorizon: 75000, status: 'ACTIVE' },
    { id: 'W-004', ownerName: 'Fast Food Campus', ownerType: 'BOUTIQUE', soldeRelais: 120000, soldeHorizon: 0, status: 'ACTIVE' }
  ];

  selectedWallet: Wallet | null = null;
  topupAmount: number = 0;
  topupType: 'RELAIS' | 'HORIZON' = 'RELAIS';

  constructor() {}
  ngOnInit(): void {}

  openTopupModal(wallet: Wallet) {
    this.selectedWallet = wallet;
    this.topupAmount = 0;
  }

  processTopup() {
    if (!this.selectedWallet || this.topupAmount <= 0) return;
    
    // Logic simulation
    if (this.topupType === 'RELAIS') {
      this.selectedWallet.soldeRelais += this.topupAmount;
    } else {
      this.selectedWallet.soldeHorizon += this.topupAmount;
    }

    console.log(`Versement de ${this.topupAmount} FCFA effectué sur le compte ${this.topupType} de ${this.selectedWallet.ownerName}`);
    this.selectedWallet = null;
  }
}
