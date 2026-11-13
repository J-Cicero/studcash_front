import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardService } from '../../../core/services/card.service';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {
  cards: any[] = [];
  filteredCards: any[] = [];
  isLoading = true;
  errorMessage = '';
  searchQuery = '';
  filterStatus = 'ALL';

  openRowMenuId: string | null = null;
  selectedCard: any | null = null;

  constructor(
    private cardService: CardService,
    private confirmService: ConfirmDialogService,
    private route: ActivatedRoute
  ) {}

  getShortTrackingId(trackingId: string | undefined | null, length: number = 8): string {
    if (!trackingId) return 'N/A';
    return String(trackingId).substring(0, length).toUpperCase();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openRowMenuId = null;
  }

  toggleRowMenu(trackingId: string, event: Event): void {
    event.stopPropagation();
    this.openRowMenuId = this.openRowMenuId === trackingId ? null : trackingId;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
    });
    this.loadCards();
  }

  loadCards(): void {
    this.isLoading = true;
    this.cardService.getCards().subscribe({
      next: (res: any) => {
        this.cards = res.content || res || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        if (err.status === 404) {
          this.cards = [];
          this.applyFilter();
        } else {
          this.errorMessage = 'Impossible de charger la liste des cartes.';
        }
        this.isLoading = false;
      }
    });
  }

  get totalCardsCount(): number {
    return (this.cards || []).length;
  }

  get pendingCardsCount(): number {
    return (this.cards || []).filter(c => c.statutCarte === 'EN_ATTENTE').length;
  }

  get readyCardsCount(): number {
    return (this.cards || []).filter(c => c.statutCarte === 'PRETE').length;
  }

  get activeCardsCount(): number {
    return (this.cards || []).filter(c => c.statutCarte === 'ACTIVE').length;
  }

  get blockedCardsCount(): number {
    return (this.cards || []).filter(c => c.statutCarte === 'BLOQUEE' || c.statutCarte === 'PERDUE').length;
  }

  applyFilter(): void {
    let temp = this.cards || [];
    
    if (this.filterStatus !== 'ALL') {
      if (this.filterStatus === 'BLOQUEE') {
        temp = temp.filter(c => c.statutCarte === 'BLOQUEE' || c.statutCarte === 'PERDUE');
      } else {
        temp = temp.filter(c => c.statutCarte === this.filterStatus);
      }
    }
    
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      temp = temp.filter(c => {
        const nom = (c.studentNom || '').toLowerCase();
        const prenom = (c.studentPrenom || '').toLowerCase();
        const fullName = `${prenom} ${nom}`.trim();
        const reverseName = `${nom} ${prenom}`.trim();
        const matricule = (c.studentMatricule || '').toLowerCase();
        const email = (c.studentEmail || '').toLowerCase();
        const univ = (c.universiteNom || '').toLowerCase();
        const tracking = (c.trackingId || '').toLowerCase();
        const cardNum = (c.cardNumber || '').toLowerCase();
        const qr = (c.qrCodeData || '').toLowerCase();
        return nom.includes(q) ||
               prenom.includes(q) ||
               fullName.includes(q) ||
               reverseName.includes(q) ||
               matricule.includes(q) ||
               email.includes(q) ||
               univ.includes(q) ||
               tracking.includes(q) ||
               cardNum.includes(q) ||
               qr.includes(q);
      });
    }
    
    this.filteredCards = temp;
  }

  setFilterStatus(status: string): void {
    this.filterStatus = status;
    this.applyFilter();
  }

  openCardDetails(card: any): void {
    this.openRowMenuId = null;
    this.selectedCard = card;
  }

  closeCardDetails(): void {
    this.selectedCard = null;
  }

  async updateCardStatus(trackingId: string, nouveauStatut: string): Promise<void> {
    this.openRowMenuId = null;
    const confirmed = await this.confirmService.confirm({
      title: 'Changement de statut de la carte',
      message: `Voulez-vous vraiment passer le statut de cette carte à ${nouveauStatut} ?`,
      confirmText: 'Confirmer',
      type: nouveauStatut === 'BLOQUEE' ? 'danger' : 'warning'
    });

    if (confirmed) {
      this.cardService.update(trackingId, { status: nouveauStatut, statutCarte: nouveauStatut }).subscribe({
        next: () => {
          if (this.selectedCard && this.selectedCard.trackingId === trackingId) {
            this.selectedCard.statutCarte = nouveauStatut;
          }
          this.loadCards();
        },
        error: (err) => {
          console.error('Update error:', err);
          this.confirmService.alert("Erreur lors de la mise à jour du statut.", "Erreur", "danger");
        }
      });
    }
  }

  formatNumber(value: number): string {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  printCard(card: any): void {
    this.openRowMenuId = null;
    const printWindow = window.open('', '_blank', 'width=440,height=480');
    if (!printWindow) {
      this.confirmService.alert("Veuillez autoriser les popups pour pouvoir imprimer le QR Code.", "Impression", "warning");
      return;
    }

    const qrData = card.qrCodeData || card.trackingId;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
    const studentFullName = (card.studentPrenom || card.studentNom) 
      ? `${card.studentPrenom || ''} ${card.studentNom || ''}`.trim() 
      : 'Étudiant GNS';
    const matricule = card.studentMatricule ? `Matricule : ${card.studentMatricule}` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code StudCash - ${studentFullName}</title>
          <style>
            body {
              font-family: 'Inter', 'Arial', sans-serif;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              text-align: center;
              background: #f8fafc;
            }
            .qr-box {
              padding: 24px;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              background: #fff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            .brand {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              margin-bottom: 12px;
            }
            img {
              width: 240px;
              height: 240px;
              display: block;
              margin: 0 auto 16px auto;
            }
            .student-name {
              font-size: 17px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .matricule {
              font-size: 12px;
              color: #475569;
              margin-bottom: 6px;
              font-weight: 600;
            }
            .card-number {
              font-size: 12px;
              color: #64748b;
              font-family: monospace;
              background: #f1f5f9;
              padding: 4px 8px;
              border-radius: 6px;
              display: inline-block;
            }
            @media print {
              body { background: #fff; }
              .qr-box { border: 1px solid #cbd5e1; box-shadow: none; }
            }
          </style>
        </head>
        <body onload="setTimeout(function(){ window.print(); window.close(); }, 300);">
          <div class="qr-box">
            <div class="brand">StudCash • Carte Étudiante GNS</div>
            <img src="${qrCodeUrl}" alt="QR Code">
            <div class="student-name">${studentFullName}</div>
            ${matricule ? `<div class="matricule">${matricule}</div>` : ''}
            <div class="card-number">${card.cardNumber || card.trackingId}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
