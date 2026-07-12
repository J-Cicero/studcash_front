import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService } from '@core/services/student.service';
import { CardService } from '@core/services/card.service';
import { UserService } from '@core/services/user.service';
import { UserResponse } from '@core/models/user.model';
import { CardStatus, CardRequest, CardResponse } from '@core/models/card.model';

@Component({
  selector: 'app-create-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-card.component.html',
  styleUrls: ['./create-card.component.scss']
})
export class CreateCardComponent implements OnInit {
  searchStudentForm: FormGroup;
  createCardForm: FormGroup;
  foundStudent: UserResponse | null = null;
  foundStudentWalletTrackingId: string | null = null;
  studentCards: any[] = []; // To display existing cards

  isLoadingStudent = false;
  isLoadingCards = false;
  isLoadingCreateCard = false;
  errorMessage = '';
  successMessage = '';

  cardStatuses = Object.values(CardStatus);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService, // Using UserService to find student UserResponse
    private studentService: StudentService, // For student-specific actions if needed, like getting wallet
    private cardService: CardService
  ) {
    this.searchStudentForm = this.fb.group({
      studentIdentifier: ['', Validators.required] // Can be email or trackingId
    });

    this.createCardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]], // 16 digits
      qrCodeData: [''], // Will be generated or left blank for backend to handle
      status: [CardStatus.ACTIVE, Validators.required],
      // walletTrackingId will be taken from foundStudent
    });
  }

  ngOnInit(): void {}

  searchStudent(): void {
    if (this.searchStudentForm.invalid) {
      this.searchStudentForm.markAllAsTouched();
      return;
    }

    this.isLoadingStudent = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.foundStudent = null;
    this.foundStudentWalletTrackingId = null;
    this.studentCards = [];

    const identifier = this.searchStudentForm.get('studentIdentifier')?.value;

    this.userService.searchUsers(identifier).subscribe({ // Assuming searchUsers can find by email/trackingId
      next: (users: UserResponse[]) => {
        const student = users.find(u => u.role === 'ETUDIANT' && (u.email === identifier || u.trackingId === identifier));
        if (student) {
          this.studentService.findByTrackingId(student.trackingId).subscribe({
            next: (studentDetail: any) => {
              this.foundStudent = student;
              this.foundStudentWalletTrackingId = studentDetail.walletTrackingId;
              this.loadStudentCards(student.trackingId);
              this.createCardForm.reset(); // Reset card form for new student
              this.createCardForm.get('status')?.setValue(CardStatus.ACTIVE);
              this.successMessage = `Étudiant "${student.firstName} ${student.lastName}" trouvé.`;
              this.isLoadingStudent = false;
            },
            error: (err: any) => {
              this.errorMessage = "Erreur lors du chargement des détails du portefeuille étudiant: " + (err.error?.message || err.message);
              this.isLoadingStudent = false;
            }
          });
        } else {
          this.errorMessage = 'Aucun étudiant trouvé avec cet identifiant.';
          this.isLoadingStudent = false;
        }
      },
      error: (err: any) => {
        this.errorMessage = "Erreur lors de la recherche de l'étudiant: " + (err.error?.message || err.message);
        this.isLoadingStudent = false;
      }
    });
  }

  loadStudentCards(studentTrackingId: string): void {
    this.isLoadingCards = true;
    this.cardService.getCardsByStudent(studentTrackingId).subscribe({
      next: (cards: CardResponse[]) => { // Explicit type
        this.studentCards = cards;
        this.isLoadingCards = false;
      },
      error: (err: any) => { // Explicit type
        this.errorMessage = 'Erreur lors du chargement des cartes: ' + (err.error?.message || err.message);
        this.isLoadingCards = false;
      }
    });
  }

  createCard(): void {
    if (this.createCardForm.invalid || !this.foundStudent || !this.foundStudentWalletTrackingId) {
      this.createCardForm.markAllAsTouched();
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire, sélectionner un étudiant et récupérer son portefeuille.';
      return;
    }

    this.isLoadingCreateCard = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: CardRequest = { // Explicit type
      cardNumber: this.createCardForm.get('cardNumber')?.value,
      qrCodeData: this.createCardForm.get('qrCodeData')?.value,
      status: this.createCardForm.get('status')?.value,
      walletTrackingId: this.foundStudentWalletTrackingId, 
    };

    this.cardService.createCard(this.foundStudent!.trackingId, request).subscribe({ // Non-null assertion
      next: (card: CardResponse) => { // Explicit type
        this.successMessage = `Carte "${card.cardNumber}" créée avec succès.`;
        this.loadStudentCards(this.foundStudent!.trackingId); // Refresh cards list, non-null assertion
        this.createCardForm.reset();
        this.createCardForm.get('status')?.setValue(CardStatus.ACTIVE);
        this.isLoadingCreateCard = false;
      },
      error: (err: any) => { // Explicit type
        this.errorMessage = 'Erreur lors de la création de la carte: ' + (err.error?.message || err.message);
        this.isLoadingCreateCard = false;
      }
    });
  }
}
