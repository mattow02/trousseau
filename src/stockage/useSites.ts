import { useCallback, useEffect, useState } from 'react';

import type { Site } from '../coeur/site';
import { chargerSites, enregistrerSites } from './depot';

/**
 * La liste des sites, chargée au démarrage et sauvegardée à chaque changement.
 * `sites` vaut null tant que le chargement n'est pas fini : on n'écrit rien
 * avant d'avoir lu, sinon un trousseau vide écraserait le vrai.
 */
export function useSites() {
  const [sites, setSites] = useState<Site[] | null>(null);

  useEffect(() => {
    let actif = true;
    chargerSites()
      .catch(() => [] as Site[])
      .then((lus) => {
        if (actif) setSites(lus);
      });
    return () => {
      actif = false;
    };
  }, []);

  const remplacer = useCallback((suivants: Site[]) => {
    setSites(suivants);
    enregistrerSites(suivants).catch((e) => console.warn('Sauvegarde du trousseau impossible', e));
  }, []);

  return { sites, remplacer };
}
