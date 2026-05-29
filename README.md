# Discord Presence

Monorepo PNPM pour les applications et packages du projet Discord Presence.

## Structure

- `apps/web` : application web React + TypeScript + Tailwind CSS.
- `apps/companion` : application compagnon Electron + React + TypeScript + Tailwind CSS.
- `apps/extension` : extension navigateur React + TypeScript + Tailwind CSS.
- `packages/websites` : catalogue et logique des sites supportes.
- `packages/utils` : utilitaires partages.
- `packages/tailwind-config` : theme Tailwind partage entre web, extension et compagnon.

Les packages workspace utilisent le scope `@dp/*`.

## Regles

- TypeScript uniquement pour le code source.
- Arrow functions par defaut.
- PNPM comme package manager.
- Build TypeScript via project references.

## Commandes

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm lint
```

Pour compiler uniquement l'extension Chrome :

```bash
pnpm --filter @dp/extension build
```

Le build de l'extension produit `apps/extension/dist` avec le manifest, la popup HTML, le JS, le CSS et les locales Chrome.

Le package `@dp/websites` charge les presences automatiquement depuis `packages/websites/src/[#A-Z]/[PresenceName]`. Pour ajouter un site, il suffit de creer son dossier avec `metadata.json` et `presence.ts`.

Pour compiler l'application web :

```bash
pnpm --filter @dp/web build
```

Pour lancer ou packager le compagnon desktop :

```bash
pnpm --filter @dp/companion dev
pnpm --filter @dp/companion package:win
pnpm --filter @dp/companion package:mac
```

Le compagnon est concu comme une application de fond : il demarre cache, reste dans la zone de notification Windows, et s'ouvre depuis le menu de l'icone tray.
