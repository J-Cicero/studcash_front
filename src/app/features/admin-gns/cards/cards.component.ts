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
      this.cardService.update(trackingId, { status: nouveauStatut, statutCarte: nouveauStatut }).subscribe({
        next: () => {
          this.loadCards();
        },
        error: (err) => {
          console.error('Update error:', err);
          alert("Erreur lors de la mise à jour du statut.");
        }
      });
    }
  }

  printCard(card: any): void {
    const printWindow = window.open('', '_blank', 'width=650,height=450');
    if (!printWindow) {
      alert("Veuillez autoriser les popups pour pouvoir imprimer la carte.");
      return;
    }

    const qrData = card.qrCodeData || card.trackingId;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    const studentFullName = (card.studentPrenom || card.studentNom) 
      ? `${card.studentPrenom || ''} ${card.studentNom || ''}`.trim() 
      : 'Étudiant GNS';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carte Étudiante GNS - ${studentFullName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #0f172a;
            }
            .card-wrapper {
              perspective: 1000px;
            }
            .card {
              width: 380px;
              height: 240px;
              background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%);
              border-radius: 16px;
              padding: 20px;
              box-sizing: border-box;
              color: white;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
              position: relative;
              overflow: hidden;
            }
            .card::before {
              content: '';
              position: absolute;
              top: -80px;
              right: -80px;
              width: 220px;
              height: 220px;
              background: radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, rgba(99, 102, 241, 0) 70%);
              border-radius: 50%;
            }
            .chip {
              width: 40px;
              height: 30px;
              background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
              border-radius: 6px;
              position: relative;
              overflow: hidden;
            }
            .chip::after {
              content: '';
              position: absolute;
              inset: 3px;
              border: 1px solid rgba(0,0,0,0.2);
              border-radius: 3px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .logo-text {
              font-size: 14px;
              font-weight: 800;
              letter-spacing: 1.5px;
              background: linear-gradient(to right, #ffffff, #a5b4fc);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .sub-title {
              font-size: 8px;
              font-weight: 700;
              color: #818cf8;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .card-number {
              font-family: 'Courier New', monospace;
              font-size: 17px;
              font-weight: 700;
              letter-spacing: 3px;
              color: #ffffff;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              margin: 10px 0;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .info-label {
              font-size: 7px;
              font-weight: 700;
              text-transform: uppercase;
              color: #94a3b8;
              letter-spacing: 1px;
              margin-bottom: 2px;
            }
            .info-value {
              font-size: 12px;
              font-weight: 700;
              color: #ffffff;
              text-transform: uppercase;
            }
            .qr-container {
              position: absolute;
              right: 20px;
              top: 50%;
              transform: translateY(-40%);
              background: #ffffff;
              padding: 6px;
              border-radius: 10px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
            }
            .qr-container img {
              width: 75px;
              height: 75px;
              display: block;
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
        <body onload="setTimeout(function(){ window.print(); window.close(); }, 500);">
          <div class="card-wrapper">
            <div class="card">
              <div class="header">
                <div class="brand">
                  <div class="chip"></div>
                  <div>
                    <div class="logo-text">studCASH</div>
                    <div class="sub-title">Carte Étudiante GNS</div>
                  </div>
                </div>
              </div>
              
              <div class="card-number">${card.cardNumber || 'STC-CARD'}</div>
              
              <div class="qr-container">
                <img src="${qrCodeUrl}" alt="QR Code">
              </div>
              
              <div class="footer">
                <div>
                  <div class="info-label">Titulaire</div>
                  <div class="info-value">${studentFullName}</div>
                </div>
                <div style="margin-right: 95px;">
                  <div class="info-label">Expire Fin</div>
                  <div class="info-value">${card.dateExpiration ? new Date(card.dateExpiration).toLocaleDateString('fr-FR', {month: '2-digit', year: 'numeric'}) : '12/2028'}</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
