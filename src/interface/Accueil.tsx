import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Site } from '../coeur/site';
import { Crayon, Plus } from './Icones';
import { Plaque } from './Plaque';
import { couleurs, polices, rayons } from './theme';

const MARGE = 16;
const ECART = 12;

interface Props {
  sites: Site[];
  ouverts: ReadonlySet<string>;
  modeEdition: boolean;
  onBasculerEdition: () => void;
  onEntrerEdition: () => void;
  onOuvrir: (site: Site) => void;
  onModifier: (site: Site) => void;
  onAjouter: () => void;
  onDeplacer: (id: string, decalage: number) => void;
}

function pluriel(n: number, mot: string) {
  return `${n} ${mot}${n > 1 ? 's' : ''}`;
}

export function Accueil(p: Props) {
  const marges = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pleine = width - MARGE * 2;
  const demi = (pleine - ECART) / 2;

  const sousTitre =
    p.ouverts.size > 0
      ? `${pluriel(p.sites.length, 'clé')}, ${pluriel(p.ouverts.size, 'page')} en mémoire`
      : pluriel(p.sites.length, 'clé');

  return (
    <View style={[styles.ecran, { paddingTop: marges.top + 12 }]}>
      <View style={styles.entete}>
        <View style={styles.titres}>
          <Text style={styles.titre} accessibilityRole="header">
            Trousseau
          </Text>
          <Text style={styles.sousTitre}>{p.modeEdition ? 'Touche une clé pour la modifier' : sousTitre}</Text>
        </View>
        <View style={styles.actions}>
          {p.sites.length > 0 && (
            <Pressable
              onPress={p.onBasculerEdition}
              accessibilityRole="button"
              accessibilityLabel={p.modeEdition ? 'Terminer la modification' : 'Modifier le trousseau'}
              accessibilityState={{ selected: p.modeEdition }}
              style={[styles.rond, p.modeEdition ? styles.rondPlein : styles.rondVide]}
            >
              <Crayon couleur={p.modeEdition ? couleurs.fond : couleurs.encre} taille={18} />
            </Pressable>
          )}
          <Pressable
            onPress={p.onAjouter}
            accessibilityRole="button"
            accessibilityLabel="Ajouter une clé"
            style={[styles.rond, styles.rondPlein]}
          >
            <Plus couleur={couleurs.fond} taille={20} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.grille, { paddingBottom: marges.bottom + 24 }]}>
        {p.sites.length === 0 ? (
          <Pressable
            onPress={p.onAjouter}
            accessibilityRole="button"
            style={[styles.vide, { width: pleine }]}
          >
            <Text style={styles.videTitre}>Ta première clé</Text>
            <Text style={styles.videTexte}>
              Ajoute un site : il s'ouvrira ici, dans l'appli, et tu y resteras connecté.
            </Text>
          </Pressable>
        ) : (
          p.sites.map((site, i) => (
            <Plaque
              key={site.id}
              site={site}
              grande={i === 0}
              ouvert={p.ouverts.has(site.id)}
              modeEdition={p.modeEdition}
              peutReculer={i > 0}
              peutAvancer={i < p.sites.length - 1}
              largeur={i === 0 ? pleine : demi}
              onPress={() => (p.modeEdition ? p.onModifier(site) : p.onOuvrir(site))}
              onLongPress={p.onEntrerEdition}
              onDeplacer={(d) => p.onDeplacer(site.id, d)}
            />
          ))
        )}
        {p.sites.length > 0 && (
          <Pressable
            onPress={p.onAjouter}
            accessibilityRole="button"
            style={[styles.nouvelle, { width: demi }]}
          >
            <Text style={styles.nouvelleTexte}>+ Nouvelle clé</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: MARGE,
    paddingBottom: 18,
  },
  titres: { flexShrink: 1, gap: 2 },
  titre: { fontFamily: polices.grasse, fontSize: 44, letterSpacing: -2, color: couleurs.encre },
  sousTitre: { fontFamily: polices.normale, fontSize: 14, color: couleurs.texteDoux },
  actions: { flexDirection: 'row', gap: 8 },
  rond: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  rondVide: { borderWidth: 2, borderColor: couleurs.encre, backgroundColor: couleurs.fond },
  rondPlein: { backgroundColor: couleurs.encre },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: ECART, paddingHorizontal: MARGE },
  vide: {
    minHeight: 200,
    borderRadius: rayons.grandePlaque,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: couleurs.encre,
    padding: 24,
    justifyContent: 'flex-end',
    gap: 8,
  },
  videTitre: { fontFamily: polices.grasse, fontSize: 30, letterSpacing: -1, color: couleurs.encre },
  videTexte: { fontFamily: polices.normale, fontSize: 15, lineHeight: 21, color: couleurs.texteDoux },
  nouvelle: {
    minHeight: 140,
    borderRadius: rayons.plaque,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: couleurs.encre,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nouvelleTexte: { fontFamily: polices.grasse, fontSize: 15, color: couleurs.encre },
});
