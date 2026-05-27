export interface StudentLiquidationInfo {
  studentTrackingId: string;
  nom: string;
  prenom: string;
  numEtudiant: string;
  bourseTotale: number;
  depensesStudCash: number;
  resteAPayer: number;
  virementEffectue: boolean;
  date?: string;
}
