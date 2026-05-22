import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Student {
  id: string;
  initials: string;
  name: string;
  dept: string;
  level: string;
  mode: string;
  modeClass: string;
  paymentStatus: string;
  paymentIcon: string;
  paymentClass: string;
  scholarship: string;
  scholarshipClass: string;
  verified: boolean;
}

@Component({
  selector: 'app-univ-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './univ-students.component.html',
  styleUrls: ['./univ-students.component.scss']
})
export class UnivStudentsComponent {
  students = signal<Student[]>([
    {
      id: 'UL-2301452',
      initials: 'AK',
      name: 'ADJOA Kouigan',
      dept: 'FSEG',
      level: 'Licence 3',
      mode: 'StudCash',
      modeClass: 'bg-blue-100 text-blue-900',
      paymentStatus: 'Soldé',
      paymentIcon: 'pi pi-check-circle text-green-600',
      paymentClass: 'text-green-600',
      scholarship: 'Non-Boursier',
      scholarshipClass: 'bg-gray-200 text-gray-700',
      verified: true
    },
    {
      id: 'UL-2309821',
      initials: 'EM',
      name: 'EGBÉ Mensah',
      dept: 'FDS',
      level: 'Licence 1',
      mode: 'Virement',
      modeClass: 'border border-gray-500 text-gray-600',
      paymentStatus: 'Partiel',
      paymentIcon: 'pi pi-clock text-gray-500',
      paymentClass: 'text-gray-600',
      scholarship: 'Boursier État',
      scholarshipClass: 'bg-green-100 text-green-800',
      verified: true
    },
    {
      id: 'UL-2304192',
      initials: 'LT',
      name: 'LAWSON Thérèse',
      dept: 'FLLA',
      level: 'Master 2',
      mode: 'StudCash',
      modeClass: 'bg-blue-100 text-blue-900',
      paymentStatus: 'Soldé',
      paymentIcon: 'pi pi-check-circle text-green-600',
      paymentClass: 'text-green-600',
      scholarship: 'Non-Boursier',
      scholarshipClass: 'bg-gray-200 text-gray-700',
      verified: false
    }
  ]);
}
