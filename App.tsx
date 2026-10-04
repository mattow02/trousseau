// Import graisse par graisse : l'index du paquet embarquerait les sept.
import { BricolageGrotesque_400Regular } from '@expo-google-fonts/bricolage-grotesque/400Regular';
import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque/600SemiBold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ONGLETS_VIDES, ouvrir, revenirAccueil, synchroniser, type Onglets } from './src/coeur/onglets';
import type { Site } from './src/coeur/site';
import { ajouterSite, deplacerSite, modifierSite, supprimerSite, type Saisie } from './src/coeur/trousseau';
import { Accueil } from './src/interface/Accueil';
import { Formulaire } from './src/interface/Formulaire';
import { Lecteur } from './src/interface/Lecteur';
import { couleurs, polices } from './src/interface/theme';
import { useSites } from './src/stockage/useSites';

type Edition = { site: Site | null } | null;

function nouvelId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [policesPretes] = useFonts({
    [polices.normale]: BricolageGrotesque_400Regular,
    [polices.moyenne]: BricolageGrotesque_600SemiBold,
    [polices.grasse]: BricolageGrotesque_800ExtraBold,
  });
  const { sites, remplacer } = useSites();
  const [onglets, setOnglets] = useState<Onglets>(ONGLETS_VIDES);
  const [modeEdition, setModeEdition] = useState(false);
  const [edition, setEdition] = useState<Edition>(null);

  // Un site supprimé ou passé en mode Safari quitte les pages ouvertes.
  useEffect(() => {
    if (!sites) return;
    const ids = new Set(sites.filter((s) => s.mode === 'webview').map((s) => s.id));
    setOnglets((o) => synchroniser(o, ids));
  }, [sites]);

  const ouverts = useMemo(() => new Set(onglets.ouverts), [onglets.ouverts]);

  if (!policesPretes || !sites) return <View style={styles.fond} />;

  const ouvrirSite = (site: Site) => {
    Haptics.selectionAsync();
    if (site.mode === 'safari') {
      WebBrowser.openBrowserAsync(site.url, {
        controlsColor: couleurs.accent,
        dismissButtonStyle: 'done',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
      return;
    }
    setOnglets((o) => ouvrir(o, site.id));
  };

  const enregistrer = (saisie: Saisie): string | null => {
    const r = edition?.site
      ? modifierSite(sites, edition.site.id, saisie)
      : ajouterSite(sites, saisie, nouvelId());
    if (!r.ok) return r.erreur;
    remplacer(r.sites);
    setEdition(null);
    return null;
  };

  const supprimer = (site: Site) => {
    const reste = supprimerSite(sites, site.id);
    remplacer(reste);
    setEdition(null);
    if (reste.length === 0) setModeEdition(false);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.fond}>
        <Accueil
          sites={sites}
          ouverts={ouverts}
          modeEdition={modeEdition}
          onBasculerEdition={() => setModeEdition((m) => !m)}
          onEntrerEdition={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setModeEdition(true);
          }}
          onOuvrir={ouvrirSite}
          onModifier={(site) => setEdition({ site })}
          onAjouter={() => setEdition({ site: null })}
          onDeplacer={(id, d) => remplacer(deplacerSite(sites, id, d))}
        />

        {/* Monté tant qu'une page est ouverte, même depuis l'accueil : les pages
            restent chargées derrière et la pastille les rouvre sans attendre. */}
        {onglets.ouverts.length > 0 && (
          <View style={[StyleSheet.absoluteFill, onglets.actif === null && styles.cache]}>
            <Lecteur
              sites={sites}
              onglets={onglets}
              onOuvrir={ouvrirSite}
              onAccueil={() => setOnglets(revenirAccueil)}
            />
          </View>
        )}
      </View>

      {edition && (
        <Formulaire
          site={edition.site}
          onEnregistrer={enregistrer}
          onSupprimer={supprimer}
          onFermer={() => setEdition(null)}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: couleurs.fond },
  cache: { display: 'none' },
});
