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
  activeCardFace: 'RECTO' | 'VERSO' = 'RECTO';

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
    this.activeCardFace = 'RECTO';
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
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      this.confirmService.alert("Veuillez autoriser les popups pour pouvoir imprimer la carte.", "Impression", "warning");
      return;
    }

    const qrData = card.qrCodeData || card.trackingId;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
    const studentFullName = (card.studentPrenom || card.studentNom) 
      ? `${card.studentPrenom || ''} ${card.studentNom || ''}`.trim() 
      : 'Étudiant GNS';
    const matricule = card.studentMatricule ? `Matricule : ${card.studentMatricule}` : 'N/A';
    const universite = card.universiteNom || 'Université Partenaire GNS';
    const dateExp = card.dateExpiration ? new Date(card.dateExpiration).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' }) : 'Exercice en cours';
    const numCarte = card.cardNumber || ('GNS-' + this.getShortTrackingId(card.trackingId, 10));

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Carte Étudiante StudCash - ${studentFullName}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f1f5f9;
              margin: 0;
              padding: 20px;
              color: #0f172a;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .header-info {
              text-align: center;
              margin-bottom: 25px;
            }
            .header-info h2 { margin: 0; font-size: 18px; font-weight: 800; color: #1e1b4b; }
            .header-info p { margin: 4px 0 0; font-size: 12px; color: #64748b; }

            .cards-container {
              display: flex;
              gap: 30px;
              flex-wrap: wrap;
              justify-content: center;
            }

            .card-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .card-label {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #64748b;
              margin-bottom: 8px;
            }

            /* Format Standard ISO CR80 PVC (85.6mm x 53.98mm) -> ~340px x 215px */
            .pvc-card {
              width: 340px;
              height: 215px;
              border-radius: 14px;
              position: relative;
              overflow: hidden;
              box-sizing: border-box;
              box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            }

            /* RECTO */
            .card-recto {
              background: linear-gradient(135deg, #090d16 0%, #171d33 50%, #2e1065 100%);
              color: #ffffff;
              padding: 16px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              border: 1px solid #334155;
            }
            .recto-top {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .brand-name {
              font-size: 11px;
              font-weight: 900;
              letter-spacing: 0.15em;
              color: #a5b4fc;
              text-transform: uppercase;
            }
            .univ-name {
              font-size: 9px;
              color: #94a3b8;
              margin-top: 2px;
            }
            .chip-nfc {
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .chip {
              width: 32px;
              height: 24px;
              background: linear-gradient(135deg, #fbbf24, #f59e0b);
              border-radius: 4px;
              border: 1px solid #d97706;
            }
            .student-info { margin-top: 10px; }
            .student-name {
              font-size: 15px;
              font-weight: 900;
              letter-spacing: 0.02em;
              text-transform: uppercase;
              color: #f8fafc;
            }
            .student-mat {
              font-size: 10px;
              color: #cbd5e1;
              font-family: monospace;
              margin-top: 2px;
            }
            .recto-bottom {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-top: 1px solid rgba(255,255,255,0.15);
              padding-top: 8px;
            }
            .card-number {
              font-size: 11px;
              font-family: monospace;
              font-weight: 700;
              letter-spacing: 0.1em;
              color: #f1f5f9;
            }
            .validity {
              text-align: right;
              font-size: 9px;
              color: #cbd5e1;
            }
            .validity strong {
              color: #fcd34d;
              font-size: 10px;
              display: block;
            }

            /* VERSO */
            .card-verso {
              background: linear-gradient(135deg, #090d16 0%, #1e293b 100%);
              color: #ffffff;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              border: 1px solid #334155;
            }
            .magnetic-band {
              width: 100%;
              height: 38px;
              background: #020617;
              margin-top: 14px;
              border-top: 1px solid #1e293b;
              border-bottom: 1px solid #1e293b;
            }
            .verso-body {
              padding: 0 16px;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .qr-wrapper {
              background: #ffffff;
              padding: 6px;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .qr-wrapper img {
              width: 76px;
              height: 76px;
              display: block;
            }
            .qr-caption {
              font-size: 7px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
              margin-top: 2px;
            }
            .verso-legal {
              flex: 1;
              font-size: 7.5px;
              line-height: 1.25;
              color: #94a3b8;
            }
            .verso-legal .warning {
              color: #fca5a5;
              font-weight: 700;
              margin-bottom: 3px;
            }
            .verso-bottom {
              padding: 6px 16px 10px;
              font-size: 8px;
              color: #64748b;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid rgba(255,255,255,0.08);
            }

            @media print {
              body { background: #ffffff; padding: 0; }
              .pvc-card { box-shadow: none; border: 1px solid #94a3b8; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body onload="setTimeout(function(){ window.print(); window.close(); }, 400);">
          <div class="header-info">
            <h2>StudCash GNS — Spécimen Carte PVC (CR80)</h2>
            <p>Valide strictement pour l'exercice universitaire actif : <strong>${dateExp}</strong></p>
          </div>

          <div class="cards-container">
            <!-- RECTO -->
            <div class="card-wrapper">
              <span class="card-label">Face Avant (Recto)</span>
              <div class="pvc-card card-recto">
                <div class="recto-top">
                  <div>
                    <div class="brand-name">StudCash GNS</div>
                    <div class="univ-name">${universite}</div>
                  </div>
                  <div class="chip-nfc">
                    <div class="chip"></div>
                  </div>
                </div>

                <div class="student-info">
                  <div class="student-name">${studentFullName}</div>
                  <div class="student-mat">${matricule}</div>
                </div>

                <div class="recto-bottom">
                  <div>
                    <span style="font-size: 7px; text-transform: uppercase; color: #94a3b8; display: block;">N° Carte</span>
                    <span class="card-number">${numCarte}</span>
                  </div>
                  <div class="validity">
                    <span>Valide jusqu'à</span>
                    <strong>${dateExp}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- VERSO -->
            <div class="card-wrapper">
              <span class="card-label">Face Arrière (Verso & QR Code)</span>
              <div class="pvc-card card-verso">
                <div class="magnetic-band"></div>

                <div class="verso-body">
                  <div class="qr-wrapper">
                    <img src="${qrCodeUrl}" alt="QR Paiement">
                    <span class="qr-caption">Scanner en Caisse</span>
                  </div>
                  <div class="verso-legal">
                    <div class="warning">CARTE STRICTEMENT PERSONNELLE</div>
                    <p>Cette carte est utilisable exclusivement au sein du réseau fermé StudCash auprès des commerçants et services universitaires agréés.</p>
                    <p>En cas de perte ou vol, l'étudiant doit immédiatement verrouiller son compte sur l'application mobile StudCash.</p>
                  </div>
                </div>

                <div class="verso-bottom">
                  <span>Support : support@studcash.com</span>
                  <span>Réseau GNS Sécurisé</span>
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
