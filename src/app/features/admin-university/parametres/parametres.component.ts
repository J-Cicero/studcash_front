import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UniversityPortalService } from '../../../core/services/university-portal.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.scss'
})
export class ParametresComponent implements OnInit {
  universite: any = null;
  activeYear: any = null;
  allYears: any[] = [];
  paiements: any[] = [];

  selectedYear: string = '';
  isLoading = true;

  constructor(private universityPortalService: UniversityPortalService) {}

  ngOnInit(): void {
    this.universityPortalService.getMyProfile().pipe(
      switchMap(profile => {
        return forkJoin({
          universite: this.universityPortalService.getUniversite(profile.universiteTrackingId),
          activeYear: this.universityPortalService.getActiveScolariteYear(),
          allYears: this.universityPortalService.getScolariteYears(0, 50),
          paiements: this.universityPortalService.getPaiementsScolarite(profile.universiteTrackingId, 0, 1000)
        });
      })
    ).subscribe({
      next: (data) => {
        this.universite = data.universite;
        this.activeYear = data.activeYear;
        this.allYears = data.allYears.content || [];
        this.paiements = data.paiements.content || [];
        this.selectedYear = data.activeYear?.libelle || (this.allYears[0]?.libelle || '');
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getYearPaiements(annee: string): any[] {
    // Filter paiements by scolariteYear libelle approximation via date range
    const year = this.allYears.find(y => y.libelle === annee);
    if (!year) return [];

    const debut = new Date(year.dateDebut);
    const fin = new Date(year.dateFin);

    return this.paiements.filter(p => {
      const d = new Date(p.date);
      return d >= debut && d <= fin && p.statutPaiement === 'VALIDE';
    });
  }

  getYearTotal(annee: string): number {
    return this.getYearPaiements(annee).reduce((s, p) => s + (p.montantNetBoutique || 0), 0);
  }

  getYearCount(annee: string): number {
    return this.getYearPaiements(annee).length;
  }

  downloadFactureGenerale(annee: string): void {
    const paiements = this.getYearPaiements(annee);
    const total = this.getYearTotal(annee);
    
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header bar
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('StudCash', 14, 20);

    // Placeholder image base64 (User will replace this later)
    const studCashLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3jP4PgfAAWgA3Qn+3SBAAAAAElFTkSuQmCC';
    doc.addImage(studCashLogoBase64, 'PNG', 50, 12, 10, 10);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Facture Générale — Historique', 210 - 14, 18, { align: 'right' });
    doc.text(`Année Scolaire : ${annee}`, 210 - 14, 24, { align: 'right' });

    // University & Meta
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    
    const univLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3h/f/9/AAWgA3TuE1S2AAAAAElFTkSuQmCC';
    doc.addImage(univLogoBase64, 'PNG', 14, 40, 16, 16);

    doc.text(this.universite?.nom || 'Université', 34, 48);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`, 14, 65);
    doc.text(`Nombre de paiements validés : ${paiements.length}`, 14, 71);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 76, 196, 76);

    // Table
    autoTable(doc, {
      startY: 85,
      head: [['Date de transaction', 'Montant Payé (FCFA)', 'Montant Net Univ. (FCFA)']],
      body: paiements.map(p => [
        new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        `${(p.montantDebite || 0).toLocaleString('fr-FR')}`,
        `${(p.montantNetBoutique || 0).toLocaleString('fr-FR')}`
      ]),
      foot: [['TOTAL', '', `${total.toLocaleString('fr-FR')} FCFA`]],
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 11 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right', fontStyle: 'bold' }
      }
    });

    // Signature Area
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Signature StudCash', 150, finalY);
    doc.setDrawColor(100, 116, 139);
    doc.line(140, finalY + 15, 196, finalY + 15);

    // Footer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Ce document est généré automatiquement par la plateforme StudCash pour ${this.universite?.nom}.`,
      105, 285, { align: 'center' }
    );

    doc.save(`facture-generale-${annee.replace(/\s+/g, '-')}.pdf`);
  }
}
