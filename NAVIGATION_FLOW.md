# Flux de Navigation - HTML to PNG Converter

## Vue d'ensemble

Ce document décrit le nouveau flux de navigation mis en place pour l'application HTML to PNG Converter, avec une landing page d'accueil et un système d'authentification intégré.

## Structure des Pages

### 1. Landing Page (`landing.html`)
- **Rôle** : Page d'accueil principale du site
- **Contenu** :
  - Présentation de l'application
  - Fonctionnalités principales
  - Boutons d'action (Se connecter, S'inscrire, Essayer la démo)
- **Redirection automatique** : Si l'utilisateur est déjà connecté, redirection vers `index.html`

### 2. Page de Connexion (`login.html`)
- **Rôle** : Authentification des utilisateurs
- **Contenu** :
  - Connexion via Google/GitHub
  - Connexion manuelle (email/mot de passe)
  - Lien d'inscription
  - Option "Continuer sans compte (Démo)"
- **Navigation** :
  - Bouton retour vers la landing page
  - Redirection vers `index.html` après connexion réussie

### 3. Application Principale (`index.html`)
- **Rôle** : Interface principale de conversion HTML to PNG
- **Contrôle d'accès** :
  - Redirection automatique vers `landing.html` si non connecté (sauf mode démo)
  - Indicateur visuel en mode démo
- **Fonctionnalités** : Toutes les fonctionnalités de conversion existantes

## Flux de Navigation

### Scénario 1 : Nouvel Utilisateur
1. Visite `landing.html` (page d'accueil)
2. Clique sur "Se connecter" → `login.html`
3. S'authentifie → `index.html` (application)

### Scénario 2 : Utilisateur Existant
1. Visite `landing.html`
2. Redirection automatique vers `index.html` (si token valide)

### Scénario 3 : Mode Démo
1. Visite `landing.html`
2. Clique sur "Essayer la démo" → `index.html?demo=true`
3. Utilise l'application sans authentification
4. Indicateur "MODE DÉMO" affiché

### Scénario 4 : Accès Direct à l'Application
1. Visite directe de `index.html`
2. Si non connecté et pas en mode démo → Redirection vers `landing.html`
3. Si connecté → Accès normal à l'application

## Modes d'Utilisation

### Mode Authentifié
- Accès complet aux fonctionnalités
- Sauvegarde des projets
- Synchronisation cloud
- Historique des conversions

### Mode Démo
- Accès aux fonctionnalités de base
- Pas de sauvegarde
- Indicateur visuel "MODE DÉMO"
- Possibilité de se connecter à tout moment

## Paramètres et Stockage

### LocalStorage
- `user_token` : Token d'authentification
- `demo_mode` : Flag pour le mode démo

### Paramètres URL
- `?demo=true` : Active le mode démo

## Sécurité

- Vérification du token d'authentification
- Redirection automatique si non autorisé
- Mode démo sécurisé (fonctionnalités limitées)
- Protection contre l'accès direct non autorisé

## Points d'Entrée

1. **landing.html** : Point d'entrée principal recommandé
2. **index.html** : Accès direct avec contrôle d'authentification
3. **login.html** : Page de connexion avec retour possible

## Améliorations Futures

- Système d'inscription intégré
- Récupération de mot de passe
- Gestion des sessions
- Analytics de navigation
- A/B testing sur la landing page