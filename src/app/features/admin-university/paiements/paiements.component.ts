import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap, forkJoin } from 'rxjs';
import { UniversityPortalService } from '../../../core/services/university-portal.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EnrichedPaiement {
  trackingId: string;
  montantDebite: number;
  montantNetBoutique: number;
  commission: number;
  date: string;
  statutPaiement: string;
  senderName: string;
  studentTrackingId?: string;
  studentNom?: string;
  studentPrenom?: string;
  studentMatricule?: string;
  banqueNom?: string;
  banqueId?: string;
}

@Component({
  selector: 'app-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './paiements.component.html',
  styleUrl: './paiements.component.scss'
})
export class PaiementsComponent implements OnInit {
  profile: any = null;
  universite: any = null;
  paiements: EnrichedPaiement[] = [];
  studentMap: Map<string, any> = new Map();

  isLoading = true;
  errorMessage = '';
  searchQuery = '';

  // For grouped invoice by bank
  groupedByBanque: { [banqueNom: string]: EnrichedPaiement[] } = {};

  constructor(private universityPortalService: UniversityPortalService) {}

  ngOnInit(): void {
    this.universityPortalService.getMyProfile().pipe(
      switchMap(profile => {
        this.profile = profile;
        return forkJoin({
          universite: this.universityPortalService.getUniversite(profile.universiteTrackingId),
          students: this.universityPortalService.getStudents(profile.universiteTrackingId, 0, 500),
          paiements: this.universityPortalService.getPaiementsScolarite(profile.universiteTrackingId, 0, 500)
        });
      })
    ).subscribe({
      next: async (data) => {
        this.universite = data.universite;

        // Build student map: walletTrackingId -> student info
        const students = data.students.content || [];
        for (const s of students) {
          this.studentMap.set(s.walletTrackingId, s);
        }

        // Enrich paiements with student info
        const rawPaiements = data.paiements.content || [];
        const enriched: EnrichedPaiement[] = [];

        for (const p of rawPaiements) {
          // Match student by walletTrackingId
          const student = this.studentMap.get(p.walletTrackingId);
          const row: EnrichedPaiement = {
            ...p,
            studentTrackingId: student?.trackingId,
            studentNom: student?.nom,
            studentPrenom: student?.prenom,
            studentMatricule: student?.numEtudiantUniv,
            banqueNom: 'Inconnue',
            banqueId: undefined
          };

          // Fetch banque info if student has banqueEtudiantTrackingId
          if (student?.banqueEtudiantTrackingId) {
            try {
              const banqueInfo = await this.universityPortalService
                .getBanqueEtudiant(student.banqueEtudiantTrackingId)
                .toPromise();
              row.banqueNom = banqueInfo?.banqueName || 'Inconnue';
              row.banqueId = banqueInfo?.banqueId;
            } catch {}
          }

          enriched.push(row);
        }

        this.paiements = enriched;
        this.buildGroupedByBanque();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les paiements.';
        this.isLoading = false;
      }
    });
  }

  buildGroupedByBanque(): void {
    this.groupedByBanque = {};
    for (const p of this.paiements.filter(p => p.statutPaiement === 'VALIDE')) {
      const key = p.banqueNom || 'Inconnue';
      if (!this.groupedByBanque[key]) this.groupedByBanque[key] = [];
      this.groupedByBanque[key].push(p);
    }
  }

  get filteredPaiements(): EnrichedPaiement[] {
    if (!this.searchQuery) return this.paiements;
    const q = this.searchQuery.toLowerCase();
    return this.paiements.filter(p =>
      (p.studentNom && p.studentNom.toLowerCase().includes(q)) ||
      (p.studentPrenom && p.studentPrenom.toLowerCase().includes(q)) ||
      (p.studentMatricule && p.studentMatricule.toLowerCase().includes(q)) ||
      (p.banqueNom && p.banqueNom.toLowerCase().includes(q))
    );
  }

  get banqueKeys(): string[] {
    return Object.keys(this.groupedByBanque);
  }

  getBanqueTotal(banqueNom: string): number {
    return (this.groupedByBanque[banqueNom] || []).reduce((s, p) => s + (p.montantNetBoutique || 0), 0);
  }

  // ─── PDF: Reçu individuel ───────────────────────────────────────────────────
  downloadRecu(p: EnrichedPaiement): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header bar
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('StudCash', 14, 20);

