import type { Site } from '../site';
import { ajouterSite, deplacerSite, modifierSite, supprimerSite } from '../trousseau';

const a: Site = { id: 'a', nom: 'A', url: 'https://a.fr/', mode: 'webview' };
const b: Site = { id: 'b', nom: 'B', url: 'https://b.fr/', mode: 'webview' };
const c: Site = { id: 'c', nom: 'C', url: 'https://c.fr/', mode: 'safari' };

describe('ajouterSite', () => {
  it('ajoute en fin de liste avec une adresse normalisée', () => {
    const r = ajouterSite([a], { nom: ' Cobaalt ', adresse: 'cobaalt.app', mode: 'webview' }, 'x');
    expect(r).toEqual({
      ok: true,
      sites: [a, { id: 'x', nom: 'Cobaalt', url: 'https://cobaalt.app/', mode: 'webview' }],
    });
  });

  it('prend le domaine comme nom quand le nom est vide', () => {
    const r = ajouterSite([], { nom: '  ', adresse: 'www.github.com', mode: 'safari' }, 'x');
    expect(r.ok && r.sites[0].nom).toBe('github.com');
  });

  it('refuse une adresse invalide sans toucher à la liste', () => {
    const liste = [a];
    const r = ajouterSite(liste, { nom: 'X', adresse: 'javascript:1', mode: 'webview' }, 'x');
    expect(r.ok).toBe(false);
    expect(liste).toEqual([a]);
  });

  it('refuse un identifiant déjà pris', () => {
    expect(ajouterSite([a], { nom: 'X', adresse: 'x.fr', mode: 'webview' }, 'a').ok).toBe(false);
  });
});

describe('modifierSite', () => {
  it('change nom, adresse et mode en gardant la place', () => {
    const r = modifierSite([a, b, c], 'b', { nom: 'Bis', adresse: 'bis.fr', mode: 'safari' });
    expect(r.ok && r.sites.map((s) => s.id)).toEqual(['a', 'b', 'c']);
    expect(r.ok && r.sites[1]).toEqual({ id: 'b', nom: 'Bis', url: 'https://bis.fr/', mode: 'safari' });
  });

  it('refuse un site inconnu', () => {
    expect(modifierSite([a], 'z', { nom: 'Z', adresse: 'z.fr', mode: 'webview' }).ok).toBe(false);
  });
});

describe('supprimerSite', () => {
  it('retire le site, et ne fait rien pour un inconnu', () => {
    expect(supprimerSite([a, b], 'a')).toEqual([b]);
    expect(supprimerSite([a, b], 'z')).toEqual([a, b]);
  });
});

describe('deplacerSite', () => {
  const ids = (l: Site[]) => l.map((s) => s.id).join('');

  it('avance et recule d’un rang', () => {
    expect(ids(deplacerSite([a, b, c], 'b', -1))).toBe('bac');
    expect(ids(deplacerSite([a, b, c], 'b', 1))).toBe('acb');
  });

  it('reste borné aux extrémités', () => {
    expect(ids(deplacerSite([a, b, c], 'a', -1))).toBe('abc');
    expect(ids(deplacerSite([a, b, c], 'c', 5))).toBe('abc');
  });

  it('ne modifie pas la liste d’origine', () => {
    const liste = [a, b, c];
    deplacerSite(liste, 'a', 2);
    expect(ids(liste)).toBe('abc');
  });
});
