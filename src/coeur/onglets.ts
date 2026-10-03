/**
 * Les sites ouverts en mémoire, et celui qu'on regarde.
 *
 * Chaque site ouvert garde sa WebView montée : passer d'une pastille à l'autre
 * ne recharge rien. Mais une WebView coûte de la mémoire, et iOS tue les
 * processus WebKit quand elle manque. On en garde donc au plus
 * `MAX_OUVERTS`, et on ferme le moins récemment consulté.
 *
 * Les sites en mode `safari` n'entrent jamais ici : ils s'ouvrent dans le
 * Safari intégré, qui vit en dehors de nos écrans.
 */

export const MAX_OUVERTS = 4;

export interface Onglets {
  /** Identifiants des sites ouverts, du plus récent au plus ancien. */
  ouverts: string[];
  /** Le site affiché, ou null quand on est sur l'accueil. */
  actif: string | null;
}

export const ONGLETS_VIDES: Onglets = { ouverts: [], actif: null };

export function ouvrir(etat: Onglets, id: string): Onglets {
  const ouverts = [id, ...etat.ouverts.filter((o) => o !== id)].slice(0, MAX_OUVERTS);
  return { ouverts, actif: id };
}

/** Retour à l'accueil : les sites restent ouverts derrière. */
export function revenirAccueil(etat: Onglets): Onglets {
  return { ...etat, actif: null };
}

/** Retire les sites supprimés du trousseau ou passés en mode Safari. */
export function synchroniser(etat: Onglets, idsValides: ReadonlySet<string>): Onglets {
  const ouverts = etat.ouverts.filter((o) => idsValides.has(o));
  const actif = etat.actif !== null && idsValides.has(etat.actif) ? etat.actif : null;
  if (ouverts.length === etat.ouverts.length && actif === etat.actif) return etat;
  return { ouverts, actif };
}
