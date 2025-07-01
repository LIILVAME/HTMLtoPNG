/**
 * Système d'amélioration continue pour la barre d'outils rapide
 * Gestion des tests, métriques et optimisations
 */

class ToolbarEnhancementManager {
    constructor() {
        this.metrics = {
            clicks: {},
            hoverTime: {},
            userPreferences: {},
            performanceData: []
        };
        this.testVariants = {
            current: 'enhanced',
            variants: ['basic', 'enhanced', 'premium']
        };
        this.init();
    }

    init() {
        this.setupMetricsTracking();
        this.setupPerformanceMonitoring();
        this.setupUserFeedback();
        this.setupA11yEnhancements();
        this.loadUserPreferences();
        console.log('🚀 Toolbar Enhancement Manager initialisé');
    }

    // Suivi des métriques d'utilisation
    setupMetricsTracking() {
        const toolbarBtns = document.querySelectorAll('.toolbar-btn');
        
        toolbarBtns.forEach(btn => {
            const btnId = btn.id;
            this.metrics.clicks[btnId] = 0;
            this.metrics.hoverTime[btnId] = 0;

            // Suivi des clics
            btn.addEventListener('click', () => {
                this.metrics.clicks[btnId]++;
                this.logMetric('click', btnId);
                this.updateNotificationBadge(btn);
            });

            // Suivi du temps de survol
            let hoverStart;
            btn.addEventListener('mouseenter', () => {
                hoverStart = Date.now();
            });

            btn.addEventListener('mouseleave', () => {
                if (hoverStart) {
                    const hoverDuration = Date.now() - hoverStart;
                    this.metrics.hoverTime[btnId] += hoverDuration;
                    this.logMetric('hover', btnId, hoverDuration);
                }
            });
        });
    }

