import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Transaction {
  id: string;
  type: string;
  typeClass: string;
  desc: string;
  student: string;
  amount: string;
  date: string;
}

@Component({
  selector: 'app-univ-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './univ-transactions.component.html',
  styleUrls: ['./univ-transactions.component.scss']
})
export class UnivTransactionsComponent {
  transactions = signal<Transaction[]>([
    {
      id: '#TRX-9482',
      type: 'SCOLARITE_UNIVERSITY',
      typeClass: 'bg-blue-100 text-blue-900',
      desc: 'Paiement 2ème Tranche 2023-2024',
      student: 'AMOUZOU Kodjo',
      amount: '75.000 FCFA',
      date: '24 Mai 2024'
    },
    {
      id: '#TRX-9481',
      type: 'ENTRANT',
      typeClass: 'bg-green-100 text-green-700',
      desc: 'Rechargement Portefeuille',
      student: 'LAWSON Ablavi',
      amount: '25.000 FCFA',
      date: '23 Mai 2024'
    },
    {
      id: '#TRX-9480',
      type: 'SORTANT',
      typeClass: 'bg-red-100 text-red-700',
      desc: 'Achat Ticket Restaurant',
      student: 'TCHAKONDO Fousseni',
      amount: '500 FCFA',
      date: '23 Mai 2024'
    },
    {
      id: '#TRX-9479',
      type: 'ADJUSTMENT',
      typeClass: 'bg-amber-100 text-amber-700',
      desc: 'Correction Erreur Double Débit',
      student: 'GADO Amina',
      amount: '5.000 FCFA',
      date: '22 Mai 2024'
    },
    {
      id: '#TRX-9478',
      type: 'SCOLARITE_UNIVERSITY',
      typeClass: 'bg-blue-100 text-blue-900',
      desc: 'Frais Inscription L1',
      student: 'KOFFI Yao',
      amount: '45.000 FCFA',
      date: '22 Mai 2024'
    },
    {
      id: '#TRX-9477',
      type: 'ENTRANT',
      typeClass: 'bg-green-100 text-green-700',
      desc: 'Dépôt Bancaire',
      student: 'ADJO Ama',
      amount: '100.000 FCFA',
      date: '21 Mai 2024'
    },
    {
      id: '#TRX-9476',
      type: 'SORTANT',
      typeClass: 'bg-red-100 text-red-700',
      desc: 'Achat Bus Card',
      student: 'TETTEH Elom',
      amount: '2.500 FCFA',
      date: '21 Mai 2024'
    },
    {
      id: '#TRX-9475',
      type: 'SCOLARITE_UNIVERSITY',
      typeClass: 'bg-blue-100 text-blue-900',
      desc: 'Frais Examen Master',
      student: 'SALAMI Ibrahim',
      amount: '30.000 FCFA',
      date: '20 Mai 2024'
    },
    {
      id: '#TRX-9474',
      type: 'ENTRANT',
      typeClass: 'bg-green-100 text-green-700',
      desc: 'Transfert Mobile Money',
      student: 'AKAKPO Sena',
      amount: '15.000 FCFA',
      date: '20 Mai 2024'
    },
    {
      id: '#TRX-9473',
      type: 'ADJUSTMENT',
      typeClass: 'bg-amber-100 text-amber-700',
      desc: 'Réajustement Annuel',
      student: 'DIALLO Bakary',
      amount: '1.250 FCFA',
      date: '19 Mai 2024'
    },
    {
      id: '#TRX-9472',
      type: 'SORTANT',
      typeClass: 'bg-red-100 text-red-700',
      desc: 'Photocopies Bibliothèque',
      student: 'LAKOUE Marc',
      amount: '1.000 FCFA',
      date: '19 Mai 2024'
    },
    {
      id: '#TRX-9471',
      type: 'SCOLARITE_UNIVERSITY',
      typeClass: 'bg-blue-100 text-blue-900',
      desc: 'Inscription Doctorat',
      student: 'GNASSINGBE Eyadema',
      amount: '150.000 FCFA',
      date: '18 Mai 2024'
    }
  ]);
}
