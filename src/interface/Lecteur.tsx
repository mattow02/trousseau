import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { initiales } from '../coeur/adresse';
import type { Onglets } from '../coeur/onglets';
import type { Site } from '../coeur/site';
import { Grille, Precedent, Recharger, Suivant } from './Icones';
import { CIBLE, couleurs, polices, rayons } from './theme';

interface EtatPage {
  url: string;
  peutReculer: boolean;
  peutAvancer: boolean;
  progression: number;
}

const ETAT_INITIAL: EtatPage = { url: '', peutReculer: false, peutAvancer: false, progression: 0 };

interface Props {
  sites: Site[];
  onglets: Onglets;
  onOuvrir: (site: Site) => void;
  onAccueil: () => void;
}

/** « https://cobaalt.app/pro?x=1 » s'affiche « cobaalt.app/pro?x=1 ». */
function adresseLisible(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

/**
 * L'écran d'un site ouvert. Toutes les pages ouvertes restent montées, une
 * seule est visible : passer d'une pastille à l'autre ne recharge rien.
 */
export function Lecteur({ sites, onglets, onOuvrir, onAccueil }: Props) {
  const marges = useSafeAreaInsets();
  const vues = useRef(new Map<string, WebView | null>());
  const [etats, setEtats] = useState<Record<string, EtatPage>>({});

  const enregistrerVue = useCallback((id: string, vue: WebView | null) => {
    vues.current.set(id, vue);
  }, []);
  const majEtat = useCallback((id: string, partiel: Partial<EtatPage>) => {
    setEtats((e) => ({ ...e, [id]: { ...(e[id] ?? ETAT_INITIAL), ...partiel } }));
  }, []);

  const actif = sites.find((s) => s.id === onglets.actif) ?? null;
  const etat = actif ? etats[actif.id] : undefined;
  const vue = actif ? vues.current.get(actif.id) : null;
  const ouverts = sites.filter((s) => onglets.ouverts.includes(s.id));

  return (
    <View style={[styles.ecran, { paddingTop: marges.top + 4, paddingBottom: marges.bottom + 4 }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pastilles}
        style={styles.bandeau}
      >
        {sites.map((s) => {
          const estActif = s.id === onglets.actif;
          const plein = estActif || s.mode === 'safari';
          return (
            <Pressable
              key={s.id}
              onPress={() => onOuvrir(s)}
              accessibilityRole="tab"
              accessibilityLabel={s.nom}
              accessibilityState={{ selected: estActif }}
              style={[
                styles.pastille,
                {
                  backgroundColor: estActif ? couleurs.accent : plein ? couleurs.encre : couleurs.fond,
                  borderColor: estActif ? couleurs.accent : couleurs.encre,
                },
              ]}
            >
              <Text style={[styles.pastilleTexte, { color: plein ? couleurs.fond : couleurs.encre }]}>
                {initiales(s.nom)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.carte}>
        {etat && etat.progression < 1 && (
          <View style={[styles.progression, { width: `${Math.max(8, etat.progression * 100)}%` }]} />
        )}
        <View style={styles.pages}>
          {ouverts.map((s) => (
            <PageWeb
              key={s.id}
              id={s.id}
              url={s.url}
              visible={s.id === onglets.actif}
              enregistrerVue={enregistrerVue}
              majEtat={majEtat}
            />
          ))}
        </View>
      </View>

      <View style={styles.barre}>
        <Pressable
          onPress={onAccueil}
          accessibilityRole="button"
          accessibilityLabel="Retour au trousseau"
          style={styles.retour}
        >
          <Grille couleur={couleurs.surAccent} taille={20} />
        </Pressable>
        <View style={styles.legende}>
          <Text numberOfLines={1} style={styles.legendeNom}>
            {actif?.nom ?? ''}
          </Text>
          <Text numberOfLines={1} style={styles.legendeUrl}>
            {adresseLisible(etat?.url || actif?.url || '')}
          </Text>
        </View>
        <BoutonBarre libelle="Page précédente" actif={!!etat?.peutReculer} onPress={() => vue?.goBack()}>
          <Precedent couleur={couleurs.fond} />
        </BoutonBarre>
        <BoutonBarre libelle="Page suivante" actif={!!etat?.peutAvancer} onPress={() => vue?.goForward()}>
          <Suivant couleur={couleurs.fond} />
        </BoutonBarre>
        <BoutonBarre libelle="Recharger" actif={!!vue} onPress={() => vue?.reload()}>
          <Recharger couleur={couleurs.fond} taille={20} />
        </BoutonBarre>
      </View>
    </View>
  );
}

function BoutonBarre(p: { libelle: string; actif: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable
      onPress={p.onPress}
      disabled={!p.actif}
      accessibilityRole="button"
      accessibilityLabel={p.libelle}
      accessibilityState={{ disabled: !p.actif }}
      style={[styles.bouton, { opacity: p.actif ? 1 : 0.35 }]}
    >
      {p.children}
    </Pressable>
  );
}

interface PropsPage {
  id: string;
  url: string;
  visible: boolean;
  enregistrerVue: (id: string, vue: WebView | null) => void;
  majEtat: (id: string, partiel: Partial<EtatPage>) => void;
}

/**
 * Une page web. `memo` et la source mémorisée évitent qu'un rendu du lecteur
 * ne recharge la page : la WebView recharge dès que l'objet `source` change.
 */
const PageWeb = memo(function PageWeb({ id, url, visible, enregistrerVue, majEtat }: PropsPage) {
  const source = useMemo(() => ({ uri: url }), [url]);
  const vue = useRef<WebView | null>(null);

  const surNavigation = useCallback(
    (n: WebViewNavigation) =>
      majEtat(id, { url: n.url, peutReculer: n.canGoBack, peutAvancer: n.canGoForward }),
    [id, majEtat],
  );

  return (
    <View
      style={[StyleSheet.absoluteFill, !visible && styles.cachee]}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
    >
      <WebView
        ref={(v) => {
          vue.current = v;
          enregistrerVue(id, v);
        }}
        source={source}
        // Cookies : la WebView iOS utilise le stockage WebKit persistant par
        // défaut (pas d'`incognito`). Les connexions survivent au redémarrage.
        allowsBackForwardNavigationGestures
        pullToRefreshEnabled
        allowsInlineMediaPlayback
        // Les liens `target="_blank"` se chargent dans cette même vue (sans
        // `onOpenWindow`, c'est le comportement natif iOS de la bibliothèque) :
        // on reste dans l'appli. tel:, mailto: et les autres schémas partent
        // vers iOS grâce à l'`originWhitelist` par défaut.
        onNavigationStateChange={surNavigation}
        onLoadProgress={(e) => majEtat(id, { progression: e.nativeEvent.progress })}
        // iOS tue le processus WebKit des vues cachées quand la mémoire manque :
        // la page deviendrait blanche. On la recharge.
        onContentProcessDidTerminate={() => vue.current?.reload()}
        renderError={(_domaine, _code, description) => (
          <View style={styles.erreur}>
            <Text style={styles.erreurTitre}>Page injoignable</Text>
            <Text style={styles.erreurTexte}>{description}</Text>
            <Pressable
              onPress={() => vue.current?.reload()}
              accessibilityRole="button"
              style={styles.erreurBouton}
            >
              <Text style={styles.erreurBoutonTexte}>Réessayer</Text>
            </Pressable>
          </View>
        )}
        style={styles.webview}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond, paddingHorizontal: 12, gap: 12 },
  bandeau: { flexGrow: 0 },
  pastilles: { gap: 8, paddingVertical: 2 },
  pastille: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastilleTexte: { fontFamily: polices.grasse, fontSize: 16 },
  carte: {
    flex: 1,
    borderRadius: rayons.plaque,
    borderWidth: 2,
    borderColor: couleurs.encre,
    backgroundColor: couleurs.page,
    overflow: 'hidden',
  },
  progression: { height: 4, backgroundColor: couleurs.accent },
  pages: { flex: 1 },
  cachee: { display: 'none' },
  webview: { flex: 1, backgroundColor: couleurs.page },
  barre: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: 32,
    backgroundColor: couleurs.encre,
  },
  retour: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: couleurs.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legende: { flex: 1, minWidth: 0, paddingHorizontal: 8 },
  legendeNom: { fontFamily: polices.grasse, fontSize: 17, color: couleurs.fond },
  legendeUrl: { fontFamily: polices.normale, fontSize: 11, color: couleurs.texteSurEncre },
  bouton: { width: CIBLE, height: 52, alignItems: 'center', justifyContent: 'center' },
  erreur: {
    ...StyleSheet.absoluteFill,
    backgroundColor: couleurs.page,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  erreurTitre: { fontFamily: polices.grasse, fontSize: 24, color: couleurs.encre },
  erreurTexte: { fontFamily: polices.normale, fontSize: 14, color: couleurs.texteDoux, textAlign: 'center' },
  erreurBouton: {
    marginTop: 8,
    paddingHorizontal: 22,
    minHeight: CIBLE,
    justifyContent: 'center',
    borderRadius: rayons.pilule,
    backgroundColor: couleurs.encre,
  },
  erreurBoutonTexte: { fontFamily: polices.grasse, fontSize: 15, color: couleurs.fond },
});
