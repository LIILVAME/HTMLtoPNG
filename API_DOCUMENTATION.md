# Documentation des Connexions API REST

## Vue d'ensemble

Le convertisseur HTML to PNG intègre maintenant des connexions externes via des API REST pour enrichir l'expérience utilisateur avec des ressources externes comme des images, polices, icônes et palettes de couleurs.

## Services Intégrés

### 1. Unsplash API
**Service :** Images gratuites haute qualité
**Endpoint :** `https://api.unsplash.com/`
**Fonctionnalités :**
- Recherche d'images par mots-clés
- Insertion directe dans le code HTML
- Attribution automatique des auteurs

### 2. Google Fonts API
**Service :** Polices web gratuites
**Endpoint :** `https://www.googleapis.com/webfonts/v1/`
**Fonctionnalités :**
- Recherche de polices par nom
- Insertion automatique des imports CSS
- Prévisualisation des polices

### 3. Iconify API
**Service :** Icônes vectorielles
**Endpoint :** `https://api.iconify.design/`
**Fonctionnalités :**
- Recherche d'icônes par mots-clés
- Insertion d'icônes SVG
- Support de multiples collections

### 4. Pexels API
**Service :** Photos et vidéos gratuites
**Endpoint :** `https://api.pexels.com/v1/`
**Fonctionnalités :**
- Recherche de photos HD
- Insertion directe dans le code
- Attribution des photographes

### 5. Color API
**Service :** Génération de palettes de couleurs
**Endpoint :** `https://www.thecolorapi.com/`
**Fonctionnalités :**
- Génération de palettes harmonieuses
- Insertion de classes CSS pour les couleurs
- Codes hexadécimaux et noms de couleurs

## Architecture Technique

### Gestionnaire d'API (`api-manager.js`)
```javascript
class APIManager {
    constructor() {
        this.config = new APIConfig();
        this.cache = new APICache();
        this.rateLimiter = new Map();
    }
    
    async makeRequest(endpoint, options = {}) {
        // Gestion des requêtes avec retry et cache
    }
}
```

### Configuration (`api-config.js`)
- Gestion des environnements (dev, staging, prod)
- Configuration des endpoints
- Gestion des clés API

### Cache (`api-cache.js`)
- Cache en mémoire et localStorage
- Gestion de l'expiration
- Optimisation des performances

### Services Externes (`external-services.js`)
- Classes spécialisées pour chaque service
- Rate limiting
- Gestion d'erreurs

## Utilisation

### Interface Utilisateur
1. **Section Services Externes** : Nouvelle section dans l'interface avec 5 boutons
2. **Modales de Recherche** : Interface de recherche pour chaque service
3. **Insertion Automatique** : Clic pour insérer le contenu dans le code

### Workflow
1. L'utilisateur clique sur un service (ex: Unsplash)
2. Une modale s'ouvre avec un champ de recherche
3. L'utilisateur tape sa recherche et appuie sur "Search"
4. Les résultats s'affichent dans une grille
5. Clic sur un résultat pour l'insérer dans le code
6. Prévisualisation automatique mise à jour

## Configuration des Clés API

### Variables d'Environnement
```javascript
// Dans api-config.js
const API_KEYS = {
    unsplash: process.env.UNSPLASH_ACCESS_KEY || 'demo-key',
    pexels: process.env.PEXELS_API_KEY || 'demo-key',
    // Autres clés...
};
```

### Mode Démo
Pour le développement, des clés de démonstration sont utilisées avec des limitations :
- Nombre de requêtes limité
- Résultats restreints
- Watermarks possibles

## Gestion d'Erreurs

### Types d'Erreurs
1. **Erreurs Réseau** : Connexion internet, timeouts
2. **Erreurs API** : Clés invalides, quotas dépassés
3. **Erreurs de Parsing** : Réponses malformées

### Stratégies de Récupération
- Retry automatique avec backoff exponentiel
- Fallback vers le cache
- Messages d'erreur utilisateur-friendly

## Performance et Optimisation

### Cache Intelligent
- Cache des résultats de recherche (5 minutes)
- Cache des ressources (images, polices) (1 heure)
- Nettoyage automatique du cache

### Rate Limiting
- Limitation des requêtes par service
- Queue de requêtes avec priorité
- Debouncing des recherches

### Lazy Loading
- Chargement différé des services
- Initialisation à la demande
- Optimisation de la taille du bundle

## Sécurité

### Protection des Clés API
- Clés stockées côté serveur (production)
- Proxy pour masquer les endpoints
- Validation des requêtes

### CORS et CSP
- Configuration CORS appropriée
- Content Security Policy mise à jour
- Validation des domaines autorisés

## Monitoring et Analytics

### Métriques Collectées
- Nombre de requêtes par service
- Temps de réponse moyen
- Taux d'erreur
- Utilisation du cache

### Logs
- Requêtes API avec timestamps
- Erreurs avec stack traces
- Performance des services

## Développement et Tests

### Tests Unitaires
```bash
npm run test:api
```

### Tests d'Intégration
```bash
npm run test:integration
```

### Mode Debug
```javascript
// Activer les logs détaillés
window.API_DEBUG = true;
```

## Roadmap

### Prochaines Fonctionnalités
1. **Giphy API** : GIFs animés
2. **Pixabay API** : Images et illustrations
3. **Adobe Fonts** : Polices premium
4. **Figma API** : Import de designs
5. **AI Services** : Génération d'images par IA

### Améliorations Prévues
- Recherche avancée avec filtres
- Favoris et collections
- Historique des recherches
- Synchronisation cloud
- API personnalisées

## Support et Maintenance

### Mise à Jour des APIs
- Vérification régulière des versions
- Migration automatique si possible
- Notifications de changements

### Monitoring Continu
- Health checks automatiques
- Alertes en cas de panne
- Métriques de performance

## Conclusion

L'intégration des connexions API REST transforme le convertisseur HTML to PNG en un outil complet de création de contenu visuel, permettant aux utilisateurs d'accéder facilement à des millions de ressources externes tout en maintenant une expérience utilisateur fluide et performante.