    // Placeholder image base64 (User will replace this later)
    // A simple 1x1 purple pixel for StudCash
    const studCashLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3jP4PgfAAWgA3Qn+3SBAAAAAElFTkSuQmCC';
    doc.addImage(studCashLogoBase64, 'PNG', 50, 12, 10, 10);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Reçu de Paiement de Scolarité', 210 - 14, 18, { align: 'right' });
    doc.text(`Émis le : ${new Date().toLocaleDateString('fr-FR')}`, 210 - 14, 24, { align: 'right' });

    // University & date
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    
    // Placeholder image base64 for University (User will replace this later)
    // A simple 1x1 gray pixel for Univ
    const univLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3h/f/9/AAWgA3TuE1S2AAAAAElFTkSuQmCC';
    doc.addImage(univLogoBase64, 'PNG', 14, 40, 16, 16);

    doc.text(this.universite?.nom || 'Université', 34, 48);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Date de transaction : ${new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 65);
    doc.text(`Référence : ${p.trackingId}`, 14, 71);

    // Divider
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(14, 76, 196, 76);

    // Student info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations de l\'Étudiant', 14, 86);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nom & Prénom : ${p.studentNom || '-'} ${p.studentPrenom || ''}`, 14, 94);
    doc.text(`Matricule : ${p.studentMatricule || 'N/A'}`, 14, 100);
    doc.text(`Banque partenaire : ${p.banqueNom || 'N/A'}`, 14, 106);

    // Amount Table
    autoTable(doc, {
      startY: 115,
      head: [['Description', 'Montant (FCFA)']],
      body: [
        ['Frais de scolarité encaissés', `${(p.montantDebite || 0).toLocaleString('fr-FR')}`],
        ['Commission plateforme (StudCash)', `${(p.commission || 0).toLocaleString('fr-FR')}`],
        ['Montant net université', `${(p.montantNetBoutique || 0).toLocaleString('fr-FR')}`]
      ],
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { halign: 'right' }
      }
    });

    // Statut
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    if (p.statutPaiement === 'VALIDE') {
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.roundedRect(14, finalY, 70, 10, 2, 2, 'F');
      doc.setTextColor(255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ PAIEMENT VALIDÉ', 49, finalY + 6.5, { align: 'center' });
    } else {
      doc.setFillColor(239, 68, 68); // red-500
      doc.roundedRect(14, finalY, 70, 10, 2, 2, 'F');
      doc.setTextColor(255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('⊗ ' + p.statutPaiement, 49, finalY + 6.5, { align: 'center' });
    }

    // Signature Area
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Signature StudCash', 150, finalY);
    doc.setDrawColor(100, 116, 139);
    doc.line(140, finalY + 15, 196, finalY + 15);

    // Footer
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Ce document a été généré électroniquement par la plateforme StudCash et fait office de preuve de paiement.', 105, 285, { align: 'center' });

    doc.save(`recu-scolarite-${p.studentMatricule || p.trackingId.slice(0, 8)}.pdf`);
  }

  // ─── PDF: Récapitulatif par banque ─────────────────────────────────────────
  downloadFactureBanque(banqueNom: string): void {
    const rows = this.groupedByBanque[banqueNom] || [];
    const total = this.getBanqueTotal(banqueNom);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('StudCash', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Facture de reversement — Banque partenaire', 210 - 14, 18, { align: 'right' });

    // Meta
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(this.universite?.nom || '', 14, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Banque : ${banqueNom}`, 14, 49);
    doc.text(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`, 14, 55);
    doc.text(`Nombre de paiements : ${rows.length}`, 14, 61);

    autoTable(doc, {
      startY: 70,
      head: [['Étudiant', 'Matricule', 'Date', 'Montant Payé', 'Montant Net Univ.']],
      body: rows.map(p => [
        `${p.studentNom || ''} ${p.studentPrenom || ''}`,
        p.studentMatricule || 'N/A',
        new Date(p.date).toLocaleDateString('fr-FR'),
        `${(p.montantDebite || 0).toLocaleString('fr-FR')} FCFA`,
        `${(p.montantNetBoutique || 0).toLocaleString('fr-FR')} FCFA`
      ]),
      foot: [['', '', '', 'TOTAL NET À PERCEVOIR', `${total.toLocaleString('fr-FR')} FCFA`]],
      headStyles: { fillColor: [99, 102, 241], textColor: 255 },
      footStyles: { fillColor: [240, 240, 255], textColor: [60, 60, 60], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 255] },
      styles: { fontSize: 9 }
    });

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(
      `Ce document est une demande de reversement émise par ${this.universite?.nom} via StudCash.`,
      105, 285, { align: 'center' }
    );

    doc.save(`facture-reversement-${banqueNom.replace(/\s+/g, '-')}.pdf`);
  }
}
