# HTML to PNG Converter 🎨

Un convertisseur HTML vers PNG moderne et intuitif avec support multilingue et interface utilisateur de pointe.

## ✨ Fonctionnalités

### 🌍 Multilingue
- Support de 4 langues : Français, Anglais, Espagnol, Allemand
- Détection automatique de la langue du navigateur
- Sélecteur de langue accessible dès la landing page

### 🎯 Conversion Avancée
- Conversion HTML + CSS vers PNG haute qualité
- Aperçu en temps réel du rendu
- Choix de résolution personnalisable
- Qualité d'export ajustable (1x, 2x, 3x)
- Presets pour différents formats (Mobile, Tablet, Desktop, Social)

### 🎨 Design Moderne
- Interface utilisateur moderne et responsive
- Design thinking appliqué pour une UX optimale
- Animations fluides et feedback visuel
- Support des appareils mobiles et desktop

### ⚡ Performance
- Aperçu instantané avec debouncing
- Conversion côté client (pas de serveur requis)
- Code optimisé et léger

## 🚀 Installation

### Méthode Simple
1. Téléchargez tous les fichiers dans un dossier
2. Ouvrez `index.html` dans votre navigateur
3. C'est tout ! Aucune installation supplémentaire requise

### Serveur Local (Recommandé)
```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js (si vous avez npx)
npx serve .

# Avec PHP
php -S localhost:8000
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

## 📱 Utilisation

### 1. Sélection de la Langue
- Cliquez sur le sélecteur de langue en haut à droite
- Choisissez votre langue préférée
- L'interface se met à jour automatiquement

### 2. Saisie du Code
- **HTML** : Collez votre code HTML dans l'onglet HTML
- **CSS** : Ajoutez votre CSS dans l'onglet CSS (optionnel)
- L'aperçu se met à jour automatiquement

### 3. Configuration de l'Export
- **Résolution** : Définissez la largeur et hauteur en pixels
- **Qualité** : Choisissez entre Standard (1x), High (2x), ou Ultra (3x)
- **Presets** : Utilisez les boutons rapides pour des formats courants

### 4. Conversion et Téléchargement
- Cliquez sur "Convertir en Image"
- Attendez la fin de la conversion
- Cliquez sur le bouton de téléchargement pour sauvegarder

## 🛠️ Technologies Utilisées

- **HTML5** : Structure sémantique moderne
- **CSS3** : Styles avancés avec Grid, Flexbox, et animations
- **JavaScript ES6+** : Logique applicative moderne
- **html2canvas** : Bibliothèque de conversion HTML vers Canvas
- **Font Awesome** : Icônes vectorielles
- **Google Fonts** : Typographie Inter

## 📋 Fonctionnalités Techniques

### Architecture MVP
- Code modulaire et maintenable
- Séparation des préoccupations
- Gestion d'état simple mais efficace
- Gestion d'erreurs robuste

### Responsive Design
- Mobile-first approach
- Breakpoints optimisés
- Interface adaptative
- Touch-friendly sur mobile

### Performance
- Lazy loading des bibliothèques
- Debouncing pour l'aperçu
- Optimisation des ressources
- Code minimaliste

## 🎯 Cas d'Usage

- **Développeurs** : Capture de composants UI
- **Designers** : Export de maquettes HTML
- **Marketeurs** : Création d'images pour les réseaux sociaux
- **Éducateurs** : Capture de code pour documentation
- **Blogueurs** : Images de code pour articles

## 🔧 Personnalisation

### Ajouter une Langue
1. Ouvrez `translations.js`
2. Ajoutez votre langue dans l'objet `translations`
3. Ajoutez l'option dans le sélecteur HTML

### Modifier les Presets
1. Ouvrez `script.js`
2. Modifiez l'objet `presets` dans la méthode `setupPresets()`

### Personnaliser le Style
1. Modifiez `styles.css`
2. Les variables CSS sont en haut du fichier pour faciliter la personnalisation

## 🐛 Résolution de Problèmes

### L'aperçu ne s'affiche pas
- Vérifiez que votre HTML est valide
- Assurez-vous d'avoir une connexion internet (pour les CDN)
- Essayez de rafraîchir l'aperçu

### La conversion échoue
- Vérifiez la syntaxe de votre HTML/CSS
- Réduisez la résolution si l'image est trop grande
- Essayez sans CSS externe

### Performance lente
- Réduisez la qualité d'export
- Simplifiez votre code HTML/CSS
- Fermez les autres onglets du navigateur

## 📈 Roadmap

### Version 1.1
- [ ] Support des images externes
- [ ] Export en différents formats (JPEG, WebP)
- [ ] Historique des conversions
- [ ] Mode sombre

### Version 1.2
- [ ] Éditeur de code avec coloration syntaxique
- [ ] Templates prédéfinis
- [ ] Partage direct sur les réseaux sociaux
- [ ] API REST pour intégration

### Version 2.0
- [ ] Application Progressive Web App (PWA)
- [ ] Mode hors ligne
- [ ] Synchronisation cloud
- [ ] Collaboration en temps réel

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [html2canvas](https://html2canvas.hertzen.com/) pour la conversion
- [Font Awesome](https://fontawesome.com/) pour les icônes
- [Google Fonts](https://fonts.google.com/) pour la typographie
- La communauté open source pour l'inspiration

---

**Fait avec ❤️ pour les développeurs et designers**