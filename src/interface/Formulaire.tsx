import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Mode, Site } from '../coeur/site';
import type { Saisie } from '../coeur/trousseau';
import { CIBLE, couleurs, polices, rayons } from './theme';

interface Props {
  /** null : ajout d'un site ; sinon : modification de ce site. */
  site: Site | null;
  /** Rend un message d'erreur à afficher, ou null si c'est enregistré. */
  onEnregistrer: (saisie: Saisie) => string | null;
  onSupprimer: (site: Site) => void;
  onFermer: () => void;
}

const MODES: { valeur: Mode; titre: string; texte: string }[] = [
  {
    valeur: 'webview',
    titre: "Dans l'appli",
    texte: 'Avec les pastilles et la barre du bas. Tu restes connecté.',
  },
  {
    valeur: 'safari',
    titre: 'Safari intégré',
    texte: 'Pour les sites qui se connectent avec Google : Google bloque sa connexion dans les vues web.',
  },
];

/**
 * Ajout et modification d'un site. App.tsx ne monte ce composant que pendant
 * qu'il est ouvert : l'état initial se relit donc depuis `site` à chaque ouverture.
 */
export function Formulaire({ site, onEnregistrer, onSupprimer, onFermer }: Props) {
  const [nom, setNom] = useState(site?.nom ?? '');
  const [adresse, setAdresse] = useState(site?.url ?? '');
  const [mode, setMode] = useState<Mode>(site?.mode ?? 'webview');
  const [erreur, setErreur] = useState<string | null>(null);

  const enregistrer = () => setErreur(onEnregistrer({ nom, adresse, mode }));

  const supprimer = () => {
    if (!site) return;
    Alert.alert(`Retirer ${site.nom} ?`, 'La clé disparaît du trousseau. Ta session sur le site reste intacte.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Retirer', style: 'destructive', onPress: () => onSupprimer(site) },
    ]);
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onFermer}>
      <KeyboardAvoidingView behavior="padding" style={styles.ecran}>
        <View style={styles.entete}>
          <Pressable onPress={onFermer} accessibilityRole="button" hitSlop={8} style={styles.lien}>
            <Text style={styles.lienTexte}>Annuler</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.corps} keyboardShouldPersistTaps="handled">
          <Text style={styles.titre} accessibilityRole="header">
            {site ? 'Modifier la clé' : 'Nouvelle clé'}
          </Text>

          <View style={styles.champ}>
            <Text style={styles.etiquette}>Adresse</Text>
            <TextInput
              value={adresse}
              onChangeText={(t) => {
                setAdresse(t);
                setErreur(null);
              }}
              placeholder="cobaalt.app"
              placeholderTextColor="#767676"
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={!site}
              accessibilityLabel="Adresse"
              style={styles.saisie}
            />
          </View>

          <View style={styles.champ}>
            <Text style={styles.etiquette}>
              Nom <Text style={styles.facultatif}>(facultatif)</Text>
            </Text>
            <TextInput
              value={nom}
              onChangeText={setNom}
              placeholder="Le domaine, si tu laisses vide"
              placeholderTextColor="#767676"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={enregistrer}
              accessibilityLabel="Nom, facultatif"
              style={styles.saisie}
            />
          </View>

          <View style={styles.champ} accessibilityRole="radiogroup">
            <Text style={styles.etiquette}>Ouverture</Text>
            {MODES.map((m) => {
              const choisi = m.valeur === mode;
              return (
                <Pressable
                  key={m.valeur}
                  onPress={() => setMode(m.valeur)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: choisi }}
                  style={[styles.option, choisi && styles.optionChoisie]}
                >
                  <View style={[styles.puce, choisi && styles.puceChoisie]} />
                  <View style={styles.optionTextes}>
                    <Text style={styles.optionTitre}>{m.titre}</Text>
                    <Text style={styles.optionTexte}>{m.texte}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {erreur && (
            <Text style={styles.erreur} accessibilityRole="alert">
              {erreur}
            </Text>
          )}

          <Pressable onPress={enregistrer} accessibilityRole="button" style={styles.principal}>
            <Text style={styles.principalTexte}>{site ? 'Enregistrer' : 'Ajouter au trousseau'}</Text>
          </Pressable>

          {site && (
            <Pressable onPress={supprimer} accessibilityRole="button" style={styles.secondaire}>
              <Text style={styles.secondaireTexte}>Retirer cette clé</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  entete: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 12 },
  lien: { minHeight: CIBLE, justifyContent: 'center' },
  lienTexte: { fontFamily: polices.moyenne, fontSize: 16, color: couleurs.accent },
  corps: { paddingHorizontal: 20, paddingBottom: 40, gap: 22 },
  titre: { fontFamily: polices.grasse, fontSize: 36, letterSpacing: -1.5, color: couleurs.encre },
  champ: { gap: 8 },
  etiquette: { fontFamily: polices.grasse, fontSize: 15, color: couleurs.encre },
  facultatif: { fontFamily: polices.normale, color: couleurs.texteDoux },
  saisie: {
    minHeight: 52,
    borderWidth: 2,
    borderColor: couleurs.encre,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontFamily: polices.normale,
    fontSize: 17,
    color: couleurs.encre,
  },
  option: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#D0D0D0',
  },
  optionChoisie: { borderColor: couleurs.encre },
  puce: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: couleurs.encre, marginTop: 2 },
  puceChoisie: { backgroundColor: couleurs.accent, borderColor: couleurs.accent },
  optionTextes: { flex: 1, gap: 2 },
  optionTitre: { fontFamily: polices.grasse, fontSize: 16, color: couleurs.encre },
  optionTexte: { fontFamily: polices.normale, fontSize: 13, lineHeight: 18, color: couleurs.texteDoux },
  erreur: { fontFamily: polices.moyenne, fontSize: 14, color: couleurs.erreur },
  principal: {
    minHeight: 56,
    borderRadius: rayons.pilule,
    backgroundColor: couleurs.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  principalTexte: { fontFamily: polices.grasse, fontSize: 17, color: couleurs.surAccent },
  secondaire: { minHeight: CIBLE, alignItems: 'center', justifyContent: 'center' },
  secondaireTexte: { fontFamily: polices.moyenne, fontSize: 15, color: couleurs.erreur },
});
