import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StudentRegistration {
  id: string;
  name: string;
  department: string;
  level: string;
  amount: string;
  mode: string;
  status: string;
}

@Component({
  selector: 'app-univ-registrations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './univ-registrations.component.html',
  styleUrls: ['./univ-registrations.component.scss']
})
export class UnivRegistrationsComponent {
  students = signal<StudentRegistration[]>([
    { id: 'UL-2024-0012', name: 'ADJO Kodjo Koffi', department: 'FASEG - Gestion', level: 'Licence 3', amount: '52.000 CFA', mode: 'STUDCASH', status: 'Validé' },
    { id: 'UL-2024-0045', name: 'AMEDOU Abra Sophie', department: 'FDD - Droit', level: 'Master 1', amount: '75.000 CFA', mode: 'STUDCASH', status: 'Validé' },
    { id: 'UL-2024-0089', name: 'LAWSON Messan', department: 'FDS - Informatique', level: 'Licence 2', amount: '52.000 CFA', mode: 'STUDCASH', status: 'Validé' },
    { id: 'UL-2024-0102', name: 'TOGO Akouavi', department: 'FASEG - Eco', level: 'Licence 1', amount: '45.000 CFA', mode: 'STUDCASH', status: 'Validé' },
    { id: 'UL-2024-0211', name: 'KPONTON Jean', department: 'FDD - Public', level: 'Doctorat', amount: '150.000 CFA', mode: 'STUDCASH', status: 'Validé' },
    { id: 'UL-2024-0245', name: 'BAKAI Mariam', department: 'FDS - Maths', level: 'Licence 3', amount: '52.000 CFA', mode: 'STUDCASH', status: 'Validé' },
    { id: 'UL-2024-0312', name: 'SEDJRO Victor', department: 'FLESH - Lettres', level: 'Licence 1', amount: '45.000 CFA', mode: 'STUDCASH', status: 'Validé' },
    { id: 'UL-2024-0388', name: 'N\'DJARE Amina', department: 'ESSAL - Santé', level: 'Master 2', amount: '120.000 CFA', mode: 'STUDCASH', status: 'Validé' },
    { id: 'UL-2024-0412', name: 'GBADO Mawuena', department: 'FDS - Physique', level: 'Licence 2', amount: '52.000 CFA', mode: 'STUDCASH', status: 'Validé' },
    { id: 'UL-2024-0501', name: 'SALAMI Ibrahim', department: 'FASEG - Finance', level: 'Licence 3', amount: '52.000 CFA', mode: 'STUDCASH', status: 'Validé' }
  ]);
}
