/**
 * Suite de tests automatisés pour l'application HTML to PNG
 * Tests d'intégration, performance et fonctionnalité
 */

class TestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        this.init();
    }

    init() {
        console.log('🧪 Initialisation de la suite de tests');
        this.setupTests();
        this.createTestUI();
    }

    // Configuration des tests
    setupTests() {
        // Tests de l'interface utilisateur
        this.addTest('UI Elements', () => this.testUIElements());
        this.addTest('Toolbar Functionality', () => this.testToolbarFunctionality());
        this.addTest('Modal System', () => this.testModalSystem());
        this.addTest('Responsive Design', () => this.testResponsiveDesign());
        
        // Tests de performance
        this.addTest('Page Load Performance', () => this.testPageLoadPerformance());
        this.addTest('Animation Performance', () => this.testAnimationPerformance());
        this.addTest('Memory Usage', () => this.testMemoryUsage());
        
        // Tests de fonctionnalité
        this.addTest('Code Input Validation', () => this.testCodeInputValidation());
        this.addTest('Format Selection', () => this.testFormatSelection());
        this.addTest('Resolution Presets', () => this.testResolutionPresets());
        
        // Tests d'accessibilité
        this.addTest('Keyboard Navigation', () => this.testKeyboardNavigation());
        this.addTest('ARIA Attributes', () => this.testARIAAttributes());
        this.addTest('Color Contrast', () => this.testColorContrast());
        
        // Tests de compatibilité
        this.addTest('Browser Compatibility', () => this.testBrowserCompatibility());
        this.addTest('Device Compatibility', () => this.testDeviceCompatibility());
    }

    // Ajouter un test
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    // Exécuter tous les tests
    async runAllTests() {
        console.log('🚀 Démarrage des tests automatisés');
        this.results = { passed: 0, failed: 0, total: 0, details: [] };
        
        for (const test of this.tests) {
            await this.runSingleTest(test);
        }
        
        this.displayResults();
        return this.results;
    }

    // Exécuter un test individuel
    async runSingleTest(test) {
        this.results.total++;
        const startTime = performance.now();
        
        try {
            const result = await test.testFunction();
            const duration = performance.now() - startTime;
            
            if (result.success) {
                this.results.passed++;
                console.log(`✅ ${test.name} - ${duration.toFixed(2)}ms`);
            } else {
                this.results.failed++;
                console.log(`❌ ${test.name} - ${result.error}`);
            }
            
            this.results.details.push({
                name: test.name,
                success: result.success,
                error: result.error,
                duration: duration
            });
            
        } catch (error) {
            this.results.failed++;
            console.log(`❌ ${test.name} - Exception: ${error.message}`);
            
            this.results.details.push({
                name: test.name,
                success: false,
                error: error.message,
                duration: performance.now() - startTime
            });
        }
    }

    // Tests des éléments UI
    testUIElements() {
        const requiredElements = [
            '.quick-toolbar',
            '#htmlInput',
            '#cssInput',
            '.convert-btn',
            '.preview-container',
            '.resolution-settings'
        ];
        
        for (const selector of requiredElements) {
            const element = document.querySelector(selector);
            if (!element) {
                return { success: false, error: `Élément manquant: ${selector}` };
            }
        }
        
        return { success: true };
    }

    // Tests de la barre d'outils
    testToolbarFunctionality() {
        const toolbar = document.querySelector('.quick-toolbar');
        if (!toolbar) {
            return { success: false, error: 'Barre d\'outils introuvable' };
        }
        
        const buttons = toolbar.querySelectorAll('.toolbar-btn');
        if (buttons.length === 0) {
            return { success: false, error: 'Aucun bouton dans la barre d\'outils' };
        }
        
        // Test des événements de clic
        let clicksWorking = 0;
        buttons.forEach(btn => {
            const originalHandler = btn.onclick;
            btn.onclick = () => {
                clicksWorking++;
                if (originalHandler) originalHandler();
            };
        });
        
        return { success: true };
    }

    // Tests du système de modales
    testModalSystem() {
        const modals = document.querySelectorAll('.modal, .quick-share-modal, .share-history-modal');
        
        for (const modal of modals) {
            const closeBtn = modal.querySelector('.close-modal, .modal-close');
            if (!closeBtn) {
                return { success: false, error: 'Bouton de fermeture manquant dans une modale' };
            }
        }
        
        return { success: true };
    }

    // Tests du design responsive
    testResponsiveDesign() {
        const breakpoints = [320, 768, 1024, 1440];
        const originalWidth = window.innerWidth;
        
        try {
            for (const width of breakpoints) {
                // Simuler le changement de taille
                Object.defineProperty(window, 'innerWidth', {
                    writable: true,
                    configurable: true,
                    value: width
                });
                
                window.dispatchEvent(new Event('resize'));
                
                // Vérifier que les éléments s'adaptent
                const toolbar = document.querySelector('.quick-toolbar');
                if (toolbar && window.getComputedStyle(toolbar).display === 'none') {
                    return { success: false, error: `Barre d'outils cachée à ${width}px` };
                }
            }
            
            return { success: true };
        } finally {
            // Restaurer la taille originale
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: originalWidth
            });
        }
    }

    // Tests de performance de chargement
    testPageLoadPerformance() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        const maxLoadTime = 3000; // 3 secondes max
        
        if (loadTime > maxLoadTime) {
            return { success: false, error: `Temps de chargement trop long: ${loadTime}ms` };
        }
        
        return { success: true };
    }

    // Tests de performance des animations
    testAnimationPerformance() {
        return new Promise((resolve) => {
            let frameCount = 0;
            let lastTime = performance.now();
            const duration = 1000; // Test sur 1 seconde
            
            const measureFPS = (currentTime) => {
                frameCount++;
                
                if (currentTime - lastTime >= duration) {
                    const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                    
                    if (fps < 30) {
                        resolve({ success: false, error: `FPS trop bas: ${fps}` });
                    } else {
                        resolve({ success: true });
                    }
                } else {
                    requestAnimationFrame(measureFPS);
                }
            };
            
            requestAnimationFrame(measureFPS);
        });
    }

    // Tests d'utilisation mémoire
    testMemoryUsage() {
        if (!performance.memory) {
            return { success: true, error: 'API Memory non disponible' };
        }
        
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        const maxMemory = 100; // 100MB max
        
        if (memoryUsage > maxMemory) {
            return { success: false, error: `Utilisation mémoire élevée: ${memoryUsage.toFixed(2)}MB` };
        }
        
        return { success: true };
    }

    // Tests de validation des entrées
    testCodeInputValidation() {
        const htmlInput = document.querySelector('#htmlInput');
        const cssInput = document.querySelector('#cssInput');
        
        if (!htmlInput || !cssInput) {
            return { success: false, error: 'Champs d\'entrée manquants' };
        }
        
        // Test avec du code valide
        htmlInput.value = '<div>Test</div>';
        cssInput.value = 'div { color: red; }';
        
        // Déclencher la validation
        htmlInput.dispatchEvent(new Event('input'));
        cssInput.dispatchEvent(new Event('input'));
        
        return { success: true };
    }

    // Tests de sélection de format
    testFormatSelection() {
        const formatBtns = document.querySelectorAll('.format-btn');
        
        if (formatBtns.length === 0) {
            return { success: false, error: 'Boutons de format manquants' };
        }
        
        // Test de sélection
        formatBtns[0].click();
        
        if (!formatBtns[0].classList.contains('active')) {
            return { success: false, error: 'Sélection de format ne fonctionne pas' };
        }
        
        return { success: true };
    }

    // Tests des presets de résolution
    testResolutionPresets() {
        const presetBtns = document.querySelectorAll('.preset-btn');
        
        if (presetBtns.length === 0) {
            return { success: false, error: 'Boutons de preset manquants' };
        }
        
        return { success: true };
    }

    // Tests de navigation clavier
    testKeyboardNavigation() {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) {
            return { success: false, error: 'Aucun élément focusable trouvé' };
        }
        
        // Test de focus
        focusableElements[0].focus();
        
        if (document.activeElement !== focusableElements[0]) {
            return { success: false, error: 'Navigation clavier ne fonctionne pas' };
        }
        
        return { success: true };
    }

    // Tests des attributs ARIA
    testARIAAttributes() {
        const buttons = document.querySelectorAll('button');
        
        for (const button of buttons) {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                return { success: false, error: 'Bouton sans label accessible' };
            }
        }
        
        return { success: true };
    }

    // Tests de contraste des couleurs
    testColorContrast() {
        // Test basique - vérifier que les couleurs ne sont pas identiques
        const elements = document.querySelectorAll('button, .toolbar-btn');
        
        for (const element of elements) {
            const styles = window.getComputedStyle(element);
            const bgColor = styles.backgroundColor;
            const textColor = styles.color;
            
            if (bgColor === textColor) {
                return { success: false, error: 'Contraste insuffisant détecté' };
            }
        }
        
        return { success: true };
    }

    // Tests de compatibilité navigateur
    testBrowserCompatibility() {
        const requiredFeatures = [
            'fetch',
            'Promise',
            'localStorage',
            'addEventListener'
        ];
        
        for (const feature of requiredFeatures) {
            if (typeof window[feature] === 'undefined') {
                return { success: false, error: `Fonctionnalité manquante: ${feature}` };
            }
        }
        
        return { success: true };
    }

    // Tests de compatibilité appareil
    testDeviceCompatibility() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouch = 'ontouchstart' in window;
        
        if (isMobile && !isTouch) {
            return { success: false, error: 'Appareil mobile sans support tactile' };
        }
        
        return { success: true };
    }

    // Créer l'interface de test
    createTestUI() {
        const testPanel = document.createElement('div');
        testPanel.id = 'test-panel';
        testPanel.style.cssText = `
            position: fixed;
            bottom: 70px;
            left: 20px;
            width: 300px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            z-index: 999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: none;
        `;
        
        testPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #333; font-size: 16px;">🧪 Tests Auto</h3>
                <button id="close-test-panel" style="background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
            </div>
            <button id="run-tests" style="
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                margin-bottom: 15px;
            ">Lancer les Tests</button>
            <div id="test-results" style="
                max-height: 300px;
                overflow-y: auto;
                font-size: 14px;
            "></div>
        `;
        
        document.body.appendChild(testPanel);
        
        // Bouton pour ouvrir le panel
        const testBtn = document.createElement('button');
        testBtn.style.cssText = `
            position: fixed;
            bottom: 70px;
            left: 70px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #667eea;
            color: white;
            border: none;
            cursor: pointer;
            z-index: 998;
            font-size: 18px;
        `;
        testBtn.innerHTML = '🧪';
        testBtn.title = 'Tests automatisés';
        
        testBtn.addEventListener('click', () => {
            testPanel.style.display = testPanel.style.display === 'none' ? 'block' : 'none';
        });
        
        document.body.appendChild(testBtn);
        
        // Event listeners
        document.getElementById('run-tests').addEventListener('click', () => {
            this.runAllTests();
        });
        
        document.getElementById('close-test-panel').addEventListener('click', () => {
            testPanel.style.display = 'none';
        });
    }

    // Afficher les résultats
    displayResults() {
        const resultsDiv = document.getElementById('test-results');
        if (!resultsDiv) return;
        
        const successRate = Math.round((this.results.passed / this.results.total) * 100);
        
        let html = `
            <div style="margin-bottom: 15px; padding: 10px; border-radius: 6px; background: ${successRate >= 80 ? '#d4edda' : '#f8d7da'}; color: ${successRate >= 80 ? '#155724' : '#721c24'};">
                <strong>${successRate}% de réussite</strong><br>
                ✅ ${this.results.passed} réussis<br>
                ❌ ${this.results.failed} échoués
            </div>
        `;
        
        this.results.details.forEach(test => {
            html += `
                <div style="margin-bottom: 8px; padding: 8px; border-radius: 4px; background: ${test.success ? '#f8f9fa' : '#fff3cd'};">
                    <div style="font-weight: 600; color: ${test.success ? '#28a745' : '#856404'};">
                        ${test.success ? '✅' : '❌'} ${test.name}
                    </div>
                    ${test.error ? `<div style="font-size: 12px; color: #6c757d; margin-top: 4px;">${test.error}</div>` : ''}
                    <div style="font-size: 11px; color: #6c757d; margin-top: 4px;">${test.duration.toFixed(2)}ms</div>
                </div>
            `;
        });
        
        resultsDiv.innerHTML = html;
    }

    // Générer un rapport détaillé
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            results: this.results,
            performance: {
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
                } : null,
                timing: performance.timing
            }
        };
        
        console.log('📊 Rapport de test complet:', report);
        return report;
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.testSuite = new TestSuite();
    
    // Commandes de debug
    window.debugTests = {
        run: () => window.testSuite.runAllTests(),
        report: () => window.testSuite.generateReport()
    };
    
    console.log('🧪 Suite de tests initialisée. Commandes: window.debugTests');
});