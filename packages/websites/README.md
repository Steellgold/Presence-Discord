# @dp/websites

Catalogue des sites supportes par Discord Presence.

## Ajouter un site

1. Choisir le dossier alphabetique dans `src` :
   - `src/Y/YouTube` pour YouTube.
   - `src/T/Twitch` pour Twitch.
   - `src/#/...` pour un nom qui ne commence pas par une lettre.
2. Creer uniquement :
   - `metadata.json`
   - `presence.ts`
3. Lancer le build.

Le registre est genere automatiquement par `scripts/generate-presence-registry.mjs`.
Il ne faut pas modifier `src/.generated/presences.ts` a la main.

## API

```ts
import {
  findPresenceByHost,
  findWebsiteByHost,
  listPresences,
  listSupportedWebsites,
} from "@dp/websites";
```

