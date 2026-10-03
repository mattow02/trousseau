import { MAX_OUVERTS, ONGLETS_VIDES, ouvrir, revenirAccueil, synchroniser } from '../onglets';

describe('onglets', () => {
  it('ouvrir rend le site actif et le place en tête', () => {
    const e = ouvrir(ouvrir(ONGLETS_VIDES, 'a'), 'b');
    expect(e).toEqual({ ouverts: ['b', 'a'], actif: 'b' });
  });

  it('rouvrir un site déjà ouvert ne le duplique pas', () => {
    const e = ouvrir(ouvrir(ouvrir(ONGLETS_VIDES, 'a'), 'b'), 'a');
    expect(e.ouverts).toEqual(['a', 'b']);
  });

  it(`garde au plus ${MAX_OUVERTS} sites, en fermant le moins récent`, () => {
    let e = ONGLETS_VIDES;
    for (const id of ['a', 'b', 'c', 'd', 'e']) e = ouvrir(e, id);
    expect(e.ouverts).toHaveLength(MAX_OUVERTS);
    expect(e.ouverts).not.toContain('a');
  });

  it("revenir à l'accueil garde les sites ouverts", () => {
    const e = revenirAccueil(ouvrir(ONGLETS_VIDES, 'a'));
    expect(e).toEqual({ ouverts: ['a'], actif: null });
  });

  it('synchroniser retire les sites disparus, actif compris', () => {
    const e = ouvrir(ouvrir(ONGLETS_VIDES, 'a'), 'b');
    expect(synchroniser(e, new Set(['a']))).toEqual({ ouverts: ['a'], actif: null });
  });

  it('synchroniser rend le même objet quand rien ne change', () => {
    const e = ouvrir(ONGLETS_VIDES, 'a');
    expect(synchroniser(e, new Set(['a', 'b']))).toBe(e);
  });
});
