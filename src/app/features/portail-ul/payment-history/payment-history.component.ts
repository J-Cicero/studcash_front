import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

const pdfMakeConfig = (pdfMake as any).default ?? (pdfMake as any);
const pdfFontsConfig = (pdfFonts as any).default ?? (pdfFonts as any);
const pdfVfs = pdfFontsConfig?.pdfMake?.vfs ?? pdfFontsConfig?.vfs;

if (pdfMakeConfig && pdfVfs) {
  pdfMakeConfig.vfs = pdfVfs;
}

interface Transaction {
  id: number;
  reference: string;
  nom: string;
  filiere: string;
  mode: string;
  montant: number;
  date: string;
  status: 'Payé' | 'En attente' | 'Échoué';
}

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent {
  isCalculating = false;
  showTotal = false;
  
  transactions: Transaction[] = [
    { id: 1, reference: 'TX-UL-001', nom: 'Koffi Jude', filiere: 'Informatique (FDS)', mode: 'Portefeuille', montant: 50000, date: '2026-05-24', status: 'Payé' },
    { id: 2, reference: 'TX-UL-002', nom: 'Amah Ayélé', filiere: 'Gestion (FASEG)', mode: 'Mobile Money', montant: 125000, date: '2026-05-24', status: 'Payé' },
    { id: 3, reference: 'TX-UL-003', nom: 'Salami Moussa', filiere: 'Droit (FDD)', mode: 'Carte Bancaire', montant: 45000, date: '2026-05-23', status: 'En attente' },
    { id: 4, reference: 'TX-UL-004', nom: 'Lawson Akouvi', filiere: 'Médecine (FSS)', mode: 'Portefeuille', montant: 250000, date: '2026-05-23', status: 'Payé' },
    { id: 5, reference: 'TX-UL-005', nom: 'Gado Komlan', filiere: 'Lettres (FLESH)', mode: 'Mobile Money', montant: 30000, date: '2026-05-22', status: 'Payé' },
    { id: 6, reference: 'TX-UL-006', nom: 'Togo Essi', filiere: 'Sciences (FDS)', mode: 'Portefeuille', montant: 50000, date: '2026-05-22', status: 'Échoué' },
    { id: 7, reference: 'TX-UL-007', nom: 'Mensah Yao', filiere: 'Économie (FASEG)', mode: 'Mobile Money', montant: 75000, date: '2026-05-21', status: 'Payé' },
    { id: 8, reference: 'TX-UL-008', nom: 'Doh Afi', filiere: 'Droit (FDD)', mode: 'Carte Bancaire', montant: 45000, date: '2026-05-21', status: 'Payé' },
    { id: 9, reference: 'TX-UL-009', nom: 'Kuevidjin Marc', filiere: 'Informatique (FDS)', mode: 'Portefeuille', montant: 50000, date: '2026-05-20', status: 'Payé' },
    { id: 10, reference: 'TX-UL-010', nom: 'Adando Jean', filiere: 'Gestion (FASEG)', mode: 'Mobile Money', montant: 125000, date: '2026-05-20', status: 'Payé' },
  ];

  get totalAmount(): number {
    return this.transactions
      .filter(tx => tx.status === 'Payé')
      .reduce((sum, tx) => sum + tx.montant, 0);
  }

  calculateTotal() {
    this.isCalculating = true;
    this.showTotal = false;
    
    // Simulation d'une récupération de données (1.5s)
    setTimeout(() => {
      this.isCalculating = false;
      this.showTotal = true;
    }, 1500);
  }

  generatePDF(transaction: Transaction) {
    const docDefinition = {
      content: [
        { text: 'UNIVERSITÉ DE LOMÉ', style: 'header', alignment: 'center' },
        { text: 'REÇU DE PAIEMENT OFFICIEL', style: 'subheader', alignment: 'center', margin: [0, 10, 0, 20] },
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'Détails de l\'étudiant', bold: true, decoration: 'underline', margin: [0, 0, 0, 10] },
                { text: `Nom: ${transaction.nom}` },
                { text: `Filière: ${transaction.filiere}` },
              ]
            },
            {
              width: '*',
              stack: [
                { text: 'Détails de la transaction', bold: true, decoration: 'underline', margin: [0, 0, 0, 10] },
                { text: `Référence: ${transaction.reference}` },
                { text: `Date: ${transaction.date}` },
                { text: `Mode: ${transaction.mode}` },
              ]
            }
          ]
        },
        { text: '', margin: [0, 20] },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [{ text: 'Description', bold: true, fillColor: '#f8fafc' }, { text: 'Montant', bold: true, fillColor: '#f8fafc' }],
              ['Frais d\'inscription universitaire 2026', `${transaction.montant.toLocaleString()} FCFA`],
              [{ text: 'TOTAL', bold: true }, { text: `${transaction.montant.toLocaleString()} FCFA`, bold: true }]
            ]
          }
        },
        { text: '', margin: [0, 30] },
        { text: 'Statut du paiement: CONFIRMÉ', color: '#14532d', bold: true, alignment: 'right' },
        { text: 'Ce document sert de preuve officielle de paiement.', fontSize: 10, italic: true, margin: [0, 50, 0, 0], alignment: 'center' }
      ],
      styles: {
        header: { fontSize: 22, bold: true, color: '#14532d' },
        subheader: { fontSize: 16, bold: true, color: '#64748b' }
      }
    };

    if (!pdfMakeConfig?.createPdf) {
      console.error('pdfMake est indisponible.');
      return;
    }
    pdfMakeConfig.createPdf(docDefinition as any).download(`recu_${transaction.reference}.pdf`);
  }
}
