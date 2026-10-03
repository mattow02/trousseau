/**
 * Un site du trousseau : une « clé » de l'accueil.
 *
 * `mode` décide comment la page s'ouvre :
 * - `webview` : dans la WebView de l'appli, interface entièrement à nous,
 *   cookies persistants (stockage WebKit par défaut).
 * - `safari` : dans le Safari intégré d'iOS (SFSafariViewController), pour les
 *   sites dont la connexion passe par Google, qui bloque les WebViews
 *   (erreur 403 disallowed_useragent).
 */
export type Mode = 'webview' | 'safari';

export interface Site {
  id: string;
  nom: string;
  url: string;
  mode: Mode;
}

export const MODES: readonly Mode[] = ['webview', 'safari'];

export function estMode(valeur: unknown): valeur is Mode {
  return typeof valeur === 'string' && (MODES as readonly string[]).includes(valeur);
}