    // Monitoring des performances
    setupPerformanceMonitoring() {
        // Observer les animations pour détecter les problèmes de performance
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name.includes('toolbar')) {
                    this.metrics.performanceData.push({
                        name: entry.name,
                        duration: entry.duration,
                        timestamp: Date.now()
                    });
                }
            }
        });
        
        observer.observe({ entryTypes: ['measure'] });

        // Test de fluidité des animations
        this.testAnimationPerformance();
    }

    // Test des performances d'animation
    testAnimationPerformance() {
        const toolbar = document.querySelector('.quick-toolbar');
        if (!toolbar) return;

        let frameCount = 0;
        let lastTime = performance.now();

        const measureFPS = (currentTime) => {
            frameCount++;
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.logMetric('fps', 'toolbar', fps);
                
                if (fps < 30) {
                    console.warn('⚠️ Performance dégradée détectée sur la barre d\'outils');
                    this.optimizePerformance();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
    }

    // Optimisation automatique des performances
    optimizePerformance() {
        const toolbar = document.querySelector('.quick-toolbar');
        if (!toolbar) return;

        // Réduire la complexité des animations si nécessaire
        toolbar.style.setProperty('--animation-duration', '0.2s');
        
        // Désactiver le backdrop-filter sur les appareils moins performants
        if (this.isLowPerformanceDevice()) {
            toolbar.style.backdropFilter = 'none';
            toolbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }

        console.log('🔧 Optimisations de performance appliquées');
    }

    // Détection d'appareil peu performant
    isLowPerformanceDevice() {
        return navigator.hardwareConcurrency <= 2 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Système de feedback utilisateur
    setupUserFeedback() {
        // Ajouter un bouton de feedback discret
        const feedbackBtn = document.createElement('button');
        feedbackBtn.className = 'toolbar-feedback-btn';
        feedbackBtn.innerHTML = '<i class="fas fa-comment"></i>';
        feedbackBtn.title = 'Donner votre avis';
        feedbackBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent);
            color: white;
            border: none;
            cursor: pointer;
            z-index: 998;
            opacity: 0.7;
            transition: all 0.3s ease;
        `;

        feedbackBtn.addEventListener('click', () => this.showFeedbackModal());
        document.body.appendChild(feedbackBtn);
    }

    // Modal de feedback
    showFeedbackModal() {
        const modal = document.createElement('div');
        modal.className = 'feedback-modal';
        modal.innerHTML = `
            <div class="feedback-content">
                <h3>Votre avis sur la barre d'outils</h3>
                <div class="rating-stars">
                    ${[1,2,3,4,5].map(i => `<span class="star" data-rating="${i}">⭐</span>`).join('')}
                </div>
                <textarea placeholder="Commentaires (optionnel)" rows="3"></textarea>
                <div class="feedback-actions">
                    <button class="btn-cancel">Annuler</button>
                    <button class="btn-submit">Envoyer</button>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2001;
        `;

        document.body.appendChild(modal);
        this.setupFeedbackHandlers(modal);
    }

    // Gestionnaires du feedback
    setupFeedbackHandlers(modal) {
        const stars = modal.querySelectorAll('.star');
        const textarea = modal.querySelector('textarea');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const submitBtn = modal.querySelector('.btn-submit');
        let selectedRating = 0;

        stars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating);
                stars.forEach((s, i) => {
                    s.style.opacity = i < selectedRating ? '1' : '0.3';
                });
            });
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        submitBtn.addEventListener('click', () => {
            this.submitFeedback(selectedRating, textarea.value);
            document.body.removeChild(modal);
        });
    }

    // Soumission du feedback
    submitFeedback(rating, comment) {
        const feedback = {
            rating,
            comment,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            metrics: this.metrics
        };

        // Stocker localement (en production, envoyer au serveur)
        const existingFeedback = JSON.parse(localStorage.getItem('toolbar_feedback') || '[]');
        existingFeedback.push(feedback);
        localStorage.setItem('toolbar_feedback', JSON.stringify(existingFeedback));

        console.log('📝 Feedback enregistré:', feedback);
        this.showThankYouMessage();
    }

    // Message de remerciement
    showThankYouMessage() {
        const toast = document.createElement('div');
        toast.textContent = 'Merci pour votre retour ! 🙏';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ed573;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 2002;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 3000);
    }

    // Améliorations d'accessibilité
    setupA11yEnhancements() {
        const toolbarBtns = document.querySelectorAll('.toolbar-btn');
        
        toolbarBtns.forEach(btn => {
            // Ajouter des attributs ARIA
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-label', btn.title);
            
            // Support clavier amélioré
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });

        // Indicateur de focus visible
        const style = document.createElement('style');
        style.textContent = `
            .toolbar-btn:focus {
                outline: 3px solid #4A90E2;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    // Mise à jour des badges de notification
    updateNotificationBadge(btn) {
        const badge = btn.querySelector('.notification-badge');
        if (badge) {
            let count = parseInt(badge.textContent) || 0;
            count = Math.max(0, count - 1);
            badge.textContent = count;
            
            if (count === 0) {
                badge.style.display = 'none';
            }
        }
    }

    // Chargement des préférences utilisateur
    loadUserPreferences() {
        const prefs = JSON.parse(localStorage.getItem('toolbar_preferences') || '{}');
        this.metrics.userPreferences = prefs;
        
        // Appliquer les préférences
        if (prefs.position) {
            this.setToolbarPosition(prefs.position);
        }
    }

    // Positionnement de la barre d'outils
    setToolbarPosition(position) {
        const toolbar = document.querySelector('.quick-toolbar');
        if (!toolbar) return;

        switch (position) {
            case 'left':
                toolbar.style.right = 'auto';
                toolbar.style.left = '20px';
                break;
            case 'bottom':
                toolbar.style.top = 'auto';
                toolbar.style.bottom = '20px';
                toolbar.style.flexDirection = 'row';
                break;
            default:
                // Position par défaut (droite)
                break;
        }
    }

    // Logging des métriques
    logMetric(type, element, value = null) {
        const metric = {
            type,
            element,
            value,
            timestamp: Date.now()
        };
        
        console.log(`📊 Métrique: ${type} sur ${element}`, value ? `(${value})` : '');
        
        // En production, envoyer au serveur d'analytics
        // this.sendToAnalytics(metric);
    }

    // Rapport de métriques
    generateReport() {
        const report = {
            clicks: this.metrics.clicks,
            hoverTime: this.metrics.hoverTime,
            performance: this.metrics.performanceData,
            feedback: JSON.parse(localStorage.getItem('toolbar_feedback') || '[]'),
            generatedAt: new Date().toISOString()
        };

        console.log('📈 Rapport d\'utilisation de la barre d\'outils:', report);
        return report;
    }

    // Test A/B des variantes
    runABTest() {
        const variant = this.testVariants.variants[Math.floor(Math.random() * this.testVariants.variants.length)];
        this.applyVariant(variant);
        console.log(`🧪 Test A/B: Variante ${variant} appliquée`);
    }

    // Application d'une variante
    applyVariant(variant) {
        const toolbar = document.querySelector('.quick-toolbar');
        if (!toolbar) return;

        toolbar.className = `quick-toolbar variant-${variant}`;
        
        switch (variant) {
            case 'basic':
                toolbar.style.background = 'rgba(255,255,255,0.9)';
                toolbar.style.backdropFilter = 'none';
                break;
            case 'premium':
                toolbar.style.background = 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(139,92,246,0.1))';
                toolbar.style.border = '2px solid rgba(102,126,234,0.3)';
                break;
            default:
                // Variante enhanced (actuelle)
                break;
        }
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.toolbarEnhancement = new ToolbarEnhancementManager();
    
    // Commandes de debug disponibles dans la console
    window.debugToolbar = {
        report: () => window.toolbarEnhancement.generateReport(),
        test: () => window.toolbarEnhancement.runABTest(),
        feedback: () => window.toolbarEnhancement.showFeedbackModal()
    };
    
    console.log('🔧 Commandes debug disponibles: window.debugToolbar');
});