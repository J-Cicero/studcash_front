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
}
