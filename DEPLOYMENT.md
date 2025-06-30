# 🚀 Guide de Déploiement Automatique sur GitHub

Ce projet est configuré pour un déploiement automatique sur GitHub Pages à chaque push sur la branche `main`.

## 📋 Étapes de Configuration

### 1. Créer un Repository GitHub

1. Allez sur [GitHub](https://github.com) et connectez-vous
2. Cliquez sur "New repository" (Nouveau dépôt)
3. Nommez votre repository (ex: `htmltopng-converter`)
4. Laissez-le public pour GitHub Pages gratuit
5. **NE PAS** initialiser avec README, .gitignore ou licence (déjà présents)
6. Cliquez sur "Create repository"

### 2. Lier votre Projet Local au Repository

```bash
# Ajouter l'origine distante (remplacez USERNAME et REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Pousser le code vers GitHub
git push -u origin main
```

### 3. Activer GitHub Pages

1. Allez dans les **Settings** de votre repository
2. Scrollez jusqu'à la section **Pages**
3. Dans "Source", sélectionnez **GitHub Actions**
4. Sauvegardez

### 4. Vérifier le Déploiement

1. Allez dans l'onglet **Actions** de votre repository
2. Vous devriez voir le workflow "Deploy to GitHub Pages" en cours
3. Une fois terminé (✅), votre site sera disponible à :
   `https://USERNAME.github.io/REPO_NAME/`

## 🔄 Déploiement Automatique

Maintenant, à chaque fois que vous :
- Modifiez du code
- Faites un `git add .`
- Faites un `git commit -m "votre message"`
- Faites un `git push`

Le site sera automatiquement redéployé sur GitHub Pages !

## 🛠️ Commandes Git Utiles

```bash
# Vérifier le statut
git status

# Ajouter tous les fichiers modifiés
git add .

# Faire un commit
git commit -m "Description des changements"

# Pousser vers GitHub
git push

# Voir l'historique
git log --oneline
```

## 🔧 Configuration Avancée

### Domaine Personnalisé

1. Créez un fichier `CNAME` à la racine avec votre domaine :
   ```
   mondomaine.com
   ```
2. Configurez vos DNS pour pointer vers GitHub Pages

### Variables d'Environnement

Pour ajouter des variables d'environnement :
1. Allez dans **Settings** > **Secrets and variables** > **Actions**
2. Ajoutez vos secrets
3. Utilisez-les dans le workflow avec `${{ secrets.NOM_SECRET }}`

## 🐛 Dépannage

### Le déploiement échoue
- Vérifiez l'onglet **Actions** pour voir les erreurs
- Assurez-vous que GitHub Pages est activé
- Vérifiez que la branche `main` existe

### Le site ne se met pas à jour
- Attendez quelques minutes (cache GitHub)
- Vérifiez que le workflow s'est exécuté avec succès
- Forcez le rafraîchissement avec Ctrl+F5

### Erreur de permissions
- Vérifiez les permissions dans **Settings** > **Actions** > **General**
- Assurez-vous que "Read and write permissions" est activé

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez la documentation GitHub Pages
2. Consultez les logs dans l'onglet Actions
3. Recherchez l'erreur sur Stack Overflow

---

✨ **Votre site HTML to PNG Converter sera maintenant déployé automatiquement !**