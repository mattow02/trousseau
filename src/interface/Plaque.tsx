import { Pressable, StyleSheet, Text, View } from 'react-native';

import { domaine, initiales } from '../coeur/adresse';
import type { Site } from '../coeur/site';
import { Precedent, Suivant } from './Icones';
import { CIBLE, couleurs, polices, rayons } from './theme';

interface Props {
  site: Site;
  /** Le premier site du trousseau : grande plaque bleue sur toute la largeur. */
  grande: boolean;
  /** Sa page est gardée en mémoire : l'anneau de la clé est plein. */
  ouvert: boolean;
  modeEdition: boolean;
  peutReculer: boolean;
  peutAvancer: boolean;
  largeur: number;
  onPress: () => void;
  onLongPress: () => void;
  onDeplacer: (decalage: number) => void;
}

/**
 * Trois teintes, chacune porteuse de sens :
 * bleu = le site principal, noir = s'ouvre dans le Safari intégré, blanc = les autres.
 */
function teintes(site: Site, grande: boolean) {
  if (grande) return { fond: couleurs.accent, texte: couleurs.surAccent, bord: couleurs.accent };
  if (site.mode === 'safari') return { fond: couleurs.encre, texte: couleurs.fond, bord: couleurs.encre };
  return { fond: couleurs.fond, texte: couleurs.encre, bord: couleurs.encre };
}

export function Plaque(p: Props) {
  const { site, grande } = p;
  const t = teintes(site, grande);
  const sousTitre = site.mode === 'safari' ? 'Safari intégré' : domaine(site.url);

  return (
    <Pressable
      onPress={p.onPress}
      onLongPress={p.onLongPress}
      accessibilityRole="button"
      accessibilityLabel={`${site.nom}, ${sousTitre}`}
      accessibilityHint={p.modeEdition ? 'Modifier ce site' : 'Ouvrir ce site'}
      style={({ pressed }) => [
        styles.plaque,
        {
          width: p.largeur,
          minHeight: grande ? 180 : 140,
          borderRadius: grande ? rayons.grandePlaque : rayons.plaque,
          backgroundColor: t.fond,
          borderColor: t.bord,
          padding: grande ? 20 : 14,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <View style={styles.haut}>
        <Text
          style={[styles.initiales, { color: t.texte, fontSize: grande ? 72 : 46, letterSpacing: grande ? -4 : -2.5 }]}
        >
          {initiales(site.nom)}
        </Text>
        <View
          style={[
            styles.anneau,
            { borderColor: t.texte, backgroundColor: p.ouvert ? t.texte : 'transparent' },
          ]}
        />
      </View>

      <View style={styles.bas}>
        <Text numberOfLines={1} style={[styles.nom, { color: t.texte, fontSize: grande ? 26 : 18 }]}>
          {site.nom}
        </Text>
        <Text numberOfLines={1} style={[styles.sousTitre, { color: t.texte }]}>
          {sousTitre}
        </Text>
      </View>

      {p.modeEdition && (
        <View style={styles.fleches}>
          <Fleche sens="recule" actif={p.peutReculer} couleur={t.texte} onPress={() => p.onDeplacer(-1)} nom={site.nom} />
          <Fleche sens="avance" actif={p.peutAvancer} couleur={t.texte} onPress={() => p.onDeplacer(1)} nom={site.nom} />
        </View>
      )}
    </Pressable>
  );
}

function Fleche(p: { sens: 'recule' | 'avance'; actif: boolean; couleur: string; nom: string; onPress: () => void }) {
  const Icone = p.sens === 'recule' ? Precedent : Suivant;
  return (
    <Pressable
      onPress={p.onPress}
      disabled={!p.actif}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`${p.sens === 'recule' ? 'Reculer' : 'Avancer'} ${p.nom}`}
      style={[styles.fleche, { borderColor: p.couleur, opacity: p.actif ? 1 : 0.3 }]}
    >
      <Icone couleur={p.couleur} taille={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  plaque: {
    borderWidth: 2,
    justifyContent: 'space-between',
  },
  haut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  initiales: { fontFamily: polices.grasse },
  anneau: { width: 16, height: 16, borderRadius: 8, borderWidth: 2.5 },
  bas: { gap: 2, marginTop: 12 },
  nom: { fontFamily: polices.grasse },
  sousTitre: { fontFamily: polices.moyenne, fontSize: 12, opacity: 0.8 },
  fleches: { flexDirection: 'row', gap: 8, marginTop: 10 },
  fleche: {
    width: CIBLE,
    height: 36,
    borderRadius: rayons.pilule,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
