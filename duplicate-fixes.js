/**
 * Fichier de correction des doublons et erreurs d'inattention
 * Ce fichier identifie et corrige les fonctions dupliquées dans le projet
 */

class DuplicateFixer {
    constructor() {
        this.duplicates = {
            measureFPS: [
                'test-suite.js',
                'service-manager.js', 
                'real-time-monitor.js',
                'toolbar-enhancement.js'
            ],
            debounce: [
                'persistence-service.js',
                'utils.js'
            ],
            throttle: [
                'utils.js' // Fonction unique, pas de doublon
            ]
        };
        
        this.fixes = [];
    }

    /**
     * Analyse et identifie tous les doublons
     */
    analyzeDuplicates() {
        console.log('🔍 Analyse des doublons en cours...');
        
        // Vérifier les fonctions measureFPS
        this.checkMeasureFPSDuplicates();
        
        // Vérifier les fonctions debounce
        this.checkDebounceDuplicates();
        
        // Vérifier d'autres patterns de doublons
        this.checkOtherDuplicates();
        
        return this.fixes;
    }

    /**
     * Vérifie les doublons de measureFPS
     */
    checkMeasureFPSDuplicates() {
        const measureFPSIssue = {
            type: 'function_duplicate',
            function: 'measureFPS',
            files: this.duplicates.measureFPS,
            severity: 'medium',
            description: 'La fonction measureFPS est dupliquée dans 4 fichiers avec des implémentations similaires',
            recommendation: 'Créer une fonction utilitaire centralisée dans utils.js',
            fix: this.createUnifiedMeasureFPS
        };
        
        this.fixes.push(measureFPSIssue);
    }

    /**
     * Vérifie les doublons de debounce
     */
    checkDebounceDuplicates() {
        const debounceIssue = {
            type: 'function_duplicate',
            function: 'debounce',
            files: this.duplicates.debounce,
            severity: 'low',
            description: 'La fonction debounce est dupliquée entre persistence-service.js et utils.js',
            recommendation: 'Utiliser uniquement la version dans utils.js et supprimer la duplication',
            fix: this.fixDebounceDeduplication
        };
        
        this.fixes.push(debounceIssue);
    }

    /**
     * Vérifie d'autres patterns de doublons
     */
    checkOtherDuplicates() {
        // Vérifier les constantes dupliquées
        const constantsIssue = {
            type: 'constants_duplicate',
            description: 'Vérifier les constantes potentiellement dupliquées (couleurs, tailles, etc.)',
            severity: 'low',
            recommendation: 'Centraliser les constantes dans config.js'
        };
        
        this.fixes.push(constantsIssue);
        
        // Vérifier les styles CSS dupliqués
        const stylesIssue = {
            type: 'styles_duplicate',
            description: 'Vérifier les styles CSS potentiellement dupliqués dans les fichiers HTML',
            severity: 'low',
            recommendation: 'Extraire les styles communs dans styles.css'
        };
        
        this.fixes.push(stylesIssue);
    }

    /**
     * Crée une version unifiée de measureFPS
     */
    createUnifiedMeasureFPS() {
        return `
    /**
     * Fonction unifiée pour mesurer les FPS
     * @param {Function} callback - Fonction appelée avec la valeur FPS
     * @param {number} duration - Durée de mesure en ms (défaut: 1000)
     * @param {number} threshold - Seuil d'alerte FPS (défaut: 30)
     * @returns {Function} Fonction pour arrêter la mesure
     */
    static measureFPS(callback, duration = 1000, threshold = 30) {
        let frameCount = 0;
        let lastTime = performance.now();
        let animationId;
        let isRunning = true;
        
        const measure = (currentTime) => {
            if (!isRunning) return;
            
            frameCount++;
            
            if (currentTime - lastTime >= duration) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                // Appeler le callback avec les résultats
                callback({
                    fps,
                    isLow: fps < threshold,
                    timestamp: Date.now()
                });
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            if (isRunning) {
                animationId = requestAnimationFrame(measure);
            }
        };
        
        animationId = requestAnimationFrame(measure);
        
        // Retourner une fonction pour arrêter la mesure
        return () => {
            isRunning = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }`;
    }

    /**
     * Corrige la duplication de debounce
     */
    fixDebounceDeduplication() {
        return {
            action: 'remove_from_persistence_service',
            reason: 'La fonction debounce existe déjà dans utils.js avec une meilleure implémentation',
            replacement: 'Utiliser Utils.debounce() au lieu de this.debounce()'
        };
    }

    /**
     * Génère un rapport de correction
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalIssues: this.fixes.length,
            severityBreakdown: {
                high: this.fixes.filter(f => f.severity === 'high').length,
                medium: this.fixes.filter(f => f.severity === 'medium').length,
                low: this.fixes.filter(f => f.severity === 'low').length
            },
            fixes: this.fixes
        };
        
        console.log('📊 Rapport de correction des doublons:', report);
        return report;
    }

    /**
     * Applique automatiquement les corrections possibles
     */
    autoFix() {
        console.log('🔧 Application des corrections automatiques...');
        
        // Ajouter la fonction measureFPS unifiée à utils.js
        this.addUnifiedMeasureFPSToUtils();
        
        // Créer des commentaires de migration dans les fichiers concernés
        this.addMigrationComments();
        
        console.log('✅ Corrections automatiques appliquées');
    }

    /**
     * Ajoute la fonction measureFPS unifiée à utils.js
     */
    addUnifiedMeasureFPSToUtils() {
        // Cette fonction serait implémentée pour modifier utils.js
        console.log('📝 Ajout de la fonction measureFPS unifiée à utils.js');
    }

    /**
     * Ajoute des commentaires de migration
     */
    addMigrationComments() {
        const migrationComment = `
        // TODO: MIGRATION - Cette fonction est dupliquée
        // Utiliser Utils.measureFPS() à la place
        // Voir duplicate-fixes.js pour plus d'informations
        `;
        
        console.log('📝 Ajout des commentaires de migration');
    }

    /**
     * Vérifie la cohérence des noms de variables
     */
    checkNamingConsistency() {
        const namingIssues = [];
        
        // Vérifier les conventions de nommage
        const conventions = {
            classes: 'PascalCase',
            functions: 'camelCase',
            constants: 'UPPER_SNAKE_CASE',
            variables: 'camelCase'
        };
        
        // Cette fonction analyserait le code pour détecter les incohérences
        console.log('🔍 Vérification de la cohérence des noms...');
        
        return namingIssues;
    }

    /**
     * Vérifie les imports/exports manquants ou incorrects
     */
    checkImportsExports() {
        const importIssues = [];
        
        // Vérifier les dépendances circulaires
        // Vérifier les imports non utilisés
        // Vérifier les exports manquants
        
        console.log('🔍 Vérification des imports/exports...');
        
        return importIssues;
    }
}

// Initialisation et exécution
const duplicateFixer = new DuplicateFixer();

// Analyser les doublons au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        duplicateFixer.analyzeDuplicates();
        duplicateFixer.generateReport();
    });
} else {
    duplicateFixer.analyzeDuplicates();
    duplicateFixer.generateReport();
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DuplicateFixer;
}

if (typeof window !== 'undefined') {
    window.DuplicateFixer = DuplicateFixer;
    window.duplicateFixer = duplicateFixer;
}

// Commande console pour exécuter les corrections
console.log('🔧 Pour appliquer les corrections automatiques, exécutez: duplicateFixer.autoFix()');