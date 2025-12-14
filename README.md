# TSPark API

API REST pour la plateforme de défis fitness TSPark.

## IMPORTANT : Bien regarder le schema de la base de données avant de travailler dessus.

[Schéma de la BDD - dbdiagram.io](https://dbdiagram.io/d/4IWA-NodeJs-TSpark-693bef3be877c6307496f75f)

## Pour qu'on bosse en même temps : (Méthode Agile HEHEHEHA)

- Cloner le repo (logique mdr)
- Créer une branche par feature (git checkout -b feature/ma-feature)
- on voit en DM qui fait quoi ou on se fait un ptit tableau au pire
- Faire des PR quand c'est prêt à être revu/mergé (bon pas grave au pire mdr mais mieux)
- Merge rapidement quand c'est ok
- Re pull souvent la branche main pour être à jour !

## Installation

```bash
# Cloner le repo
git clone https://github.com/Daruiii/4IWA_Node_TSPark.git
cd 4IWA_Node_TSPark

# Installer les dépendances
npm install
```

## 🐳 Lancer MongoDB avec Docker

```bash
# Démarrer MongoDB
docker compose up -d

# Vérifier que ça tourne
docker ps
```

## Démarrer le serveur

```bash
# Mode développement (compile + lance)
npm run dev

# OU en 2 étapes
npm run build
npm start
```

Le serveur démarre sur **http://localhost:3000**

## Compilation TypeScript

```bash
# Compiler les fichiers .ts en .js dans dist/
npm run build
# OU directement
npx tsc
```

## Qualité du code

### Prettier (Formatage automatique)

```bash
# Formater tout le code
npm run prettier

# Vérifier le formatage sans modifier
npm run prettier:check
```

### ESLint (Analyse du code)

```bash
# Vérifier les erreurs et warnings
npm run lint

# Corriger automatiquement ce qui peut l'être
npm run lint:fix
```

**💡 Conseil :** Lance `npm run prettier && npm run lint` avant de commit

## Tester l'API

### Route de test

```bash
curl http://localhost:3000
# {"message":"TSPark API is running"}
```

## Base de données

Visualiser le schéma sur https://dbdiagram.io/d/4IWA-NodeJs-TSpark-693bef3be877c6307496f75f

## Variables d'environnement

Fichier `.env` :

```env
PORT=3000
MONGODB_URI=mongodb://tspark:tspark123@localhost:27017/tspark?authSource=admin
```

## Rôles utilisateurs

- **admin** : Super administrateur
- **gym_owner** : Propriétaire de salle de sport
- **client** : Utilisateur client

## Déploiement

On déploiera sur sur **Render**
Dadou s'en occupera la team 🫡 (ou sinon jvous laisse check comment ça marche)
