# Ecole des loisirs – Fondation (Directus + Astro SSG)

Monorepo contenant :
- **/directus** : instance Directus (Docker), schéma versionné.
- **/app** : site Astro rendu en **SSG**. Le contenu vient de Directus. Les pages sont construites avec le **Builder (M2A)**.

## Prérequis

- **Node** ≥ 18
- **Docker** & **Docker Compose**

## Installation

1. **Cloner** le repo.
2. Copier les envs d’exemple :
   ```bash
   cp directus/.env.example directus/.env.local
   cp app/.env.example app/.env.local
3. Lancer Directus
cd directus
docker compose up -d
Première exécution : crée un admin via l’assistant (ou renseigne ADMIN_EMAIL / ADMIN_PASSWORD dans .env.local).

(Optionnel) Appliquer le schéma si schema/snapshot est présent :
docker compose exec directus npx directus schema apply /directus/schema/snapshot.yaml --yes
4. Lancer Astro
cd ../app
npm i
npm run dev
Visiter : http://localhost:4321

## Variables d’environnement
/app/.env.local

DIRECTUS_URL : URL publique de Directus (ex: http://localhost:8055)

DIRECTUS_TOKEN (optionnel) : token lecture seule utilisé au build. Laisser vide pour utiliser le rôle Public.

PUBLIC_HOME_SLUG : slug de la home (ex: accueil).

/directus/.env.local

Variables Directus classiques (voir fichier d’exemple ci-dessous) :

KEY, SECRET, PUBLIC_URL, ADMIN_EMAIL, ADMIN_PASSWORD, etc.

DB par défaut : SQLite (modifiable).

## Développement

Astro (dev) : npm --prefix app run dev

Astro (build SSG) : npm --prefix app run build (sortie dans app/dist)

Aperçu build : npm --prefix app run preview

Directus up/down : docker compose up -d / docker compose down

## Schéma Directus (versionning)

- Snapshot :


```
docker compose exec directus npx directus schema snapshot /directus/schema/snapshot.yaml
 ```


- Apply :

```
compose exec directus npx directus schema apply /directus/schema/snapshot.yaml --yes
```


Le snapshot couvre le schéma (collections/champs/relations). Les flows, policies, etc. peuvent être exportés via l’UI et ajoutés au repo si besoin.


