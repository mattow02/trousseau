/**
 * L'accès au stockage du téléphone (AsyncStorage). Seul fichier qui en dépend.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Site } from '../coeur/site';
import { deserialiser, serialiser } from './format';

const CLE = 'trousseau.sites';
const CLE_SECOURS = 'trousseau.sites.illisible';

export async function chargerSites(): Promise<Site[]> {
  const texte = await AsyncStorage.getItem(CLE);
  const lecture = deserialiser(texte);
  if (lecture.etat === 'lu') return lecture.sites;
  if (lecture.etat === 'illisible' && texte !== null) {
    // On garde la sauvegarde abîmée de côté avant que la prochaine écriture l'écrase.
    await AsyncStorage.setItem(CLE_SECOURS, texte);
  }
  return [];
}

export async function enregistrerSites(sites: readonly Site[]): Promise<void> {
  await AsyncStorage.setItem(CLE, serialiser(sites));
}
