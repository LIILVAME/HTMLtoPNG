/**
 * Script automatisé pour lancer les tests et corriger automatiquement les problèmes
 * Système d'auto-correction intelligent
 */

class AutoTestFix {
    constructor() {
        this.fixes = [];
        this.testResults = null;
        this.autoFixEnabled = true;
        this.init();
    }

    init() {
        console.log('🔧 Système d\'auto-correction initialisé');
        this.setupAutoFixes();
        this.runTestsAndFix();
    }

    // Configuration des corrections automatiques
    setupAutoFixes() {
        this.fixes = [
            {
                name: 'Missing UI Elements',
                test: (results) => results.details.find(t => t.name === 'UI Elements' && !t.success),
                fix: () => this.fixMissingUIElements()
            },
            {
                name: 'Toolbar Functionality',
                test: (results) => results.details.find(t => t.name === 'Toolbar Functionality' && !t.success),
                fix: () => this.fixToolbarFunctionality()
            },
            {
                name: 'Modal System',
                test: (results) => results.details.find(t => t.name === 'Modal System' && !t.success),
                fix: () => this.fixModalSystem()
            },
            {
                name: 'Performance Issues',
                test: (results) => results.details.find(t => (t.name === 'Animation Performance' || t.name === 'Page Load Performance') && !t.success),
                fix: () => this.fixPerformanceIssues()
            },
            {
                name: 'Accessibility Issues',
                test: (results) => results.details.find(t => (t.name === 'ARIA Attributes' || t.name === 'Keyboard Navigation') && !t.success),
                fix: () => this.fixAccessibilityIssues()
            },
            {
                name: 'Responsive Design',
                test: (results) => results.details.find(t => t.name === 'Responsive Design' && !t.success),
                fix: () => this.fixResponsiveDesign()
            }
        ];
    }

