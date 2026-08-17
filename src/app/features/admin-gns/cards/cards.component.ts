import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(
    private cardService: CardService,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.isLoading = true;
    this.cardService.getCards().subscribe({
      next: (res: any) => {
        // Assuming the backend might return a page object or a direct array
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

  applyFilter(): void {
    let temp = this.cards;
    
    if (this.filterStatus !== 'ALL') {
      temp = temp.filter(c => c.statutCarte === this.filterStatus);
    }
    
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      temp = temp.filter(c => 
        (c.studentNom && c.studentNom.toLowerCase().includes(q)) || 
        (c.studentPrenom && c.studentPrenom.toLowerCase().includes(q)) ||
        (c.trackingId && c.trackingId.toLowerCase().includes(q))
      );
    }
    
    this.filteredCards = temp;
  }

  setFilterStatus(status: string): void {
    this.filterStatus = status;
    this.applyFilter();
  }

  async updateCardStatus(trackingId: string, nouveauStatut: string): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Changement de statut',
      message: `Voulez-vous vraiment changer le statut de cette carte en ${nouveauStatut} ?`,
      confirmText: 'Changer',
      type: 'warning'
    });

    if (confirmed) {
      this.cardService.update(trackingId, { status: nouveauStatut, statutCarte: nouveauStatut }).subscribe({
        next: () => {
          this.loadCards();
        },
        error: (err) => {
          console.error('Update error:', err);
          this.confirmService.alert("Erreur lors de la mise à jour du statut.", "Erreur", "danger");
        }
      });
    }
  }

  printCard(card: any): void {
    const printWindow = window.open('', '_blank', 'width=400,height=400');
    if (!printWindow) {
      this.confirmService.alert("Veuillez autoriser les popups pour pouvoir imprimer le QR Code.", "Impression", "warning");
      return;
    }

    const qrData = card.qrCodeData || card.trackingId;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
    const studentFullName = (card.studentPrenom || card.studentNom) 
      ? `${card.studentPrenom || ''} ${card.studentNom || ''}`.trim() 
      : 'Étudiant GNS';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${studentFullName}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .qr-box {
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
              background: #fff;
            }
            img {
              width: 250px;
              height: 250px;
              display: block;
              margin: 0 auto 15px auto;
            }
            .student-name {
              font-size: 16px;
              font-weight: bold;
              color: #1e293b;
              margin-bottom: 5px;
            }
            .card-number {
              font-size: 13px;
              color: #64748b;
              font-family: monospace;
            }
            @media print {
              .qr-box {
                border: none;
              }
            }
          </style>
        </head>
        <body onload="setTimeout(function(){ window.print(); window.close(); }, 300);">
          <div class="qr-box">
            <img src="${qrCodeUrl}" alt="QR Code">
            <div class="student-name">${studentFullName}</div>
            <div class="card-number">${card.cardNumber || card.trackingId}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
