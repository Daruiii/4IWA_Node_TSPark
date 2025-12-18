# TSPark API - Documentation Projet

**Plateforme de défis fitness avec système de gamification**

---

## API en Production

**URL de base :** `https://fouriwa-node-tspark.onrender.com`

---

## Documentation & Collections Postman

### Collection Postman de Production

**Fichier :** `TSPark_Production.postman_collection.json`

**Import dans Postman :**
1. Ouvrir Postman
2. Import → Upload Files
3. Sélectionner `TSPark_Production.postman_collection.json`
4. Toutes les routes sont préconfigurées pour la production

**Features de la collection :**
- ✅ BaseUrl configuré automatiquement pour la production
- ✅ Token JWT sauvegardé automatiquement après login
- ✅ Variables d'environnement pour userId, gymId, challengeId, etc.
- ✅ 50+ requêtes organisées par fonctionnalité

---

## Comptes de Test Disponibles

### Administrateur
```
Email: admin@tspark.com
Mot de passe: admin123
```
**Accès complet** : Gestion des utilisateurs, gyms, exercices, badges

### Propriétaire de Salle
```
Email: gymowner@tspark.com
Mot de passe: gym123
```
**Peut** : Créer des challenges, gérer sa salle

### Utilisateurs Clients (avec données)

**Nenou** - 1er du classement (300 points, 1 badge)
```
Email: nenou@client.com
Mot de passe: client123
```

**Kiki** - 2ème du classement (200 points)
```
Email: kiki@client.com
Mot de passe: client123
```

**David** - 3ème du classement (0 points)
```
Email: david@client.com
Mot de passe: client123
```

## Données de Démonstration

### En Production
- **6 utilisateurs** (1 admin, 2 gym_owner, 3clients)
- **3 salles de sport**
- **10 exercices**
- **5 challenges actifs**
- **8 participations** aux challenges
- **3 badges** (Premier Défi, Champion, Guerrier)
- **1 badge attribué** (à Nenou)

### Classement Actuel
1. 🥇 Nenou - 300 points (1 badge)
2. 🥈 Kiki - 200 points
3. 🥉 David - 0 points

---

## Structure des Routes API

### Légende des Permissions

| Symbole | Signification | Description |
|---------|--------------|-------------|
| (public) | Accès public | Accessible sans authentification |
| 🔒 | Authentifié | Token JWT requis |
| 🔐 Admin | Administrateur | Réservé aux admins uniquement |
| 🔒 GymOwner | Propriétaire | Réservé aux propriétaires de salles |

---

### Auth
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion

### Users
- `GET /users` - Liste des utilisateurs 🔒
- `GET /users/:id` - Détails utilisateur 🔒
- `POST /users` - Créer utilisateur 🔐 Admin
- `PATCH /users/:id` - Modifier profil 🔒
- `DELETE /users/:id` - Désactiver compte 🔒
- `PATCH /users/:id/activate` - Réactiver compte 🔐 Admin

### Gyms
- `GET /gyms` - Liste toutes les salles 🔒
- `GET /gyms/approved` - Salles approuvées 🔒
- `GET /gyms/pending` - Salles en attente 🔐 Admin
- `GET /gyms/:id` - Détails salle 🔒
- `POST /gyms` - Créer salle 🔒
- `PATCH /gyms/:id` - Modifier salle 🔒
- `PATCH /gyms/:id/status` - Approuver/refuser 🔐 Admin
- `DELETE /gyms/:id` - Supprimer salle 🔒

### Exercises
- `GET /exercises` - Liste exercices 🔒
- `GET /exercises/difficulty/:level` - Par difficulté 🔒
- `GET /exercises/:id` - Détails exercice 🔒
- `POST /exercises` - Créer exercice 🔐 Admin
- `PATCH /exercises/:id` - Modifier exercice 🔐 Admin
- `DELETE /exercises/:id` - Supprimer exercice 🔐 Admin

### Gym-Exercises
- `GET /gym-exercises` - Toutes les relations 🔒
- `GET /gym-exercises/gym/:gymId` - Exercices d'une salle 🔒
- `POST /gym-exercises` - Lier exercice à salle 🔒
- `DELETE /gym-exercises/:id` - Supprimer lien 🔒

### Challenges
- `GET /challenges` - Challenges actifs (public)
- `GET /challenges?difficulty=easy` - Filtre difficulté (public)
- `GET /challenges?type=cardio` - Filtre type (public)
- `GET /challenges?duration=30` - Filtre durée (public)
- `GET /challenges/status/:status` - Par statut (public)
- `GET /challenges/gym/:gymId` - Par salle (public)
- `GET /challenges/:id` - Détails challenge (public)
- `POST /challenges` - Créer challenge 🔒 GymOwner
- `PATCH /challenges/:id` - Modifier challenge 🔒 GymOwner
- `PATCH /challenges/:id/status` - Changer statut 🔒 GymOwner
- `DELETE /challenges/:id` - Supprimer challenge 🔒 GymOwner

### Challenge Participants
- `GET /challenge-participants` - Toutes les participations (public)
- `GET /challenge-participants/challenge/:challengeId` - Par challenge (public)
- `GET /challenge-participants/user/:userId` - Par utilisateur 🔒
- `GET /challenge-participants/:id` - Détails participation (public)
- `POST /challenge-participants/join` - Rejoindre challenge 🔒
- `PATCH /challenge-participants/:id/progress` - Mettre à jour progression 🔒
- `PATCH /challenge-participants/:id/status` - Changer statut 🔒
- `PATCH /challenge-participants/:id/abandon` - Abandonner 🔒
- `DELETE /challenge-participants/:id` - Supprimer participation 🔒

### Badges
- `GET /badges` - Liste tous les badges (public)
- `GET /badges/category/:category` - Par catégorie (public)
- `GET /badges/rarity/:rarity` - Par rareté (public)
- `GET /badges/:id` - Détails badge (public)
- `POST /badges` - Créer badge 🔐 Admin
- `PATCH /badges/:id` - Modifier badge 🔐 Admin
- `DELETE /badges/:id` - Supprimer badge 🔐 Admin

### User Badges
- `GET /user-badges/me` - Mes badges 🔒
- `GET /user-badges/user/:userId` - Badges d'un utilisateur (public)
- `GET /user-badges/check/:userId/:badgeId` - Vérifier possession (public)
- `GET /user-badges/leaderboard` - Classement badges (public)
- `POST /user-badges/award` - Attribuer badge 🔐 Admin
- `DELETE /user-badges/revoke/:userId/:badgeId` - Révoquer badge 🔐 Admin

### Stats
- `GET /stats/me` - Mes statistiques 🔒
- `GET /stats/user/:userId` - Stats utilisateur (public)
- `GET /stats/leaderboard` - Classement général (public)
- `GET /stats/global` - Stats globales plateforme (public)

---

**Groupe :**
- David
- Iness
- Killian

**Promotion :** 4IWA - 2025-2026
