import { domaine, initiales, normaliserAdresse } from '../adresse';

// Sous React Native, `URL` est une imitation qui ne valide rien : le module ne
// doit pas s'en servir. On la retire pour que tout appel fasse échouer les tests.
const URLOrigine = globalThis.URL;
beforeAll(() => {
  // @ts-expect-error retrait volontaire
  delete globalThis.URL;
});
afterAll(() => {
  globalThis.URL = URLOrigine;
});

describe('normaliserAdresse', () => {
  it.each([
    ['cobaalt.app', 'https://cobaalt.app/'],
    ['  github.com/mattow02  ', 'https://github.com/mattow02'],
    ['http://exemple.fr', 'http://exemple.fr/'],
    ['HTTPS://Exemple.FR/Chemin', 'https://exemple.fr/Chemin'],
    ['localhost:3000', 'https://localhost:3000/'],
    ['exemple.fr:8080/x', 'https://exemple.fr:8080/x'],
    ['exemple.fr?q=1#ancre', 'https://exemple.fr/?q=1#ancre'],
    ['café.fr', 'https://café.fr/'],
  ])('« %s » devient %s', (saisie, attendu) => {
    expect(normaliserAdresse(saisie)).toEqual({ ok: true, url: attendu });
  });

  it.each([
    ['', 'vide'],
    ['   ', 'vide'],
    ['mon site.fr', 'espace'],
    ['javascript:alert(1)', 'http'],
    ['file:///etc/passwd', 'http'],
    ['ftp://exemple.fr', 'http'],
    ['exemple', 'domaine'],
    ['mailto:moi@exemple.fr', 'http'],
    ['https://', 'valide'],
    ['moi@exemple.fr', 'valide'],
    ['exemple..fr', 'valide'],
  ])('refuse « %s » (%s)', (saisie, motif) => {
    const r = normaliserAdresse(saisie);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erreur.toLowerCase()).toContain(motif);
  });
});

describe('domaine', () => {
  it('retire le www et le chemin', () => {
    expect(domaine('https://www.github.com/x?y=1')).toBe('github.com');
  });
  it("rend l'entrée telle quelle si elle n'est pas une URL", () => {
    expect(domaine('pas une url')).toBe('pas une url');
  });
});

describe('initiales', () => {
  it.each([
    ['Cobaalt', 'Co'],
    ['GitHub', 'Gh'],
    ['Polymarket', 'Po'],
    ['gmail', 'Gm'],
    ['Mon Site', 'MS'],
    ['  élan  vital ', 'ÉV'],
    ['X', 'X'],
    ['', '?'],
  ])('%s → %s', (nom, attendu) => {
    expect(initiales(nom)).toBe(attendu);
  });
});
