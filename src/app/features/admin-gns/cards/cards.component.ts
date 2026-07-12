import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardService } from '../../../core/services/card.service';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';

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

  constructor(private cardService: CardService) {}

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

  updateCardStatus(trackingId: string, nouveauStatut: string): void {
    if(confirm(`Voulez-vous vraiment changer le statut de cette carte en ${nouveauStatut} ?`)) {
      this.cardService.update(trackingId, { statutCarte: nouveauStatut }).subscribe({
        next: () => {
          this.loadCards();
        },
        error: () => {
          alert("Erreur lors de la mise à jour du statut.");
        }
      });
    }
  }

  printCard(card: any): void {
    const printWindow = window.open('', '_blank', 'width=600,height=400');
    if (!printWindow) {
      alert("Veuillez autoriser les popups pour pouvoir imprimer la carte.");
      return;
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(card.qrCodeData)}`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Impression Carte - ${card.studentNom} ${card.studentPrenom}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f1f5f9;
            }
            .card {
              width: 337px; /* 85.6mm */
              height: 212px; /* 53.98mm */
              background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
              border-radius: 12px;
              padding: 16px;
              box-sizing: border-box;
              color: white;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
              position: relative;
              overflow: hidden;
            }
            .card::before {
              content: '';
              position: absolute;
              top: -50px;
              right: -50px;
              width: 150px;
              height: 150px;
              background: rgba(99, 102, 241, 0.15);
              border-radius: 50%;
              filter: blur(20px);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .logo {
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #94a3b8;
            }
            .card-title {
              font-size: 11px;
              font-weight: 500;
              color: #cbd5e1;
              margin-top: 2px;
            }
            .card-number {
              font-family: 'Courier New', Courier, monospace;
              font-size: 16px;
              letter-spacing: 3px;
              color: #f8fafc;
              margin: 12px 0;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .info-label {
              font-size: 7px;
              text-transform: uppercase;
              color: #94a3b8;
              letter-spacing: 1px;
            }
            .info-value {
              font-size: 11px;
              font-weight: 700;
              color: #f8fafc;
            }
            .qr-container {
              position: absolute;
              right: 16px;
              top: 50%;
              transform: translateY(-50%);
              background: white;
              padding: 4px;
              border-radius: 6px;
              display: flex;
            }
            .qr-container img {
              width: 65px;
              height: 65px;
            }
            @media print {
              body {
                background-color: transparent;
              }
              .card {
                box-shadow: none;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="card">
            <div class="header">
              <div>
                <div class="logo">Global Network System</div>
                <div class="card-title">CARTE ÉTUDIANTE</div>
              </div>
            </div>
            
            <div class="card-number">${card.cardNumber}</div>
            
            <div class="qr-container">
              <img src="${qrCodeUrl}" alt="QR Code">
            </div>
            
            <div class="footer">
              <div>
                <div class="info-label">Titulaire</div>
                <div class="info-value">${card.studentPrenom} ${card.studentNom}</div>
              </div>
              <div style="text-align: right; margin-right: 80px;">
                <div class="info-label">Expire fin</div>
                <div class="info-value">${new Date(card.dateExpiration).toLocaleDateString('fr-FR', {month: '2-digit', year: 'numeric'})}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