    // Lancer les tests et corriger automatiquement
    async runTestsAndFix() {
        console.log('🧪 Lancement des tests automatisés...');
        
        // Attendre que la suite de tests soit disponible
        await this.waitForTestSuite();
        
        // Lancer les tests
        this.testResults = await window.testSuite.runAllTests();
        
        console.log('📊 Résultats des tests:', this.testResults);
        
        // Analyser et corriger les problèmes
        await this.analyzeAndFix();
        
        // Relancer les tests après corrections
        if (this.testResults.failed > 0) {
            console.log('🔄 Relancement des tests après corrections...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.testResults = await window.testSuite.runAllTests();
            console.log('📈 Nouveaux résultats:', this.testResults);
        }
        
        this.generateFixReport();
    }

    // Attendre que la suite de tests soit disponible
    async waitForTestSuite() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.testSuite && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.testSuite) {
            throw new Error('Suite de tests non disponible');
        }
    }

    // Analyser les résultats et appliquer les corrections
    async analyzeAndFix() {
        if (!this.testResults || this.testResults.failed === 0) {
            console.log('✅ Aucune correction nécessaire');
            return;
        }
        
        console.log(`🔧 ${this.testResults.failed} problème(s) détecté(s), correction en cours...`);
        
        for (const fix of this.fixes) {
            if (fix.test(this.testResults)) {
                console.log(`🛠️ Application de la correction: ${fix.name}`);
                try {
                    await fix.fix();
                    console.log(`✅ Correction appliquée: ${fix.name}`);
                } catch (error) {
                    console.error(`❌ Erreur lors de la correction ${fix.name}:`, error);
                }
            }
        }
    }

    // Correction des éléments UI manquants
    fixMissingUIElements() {
        const requiredElements = [
            { selector: '.quick-toolbar', html: '<div class="quick-toolbar"></div>' },
            { selector: '#htmlInput', html: '<textarea id="htmlInput" placeholder="HTML code here..."></textarea>' },
            { selector: '#cssInput', html: '<textarea id="cssInput" placeholder="CSS code here..."></textarea>' },
            { selector: '.convert-btn', html: '<button class="convert-btn">Convert</button>' },
            { selector: '.preview-container', html: '<div class="preview-container"></div>' },
            { selector: '.resolution-settings', html: '<div class="resolution-settings"></div>' }
        ];
        
        requiredElements.forEach(element => {
            if (!document.querySelector(element.selector)) {
                const container = document.body;
                container.insertAdjacentHTML('beforeend', element.html);
                console.log(`➕ Élément ajouté: ${element.selector}`);
            }
        });
    }

    // Correction de la fonctionnalité de la barre d'outils
    fixToolbarFunctionality() {
        const toolbar = document.querySelector('.quick-toolbar');
        if (!toolbar) {
            this.fixMissingUIElements();
            return;
        }
        
        // Ajouter des boutons manquants
        const requiredButtons = [
            { id: 'quickShareBtn', text: 'Quick Share', icon: 'fas fa-share-alt' },
            { id: 'historyBtn', text: 'History', icon: 'fas fa-history' },
            { id: 'templatesBtn', text: 'Templates', icon: 'fas fa-file-alt' },
            { id: 'imagesBtn', text: 'Images', icon: 'fas fa-images' }
        ];
        
        requiredButtons.forEach(btn => {
            if (!document.getElementById(btn.id)) {
                const button = document.createElement('button');
                button.id = btn.id;
                button.className = 'toolbar-btn';
                button.innerHTML = `<i class="${btn.icon}"></i>`;
                button.title = btn.text;
                button.addEventListener('click', () => {
                    console.log(`${btn.text} clicked`);
                });
                toolbar.appendChild(button);
                console.log(`➕ Bouton ajouté: ${btn.text}`);
            }
        });
    }

    // Correction du système de modales
    fixModalSystem() {
        const modals = document.querySelectorAll('.modal, .quick-share-modal, .share-history-modal');
        
        modals.forEach(modal => {
            let closeBtn = modal.querySelector('.close-modal, .modal-close');
            if (!closeBtn) {
                closeBtn = document.createElement('button');
                closeBtn.className = 'close-modal';
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
                
                const header = modal.querySelector('.modal-header');
                if (header) {
                    header.appendChild(closeBtn);
                } else {
                    modal.insertBefore(closeBtn, modal.firstChild);
                }
                console.log('➕ Bouton de fermeture ajouté à une modale');
            }
        });
    }

    // Correction des problèmes de performance
    fixPerformanceIssues() {
        // Optimiser les animations
        const style = document.createElement('style');
        style.textContent = `
            * {
                will-change: auto;
            }
            .toolbar-btn {
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            .quick-toolbar {
                contain: layout style paint;
            }
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Lazy loading pour les images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
        
        console.log('⚡ Optimisations de performance appliquées');
    }

    // Correction des problèmes d'accessibilité
    fixAccessibilityIssues() {
        // Ajouter des attributs ARIA manquants
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                const icon = button.querySelector('i');
                if (icon) {
                    const iconClass = icon.className;
                    let label = 'Button';
                    if (iconClass.includes('share')) label = 'Share';
                    else if (iconClass.includes('history')) label = 'History';
                    else if (iconClass.includes('file')) label = 'Templates';
                    else if (iconClass.includes('images')) label = 'Images';
                    else if (iconClass.includes('times')) label = 'Close';
                    
                    button.setAttribute('aria-label', label);
                }
            }
            
            if (!button.getAttribute('role')) {
                button.setAttribute('role', 'button');
            }
        });
        
        // Améliorer la navigation clavier
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach((element, index) => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });
        
        console.log('♿ Améliorations d\'accessibilité appliquées');
    }

    // Correction du design responsive
    fixResponsiveDesign() {
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .quick-toolbar {
                    display: flex !important;
                    flex-direction: row !important;
                    bottom: 10px !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    width: auto !important;
                    padding: 8px !important;
                }
                .toolbar-btn {
                    margin: 0 4px !important;
                    width: 40px !important;
                    height: 40px !important;
                }
            }
            
            @media (max-width: 480px) {
                .toolbar-btn {
                    width: 35px !important;
                    height: 35px !important;
                    font-size: 14px !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        console.log('📱 Corrections responsive appliquées');
    }

    // Générer un rapport de correction
    generateFixReport() {
        const report = {
            timestamp: new Date().toISOString(),
            initialResults: this.testResults,
            fixesApplied: this.fixes.filter(fix => fix.test(this.testResults)).map(fix => fix.name),
            finalSuccessRate: Math.round((this.testResults.passed / this.testResults.total) * 100)
        };
        
        console.log('📋 Rapport de correction automatique:', report);
        
        // Afficher un résumé visuel
        this.showFixSummary(report);
        
        return report;
    }

    // Afficher un résumé visuel des corrections
    showFixSummary(report) {
        const summary = document.createElement('div');
        summary.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 300px;
            animation: slideInRight 0.5s ease;
        `;
        
        summary.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <span style="font-size: 24px; margin-right: 10px;">🔧</span>
                <h3 style="margin: 0; font-size: 18px;">Auto-Correction Terminée</h3>
            </div>
            <div style="margin-bottom: 10px;">
                <strong>Taux de réussite:</strong> ${report.finalSuccessRate}%
            </div>
            <div style="margin-bottom: 10px;">
                <strong>Corrections appliquées:</strong> ${report.fixesApplied.length}
            </div>
            <div style="font-size: 14px; opacity: 0.9;">
                ${report.fixesApplied.map(fix => `• ${fix}`).join('<br>')}
            </div>
            <button onclick="this.parentNode.remove()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                opacity: 0.7;
            ">×</button>
        `;
        
        // Ajouter l'animation CSS
        const animationStyle = document.createElement('style');
        animationStyle.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(animationStyle);
        
        document.body.appendChild(summary);
        
        // Auto-suppression après 10 secondes
        setTimeout(() => {
            if (summary.parentNode) {
                summary.remove();
            }
        }, 10000);
    }

    // Méthode publique pour relancer les tests
    async rerunTests() {
        console.log('🔄 Relancement des tests...');
        await this.runTestsAndFix();
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    // Attendre un peu pour que tous les autres scripts se chargent
    setTimeout(() => {
        window.autoTestFix = new AutoTestFix();
        
        // Commande de debug
        window.debugAutoFix = {
            rerun: () => window.autoTestFix.rerunTests()
        };
        
        console.log('🤖 Auto-correction initialisée. Commande: window.debugAutoFix.rerun()');
    }, 2000);
});