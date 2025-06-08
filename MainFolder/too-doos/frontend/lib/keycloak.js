import Keycloak from 'keycloak-js';

let keycloak = null;

export function initKeycloak(onAuthenticatedCallback) {
  if (keycloak) {
    onAuthenticatedCallback && onAuthenticatedCallback();
    return;
  }

  keycloak = new Keycloak({
    url: process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER,  
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,  
    clientId: process.env.KEYCLOAK_CLIENT_ID        
  });

  keycloak
    .init({
      onLoad: 'login-required', 
      pkceMethod: 'S256',
      flow: 'standard'
    })
    .then((authenticated) => {
      if (!authenticated) {
        keycloak.login();
      } else {
        onAuthenticatedCallback && onAuthenticatedCallback();
      }
    })
    .catch((err) => {
      console.error('[Keycloak] Błąd inicjalizacji:', err);
    });

  setInterval(() => {
    keycloak
      .updateToken(60)
      .then((refreshed) => {
        if (refreshed) {
          console.log('[Keycloak] Token odświeżony');
        }
      })
      .catch(() => {
        console.warn('[Keycloak] Nie udało się odświeżyć tokenu, przekierowuję na login');
        keycloak.login();
      });
  }, 5 * 60 * 1000);
}

export function getKeycloak() {
  return keycloak;
}
