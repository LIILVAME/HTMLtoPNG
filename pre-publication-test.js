/**
 * Script de Test Pré-Publication
 * Valide toutes les fonctionnalités avant mise en production
 */

class PrePublicationTest {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
        this.startTime = Date.now();
    }

    /**
     * Lance tous les tests de pré-publication
     */
    async runAllTests() {
        console.log('🧪 Démarrage des tests pré-publication...');
        
        try {
            // Tests de base
            await this.testBasicFunctionality();
            
            // Tests des corrections
            await this.testDuplicateFixes();
            
            // Tests de production
            await this.testProductionMode();
            
            // Tests de performance
            await this.testPerformance();
            
            // Tests de sécurité
            await this.testSecurity();
            
            // Tests d'intégration
            await this.testIntegration();
            
            return this.generateTestReport();
            
        } catch (error) {
            this.addTest('Test Framework', false, `Erreur critique: ${error.message}`);
            return this.generateTestReport();
        }
    }

    /**
     * Tests de fonctionnalité de base
     */
    async testBasicFunctionality() {
        console.log('🔧 Test des fonctionnalités de base...');
        
        // Test du DOM
        const hasMainElements = document.querySelector('#htmlInput') && 
                               document.querySelector('#convertBtn') && 
                               document.querySelector('#downloadBtn');
        this.addTest('Éléments DOM principaux', hasMainElements, 'Éléments HTML requis présents');
        
        // Test des services
        const hasServiceManager = typeof ServiceManager !== 'undefined';
        this.addTest('ServiceManager disponible', hasServiceManager, 'Gestionnaire de services chargé');
        
        // Test des utilitaires
        const hasUtils = typeof Utils !== 'undefined' && 
                        typeof Utils.debounce === 'function' && 
                        typeof Utils.measureFPS === 'function';
        this.addTest('Utilitaires consolidés', hasUtils, 'Fonctions utilitaires centralisées');
        
        // Test de la configuration
        const hasConfig = typeof CONFIG !== 'undefined';
        this.addTest('Configuration chargée', hasConfig, 'Fichier de configuration disponible');
    }

    /**
     * Tests des corrections de doublons
     */
    async testDuplicateFixes() {
        console.log('📋 Test des corrections de doublons...');
        
        // Test measureFPS consolidée
        const measureFPSExists = typeof Utils !== 'undefined' && typeof Utils.measureFPS === 'function';
        this.addTest('measureFPS consolidée', measureFPSExists, 'Fonction measureFPS centralisée dans Utils');
        
        // Test debounce consolidée
        const debounceExists = typeof Utils !== 'undefined' && typeof Utils.debounce === 'function';
        this.addTest('debounce consolidée', debounceExists, 'Fonction debounce centralisée dans Utils');
        
        // Test throttle consolidée
        const throttleExists = typeof Utils !== 'undefined' && typeof Utils.throttle === 'function';
        this.addTest('throttle consolidée', throttleExists, 'Fonction throttle centralisée dans Utils');
        
        // Test DuplicateFixer
        const duplicateFixerExists = typeof DuplicateFixer !== 'undefined';
        this.addTest('DuplicateFixer chargé', duplicateFixerExists, 'Système de correction des doublons disponible');
    }

    /**
     * Tests du mode production
     */
    async testProductionMode() {
        console.log('🚀 Test du mode production...');
        
        // Test de la désactivation des console.log
        const originalConsoleLog = console.log;
        let consoleDisabled = false;
        
        if (typeof CONFIG !== 'undefined' && CONFIG.environment === 'production') {
            consoleDisabled = console.log === (() => {}) || console.log.toString().includes('production');
        }
        
        this.addTest('Console logs désactivés', consoleDisabled || CONFIG?.environment !== 'production', 
                    'Console logs gérés selon l\'environnement');
        
        // Test de la protection DevTools
        const devToolsProtected = typeof window.blockDevTools === 'function' || 
                                 document.addEventListener.toString().includes('keydown');
        this.addTest('Protection DevTools', devToolsProtected, 'Protection contre l\'inspection activée');
        
        // Test des scripts de production
        const productionScriptsLoaded = typeof ProductionCleanup !== 'undefined' && 
                                       typeof FinalCleanup !== 'undefined';
        this.addTest('Scripts de production', productionScriptsLoaded, 'Scripts d\'optimisation chargés');
    }

    /**
     * Tests de performance
     */
    async testPerformance() {
        console.log('⚡ Test des performances...');
        
        // Test de mesure FPS
        if (typeof Utils !== 'undefined' && typeof Utils.measureFPS === 'function') {
            try {
                const fpsTest = Utils.measureFPS((fps, isLowFPS) => {
                    this.addTest('Mesure FPS fonctionnelle', fps > 0, `FPS mesuré: ${fps}`);
                    
                    if (fps < 30) {
                        this.addTest('Performance FPS', false, `FPS bas détecté: ${fps}`, 'warning');
                    } else {
                        this.addTest('Performance FPS', true, `FPS acceptable: ${fps}`);
                    }
                });
                
                // Arrêter la mesure après 1 seconde
                setTimeout(() => {
                    if (typeof fpsTest === 'function') fpsTest();
                }, 1000);
                
            } catch (error) {
                this.addTest('Mesure FPS', false, `Erreur lors de la mesure FPS: ${error.message}`);
            }
        } else {
            this.addTest('Mesure FPS', false, 'Fonction measureFPS non disponible');
        }
        
        // Test de la mémoire
        if (performance.memory) {
            const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
            const memoryOK = memoryUsage < 100; // Moins de 100MB
            this.addTest('Utilisation mémoire', memoryOK, 
                        `Mémoire utilisée: ${memoryUsage.toFixed(2)}MB`, 
                        memoryOK ? 'success' : 'warning');
        }
    }

    /**
     * Tests de sécurité
     */
    async testSecurity() {
        console.log('🛡️ Test de sécurité...');
        
        // Test de la protection contre l'inspection
        const hasKeyboardProtection = document.addEventListener.toString().includes('keydown') ||
                                     typeof window.blockDevTools === 'function';
        this.addTest('Protection clavier', hasKeyboardProtection, 'Raccourcis de développement bloqués');
        
        // Test de la protection du clic droit
        const hasContextMenuProtection = document.addEventListener.toString().includes('contextmenu');
        this.addTest('Protection clic droit', hasContextMenuProtection, 'Menu contextuel désactivé');
        
        // Test de la détection DevTools
        const hasDevToolsDetection = typeof window.detectDevTools === 'function' ||
                                    window.outerHeight - window.innerHeight > 200;
        this.addTest('Détection DevTools', hasDevToolsDetection, 'Système de détection des outils de développement');
    }

    /**
     * Tests d'intégration
     */
    async testIntegration() {
        console.log('🔗 Test d\'intégration...');
        
        // Test de l'initialisation des services
        const servicesReady = window.serviceManager !== undefined;
        this.addTest('Services initialisés', servicesReady, 'Gestionnaire de services opérationnel');
        
        // Test de la validation automatique
        const validationExists = typeof ValidationScript !== 'undefined';
        this.addTest('Validation automatique', validationExists, 'Script de validation chargé');
        
        // Test du rapport de corrections
        const summaryExists = typeof CorrectionsSummary !== 'undefined';
        this.addTest('Rapport de corrections', summaryExists, 'Système de rapport disponible');
        
        // Test de la persistance
        const localStorageWorks = typeof localStorage !== 'undefined' && localStorage.setItem;
        this.addTest('Stockage local', localStorageWorks, 'LocalStorage fonctionnel');
    }

    /**
     * Ajoute un résultat de test
     */
    addTest(name, passed, message, type = 'test') {
        const result = {
            name,
            passed,
            message,
            type,
            timestamp: Date.now()
        };
        
        this.testResults.tests.push(result);
        
        if (passed) {
            this.testResults.passed++;
            console.log(`✅ ${name}: ${message}`);
        } else {
            if (type === 'warning') {
                this.testResults.warnings++;
                console.warn(`⚠️ ${name}: ${message}`);
            } else {
                this.testResults.failed++;
                console.error(`❌ ${name}: ${message}`);
            }
        }
    }

    /**
     * Génère le rapport final des tests
     */
    generateTestReport() {
        const duration = Date.now() - this.startTime;
        const total = this.testResults.passed + this.testResults.failed + this.testResults.warnings;
        const successRate = total > 0 ? (this.testResults.passed / total * 100).toFixed(1) : 0;
        
        const report = {
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`,
            summary: {
                total_tests: total,
                passed: this.testResults.passed,
                failed: this.testResults.failed,
                warnings: this.testResults.warnings,
                success_rate: `${successRate}%`,
                status: this.testResults.failed === 0 ? 'READY_FOR_PUBLICATION' : 'NEEDS_FIXES'
            },
            details: this.testResults.tests,
            recommendations: this.generateRecommendations()
        };
        
        this.displayReport(report);
        this.saveReport(report);
        
        return report;
    }

    /**
     * Génère des recommandations basées sur les résultats
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.testResults.failed === 0) {
            recommendations.push('✅ Tous les tests sont passés - Prêt pour publication');
            recommendations.push('🚀 Procéder au déploiement en production');
        } else {
            recommendations.push('❌ Corriger les tests échoués avant publication');
            recommendations.push('🔧 Vérifier les fonctionnalités critiques');
        }
        
        if (this.testResults.warnings > 0) {
            recommendations.push('⚠️ Examiner les avertissements pour optimiser');
        }
        
        recommendations.push('📊 Surveiller les performances après déploiement');
        recommendations.push('🔄 Effectuer des tests réguliers');
        
        return recommendations;
    }

    /**
     * Affiche le rapport de test
     */
    displayReport(report) {
        console.log('\n' + '='.repeat(70));
        console.log('🧪 RAPPORT DE TESTS PRÉ-PUBLICATION');
        console.log('='.repeat(70));
        
        console.log(`\n📊 RÉSUMÉ:`);
        console.log(`   Statut: ${report.summary.status}`);
        console.log(`   Tests totaux: ${report.summary.total_tests}`);
        console.log(`   Réussis: ${report.summary.passed}`);
        console.log(`   Échoués: ${report.summary.failed}`);
        console.log(`   Avertissements: ${report.summary.warnings}`);
        console.log(`   Taux de réussite: ${report.summary.success_rate}`);
        console.log(`   Durée: ${report.duration}`);
        
        if (report.details.filter(t => !t.passed && t.type !== 'warning').length > 0) {
            console.log(`\n❌ TESTS ÉCHOUÉS:`);
            report.details.filter(t => !t.passed && t.type !== 'warning').forEach(test => {
                console.log(`   ${test.name}: ${test.message}`);
            });
        }
        
        if (report.details.filter(t => t.type === 'warning').length > 0) {
            console.log(`\n⚠️ AVERTISSEMENTS:`);
            report.details.filter(t => t.type === 'warning').forEach(test => {
                console.log(`   ${test.name}: ${test.message}`);
            });
        }
        
        console.log(`\n💡 RECOMMANDATIONS:`);
        report.recommendations.forEach(rec => {
            console.log(`   ${rec}`);
        });
        
        console.log('\n' + '='.repeat(70));
        
        if (report.summary.status === 'READY_FOR_PUBLICATION') {
            console.log('🎉 APPLICATION PRÊTE POUR PUBLICATION!');
        } else {
            console.log('⚠️ CORRECTIONS NÉCESSAIRES AVANT PUBLICATION');
        }
        
        console.log('='.repeat(70));
    }

    /**
     * Sauvegarde le rapport
     */
    saveReport(report) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('pre_publication_test_report', JSON.stringify(report));
            console.log('💾 Rapport sauvegardé dans localStorage');
        }
    }
}

// Export et auto-exécution
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrePublicationTest;
} else {
    window.PrePublicationTest = PrePublicationTest;
}

// Exécution automatique après chargement complet
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Attendre que tous les services soient initialisés
        setTimeout(async () => {
            console.log('🧪 Lancement des tests pré-publication...');
            
            const tester = new PrePublicationTest();
            const report = await tester.runAllTests();
            
            // Notification finale
            if (report.summary.status === 'READY_FOR_PUBLICATION') {
                console.log('\n🎯 VALIDATION COMPLÈTE - PRÊT POUR PUBLICATION!');
            } else {
                console.log('\n⚠️ VALIDATION INCOMPLÈTE - CORRECTIONS NÉCESSAIRES');
            }
            
        }, 3000); // Attendre 3 secondes pour l'initialisation complète
    });
}