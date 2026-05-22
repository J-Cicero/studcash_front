import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bank-virements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bank-virements.component.html',
  styleUrls: ['./bank-virements.component.scss']
})
export class BankVirementsComponent {
  amountStr = signal('15 000 000');
  
  onAmountBlur(event: Event) {
    const target = event.target as HTMLInputElement;
    const val = parseFloat(target.value.replace(/\s/g, ''));
    if(!isNaN(val)) {
        this.amountStr.set(new Intl.NumberFormat('fr-FR').format(val));
    }
  }

  // Calculate fees
  get fees() {
    const val = parseFloat(this.amountStr().replace(/\s/g, ''));
    if(isNaN(val)) return 0;
    return val > 0 ? 2500 : 0; // Simulated flat fee
  }

  get total() {
    const val = parseFloat(this.amountStr().replace(/\s/g, ''));
    if(isNaN(val)) return 0;
    return val + this.fees;
  }
}
