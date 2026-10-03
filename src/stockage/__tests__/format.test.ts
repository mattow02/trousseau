import type { Site } from '../../coeur/site';
import { deserialiser, serialiser } from '../format';

const a: Site = { id: 'a', nom: 'A', url: 'https://a.fr/', mode: 'webview' };
const b: Site = { id: 'b', nom: 'B', url: 'https://b.fr/', mode: 'safari' };

describe('format de sauvegarde', () => {
  it('un aller-retour rend la même liste, dans le même ordre', () => {
    expect(deserialiser(serialiser([b, a]))).toEqual({ etat: 'lu', sites: [b, a] });
  });

  it('rien en stockage : vide', () => {
    expect(deserialiser(null)).toEqual({ etat: 'vide' });
  });

  it.each([
    ['du texte qui n’est pas du JSON', '{pas du json'],
    ['un JSON sans version', JSON.stringify({ sites: [] })],
    ['une version inconnue', JSON.stringify({ version: 99, sites: [] })],
    ['un tableau nu', JSON.stringify([a])],
    ['null', 'null'],
  ])('%s : illisible, et non vide', (_cas, texte) => {
    expect(deserialiser(texte)).toEqual({ etat: 'illisible' });
  });

  it('écarte les entrées invalides et les doublons, garde le reste', () => {
    const texte = JSON.stringify({
      version: 1,
      sites: [a, { id: 'x', nom: 'X', url: 'https://x.fr/', mode: 'inconnu' }, { id: 'y' }, { ...a, nom: 'doublon' }, b],
    });
    expect(deserialiser(texte)).toEqual({ etat: 'lu', sites: [a, b] });
  });
});
