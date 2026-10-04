/**
 * Direction D, validée le 3 octobre 2026 : les courbes du « Trousseau »
 * (plaques très arrondies, pastilles, anneau de clé) avec les couleurs de la
 * « Grille » (blanc, noir franc, un seul bleu outremer réservé à l'essentiel).
 */
export const couleurs = {
  fond: '#FFFFFF',
  encre: '#111111',
  accent: '#1F3BFF',
  surAccent: '#FFFFFF',
  texteDoux: '#4A4A4A',
  texteSurEncre: '#BDBDBD',
  page: '#F5F5F5',
  erreur: '#B3261E',
} as const;

/** Clés sous lesquelles App.tsx charge les graisses de Bricolage Grotesque. */
export const polices = {
  normale: 'Bricolage-400',
  moyenne: 'Bricolage-600',
  grasse: 'Bricolage-800',
} as const;

export const rayons = {
  grandePlaque: 32,
  plaque: 28,
  pilule: 999,
} as const;

/** Cible tactile minimale recommandée par Apple. */
export const CIBLE = 44;
