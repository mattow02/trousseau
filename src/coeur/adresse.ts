/**
 * Ce que l'on fait d'une adresse tapée à la main sur un téléphone :
 * la rendre chargeable, en extraire le domaine, et des initiales pour la plaque.
 *
 * Pourquoi un analyseur maison plutôt que `new URL()` : sous React Native,
 * `URL` est une imitation à base de regex (Libraries/Blob/URL.js) qui ne lève
 * jamais d'erreur, ne met pas l'hôte en minuscules et dont `hostname` ne
 * reconnaît que « http » en minuscules. Les tests, qui tournent sous Node,
 * passeraient avec la vraie `URL` tandis que l'iPhone se comporterait
 * autrement. Ce module n'utilise donc pas `URL` du tout (un test le garantit).
 */

export type ResultatAdresse = { ok: true; url: string } | { ok: false; erreur: string };

interface Decoupage {
  schema: string;
  hote: string;
  port: string;
  reste: string;
}

const AVEC_SCHEMA = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)(.*)$/i;
const SCHEMA_SEUL = /^([a-z][a-z0-9+.-]*):/i;
const HOTE_PORT = /^([^:]+)(?::(\d{1,5}))?$/;
const HOTE = /^[a-z0-9¡-￿-]+(\.[a-z0-9¡-￿-]+)*$/;

function decouper(url: string): Decoupage | null {
  const m = AVEC_SCHEMA.exec(url);
  if (!m) return null;
  const autorite = HOTE_PORT.exec(m[2]);
  if (!autorite) return null;
  return {
    schema: m[1].toLowerCase(),
    hote: autorite[1].toLowerCase(),
    port: autorite[2] ?? '',
    reste: m[3],
  };
}

/**
 * « cobaalt.app » devient « https://cobaalt.app/ ».
 * Seuls http et https sont acceptés : la WebView n'a rien à faire d'un
 * `javascript:` ou d'un `file:` collé par erreur.
 */
export function normaliserAdresse(saisie: string): ResultatAdresse {
  const brute = saisie.trim();
  if (brute === '') return { ok: false, erreur: "L'adresse est vide." };
  if (/\s/.test(brute)) return { ok: false, erreur: "Une adresse ne contient pas d'espace." };

  // « localhost:3000 » ou « site.fr:8080 » ressemblent à un schéma : on les écarte.
  const ressembleHotePort = /^[^/:]+:\d+([/?#]|$)/.test(brute);
  const schema = ressembleHotePort ? null : SCHEMA_SEUL.exec(brute);
  if (schema && !['http', 'https'].includes(schema[1].toLowerCase())) {
    return { ok: false, erreur: 'Seules les adresses web (http ou https) sont acceptées.' };
  }
  const candidate = schema ? brute : `https://${brute}`;

  const d = decouper(candidate);
  if (!d) return { ok: false, erreur: "Cette adresse n'est pas valide." };
  if (!HOTE.test(d.hote)) return { ok: false, erreur: "Cette adresse n'est pas valide." };
  if (d.hote !== 'localhost' && !d.hote.includes('.')) {
    return { ok: false, erreur: 'Il manque le domaine, par exemple « .com ».' };
  }

  const port = d.port ? `:${d.port}` : '';
  const reste = d.reste.startsWith('/') ? d.reste : `/${d.reste}`;
  return { ok: true, url: `${d.schema}://${d.hote}${port}${reste}` };
}

/** « https://www.github.com/x » devient « github.com ». */
export function domaine(url: string): string {
  const d = decouper(url);
  return d ? d.hote.replace(/^www\./, '') : url;
}

/**
 * Deux caractères pour la plaque :
 * - deux mots : leurs initiales (« Mon Site » → « MS ») ;
 * - une majuscule interne : on la garde (« GitHub » → « Gh ») ;
 * - sinon les deux premières lettres (« Cobaalt » → « Co »).
 */
export function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/).filter(Boolean);
  if (mots.length === 0) return '?';

  const premier = Array.from(mots[0]);
  const tete = premier[0].toLocaleUpperCase('fr');

  if (mots.length >= 2) return tete + Array.from(mots[1])[0].toLocaleUpperCase('fr');

  const majusculeInterne = premier.slice(1).find((c) => c !== c.toLocaleLowerCase('fr'));
  if (majusculeInterne) return tete + majusculeInterne.toLocaleLowerCase('fr');

  return tete + (premier[1] ?? '').toLocaleLowerCase('fr');
}
