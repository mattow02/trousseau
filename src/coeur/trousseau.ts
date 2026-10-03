/**
 * Les opérations sur la liste des sites. Fonctions pures : elles rendent une
 * nouvelle liste et ne touchent ni au stockage ni à l'interface.
 * L'ordre de la liste est l'ordre de l'accueil ; le premier site a la grande plaque.
 */
import { domaine, normaliserAdresse } from './adresse';
import type { Mode, Site } from './site';

export interface Saisie {
  nom: string;
  adresse: string;
  mode: Mode;
}

export type Resultat = { ok: true; sites: Site[] } | { ok: false; erreur: string };

function valider(saisie: Saisie): { ok: true; nom: string; url: string } | { ok: false; erreur: string } {
  const adresse = normaliserAdresse(saisie.adresse);
  if (!adresse.ok) return adresse;
  // Un nom vide prend le domaine : on n'oblige pas à taper deux fois la même chose.
  const nom = saisie.nom.trim() || domaine(adresse.url);
  return { ok: true, nom, url: adresse.url };
}

export function ajouterSite(sites: readonly Site[], saisie: Saisie, id: string): Resultat {
  const v = valider(saisie);
  if (!v.ok) return v;
  if (sites.some((s) => s.id === id)) return { ok: false, erreur: 'Identifiant déjà pris.' };
  return { ok: true, sites: [...sites, { id, nom: v.nom, url: v.url, mode: saisie.mode }] };
}

export function modifierSite(sites: readonly Site[], id: string, saisie: Saisie): Resultat {
  if (!sites.some((s) => s.id === id)) return { ok: false, erreur: "Ce site n'existe plus." };
  const v = valider(saisie);
  if (!v.ok) return v;
  return {
    ok: true,
    sites: sites.map((s) => (s.id === id ? { ...s, nom: v.nom, url: v.url, mode: saisie.mode } : s)),
  };
}

export function supprimerSite(sites: readonly Site[], id: string): Site[] {
  return sites.filter((s) => s.id !== id);
}

/** Déplace un site de `decalage` rangs (négatif : vers le début), borné aux extrémités. */
export function deplacerSite(sites: readonly Site[], id: string, decalage: number): Site[] {
  const depart = sites.findIndex((s) => s.id === id);
  if (depart === -1) return [...sites];
  const arrivee = Math.max(0, Math.min(sites.length - 1, depart + decalage));
  const copie = [...sites];
  const [site] = copie.splice(depart, 1);
  copie.splice(arrivee, 0, site);
  return copie;
}
