/**
 * Le format sauvegardé du trousseau, séparé de l'accès au stockage pour être testé.
 * Versionné dès le départ : le jour où `Site` change, on saura migrer.
 */
import { estMode, type Site } from '../coeur/site';

export const VERSION = 1;

interface Sauvegarde {
  version: number;
  sites: Site[];
}

export function serialiser(sites: readonly Site[]): string {
  const sauvegarde: Sauvegarde = { version: VERSION, sites: [...sites] };
  return JSON.stringify(sauvegarde);
}

export type Lecture =
  | { etat: 'vide' }
  | { etat: 'lu'; sites: Site[] }
  | { etat: 'illisible' };

function estSite(x: unknown): x is Site {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    typeof s.nom === 'string' &&
    typeof s.url === 'string' &&
    estMode(s.mode)
  );
}

/**
 * « illisible » n'est pas « vide » : l'appelant doit mettre le texte de côté
 * avant d'écrire par-dessus, sinon une sauvegarde abîmée effacerait le trousseau.
 * Une entrée isolée invalide est écartée, les autres sont gardées.
 */
export function deserialiser(texte: string | null): Lecture {
  if (texte === null) return { etat: 'vide' };
  let brut: unknown;
  try {
    brut = JSON.parse(texte);
  } catch {
    return { etat: 'illisible' };
  }
  if (typeof brut !== 'object' || brut === null) return { etat: 'illisible' };
  const { version, sites } = brut as Record<string, unknown>;
  if (version !== VERSION || !Array.isArray(sites)) return { etat: 'illisible' };

  const vus = new Set<string>();
  const valides = sites.filter((s): s is Site => {
    if (!estSite(s) || vus.has(s.id)) return false;
    vus.add(s.id);
    return true;
  });
  return { etat: 'lu', sites: valides };
}
