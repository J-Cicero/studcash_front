import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface KycDocument {
  name: string;
  status: 'Validé' | 'En attente' | 'Rejeté';
  image: string;
}

interface StudentKyc {
  id: number;
  name: string;
  matricule: string;
  submissionDate: string;
  status: 'En attente' | 'Approuvé' | 'Incomplet';
  documents: KycDocument[];
}

@Component({
  selector: 'app-validation-kyc',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validation-kyc.component.html',
  styleUrl: './validation-kyc.component.scss'
})
export class ValidationKycComponent implements OnInit {
  selectedStudent: StudentKyc | null = null;
  students: StudentKyc[] = [
    {
      id: 1,
      name: 'AMÉGNINOU Koffi',
      matricule: '224-UL-2024',
      submissionDate: '15/05/2026',
      status: 'En attente',
      documents: [
        { name: 'Carte d\'Identité', status: 'Validé', image: '/kyc-id-front.png' },
        { name: 'Attestation de Bourse', status: 'En attente', image: '/kyc-attestation-1.png' }
      ]
    },
    {
      id: 2,
      name: 'LAWSON Ayélé',
      matricule: '512-UL-2023',
      submissionDate: '14/05/2026',
      status: 'En attente',
      documents: [
        { name: 'Carte d\'Identité', status: 'En attente', image: '/kyc-id-back.png' },
        { name: 'Attestation de Bourse', status: 'Validé', image: '/kyc-attestation-2.png' }
      ]
    },
    {
      id: 3,
      name: 'TOGO Messan',
      matricule: '089-UL-2024',
      submissionDate: '14/05/2026',
      status: 'En attente',
      documents: [
        { name: 'Carte d\'Identité', status: 'Rejeté', image: '/kyc-id-front.png' },
        { name: 'Attestation de Bourse', status: 'En attente', image: '/kyc-attestation-1.png' }
      ]
    },
    {
      id: 4,
      name: 'DOH Akouvi',
      matricule: '733-UL-2022',
      submissionDate: '13/05/2026',
      status: 'En attente',
      documents: [
        { name: 'Carte d\'Identité', status: 'En attente', image: '/kyc-id-back.png' },
        { name: 'Attestation de Bourse', status: 'En attente', image: '/kyc-attestation-2.png' }
      ]
    },
    {
      id: 5,
      name: 'KUEVIDJIN Yao',
      matricule: '144-UL-2024',
      submissionDate: '12/05/2026',
      status: 'En attente',
      documents: [
        { name: 'Carte d\'Identité', status: 'Validé', image: '/kyc-id-front.png' },
        { name: 'Attestation de Bourse', status: 'Validé', image: '/kyc-attestation-1.png' }
      ]
    }
  ];

  constructor() {}
  ngOnInit(): void {}

  examineStudent(student: StudentKyc) {
    this.selectedStudent = student;
  }
}
