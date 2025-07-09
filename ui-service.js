/**
 * UI Service - Centralise la gestion de l'interface utilisateur
 * Gère les thèmes, les raccourcis clavier, l'onboarding et l'auto-sauvegarde
 */
class UIService {
    constructor(eventManager, stateManager) {
        this.events = eventManager;
        this.state = stateManager;
        this.autoSaveInterval = null;
        this.lastGeneratedImage = null;
        
        this.init();
    }

    init() {
        this.initializeTheme();
        this.setupKeyboardShortcuts();
        this.setupAutoSave();
        this.initializeOnboarding();
    }

    // ==================== THEME MANAGEMENT ====================
    
    /**
     * Initialise le thème depuis le localStorage
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('htmltopng-theme') || 'light';
        this.setTheme(savedTheme);
    }

    /**
     * Bascule entre les thèmes clair et sombre
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Émettre un événement pour notifier le changement de thème
        this.events.emit('theme:changed', { theme: newTheme });
    }

    /**
     * Applique un thème spécifique
     * @param {string} theme - 'light' ou 'dark'
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('htmltopng-theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        // Mettre à jour l'état seulement si disponible
        if (this.state && typeof this.state.set === 'function') {
            try {
                this.state.set('ui.theme', theme);
            } catch (error) {
                console.warn('Erreur lors de la mise à jour du thème dans l\'état:', error);
            }
        }
    }

    /**
     * Retourne le thème actuel
     * @returns {string} Le thème actuel
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    // ==================== KEYBOARD SHORTCUTS ====================
    
    /**
     * Configure les raccourcis clavier globaux
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter pour convertir
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.events.emit('conversion:start');
            }
            
            // Ctrl/Cmd + S pour sauvegarder/télécharger
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.lastGeneratedImage) {
                    this.events.emit('image:download');
                }
            }
            
            // Ctrl/Cmd + R pour rafraîchir la prévisualisation
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.events.emit('preview:refresh');
            }
            
            // F11 pour agrandir la prévisualisation
            if (e.key === 'F11') {
                e.preventDefault();
                this.events.emit('preview:expand');
            }
            
            // Ctrl/Cmd + D pour basculer le thème
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    // ==================== AUTO-SAVE ====================
    
    /**
     * Configure la sauvegarde automatique
     */
    setupAutoSave() {
        // Sauvegarder toutes les 30 secondes
        this.autoSaveInterval = setInterval(() => {
            this.saveToLocalStorage();
        }, 30000);
        
        // Charger le contenu sauvegardé à l'initialisation
        this.loadFromLocalStorage();
        
        // Sauvegarder avant de quitter la page
        window.addEventListener('beforeunload', () => {
            this.saveToLocalStorage();
        });
    }

    /**
     * Sauvegarde le contenu actuel dans le localStorage
     */
    saveToLocalStorage() {
        const htmlInput = document.getElementById('htmlInput');
        const cssInput = document.getElementById('cssInput');
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        
        if (!htmlInput || !cssInput || !widthInput || !heightInput) {
            return;
        }
        
        const saveData = {
            html: htmlInput.value,
            css: cssInput.value,
            width: widthInput.value,
            height: heightInput.value,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('htmltopng-autosave', JSON.stringify(saveData));
            this.events.emit('autosave:completed', saveData);
        } catch (error) {
            console.warn('Échec de la sauvegarde automatique:', error);
            this.events.emit('autosave:failed', error);
        }
    }

    /**
     * Charge le contenu sauvegardé depuis le localStorage
     */
    loadFromLocalStorage() {
        const savedData = localStorage.getItem('htmltopng-autosave');
        if (!savedData) return;
        
        try {
            const data = JSON.parse(savedData);
            
            // Ne charger que si sauvegardé dans les dernières 24 heures
            if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                const htmlInput = document.getElementById('htmlInput');
                const cssInput = document.getElementById('cssInput');
                const widthInput = document.getElementById('widthInput');
                const heightInput = document.getElementById('heightInput');
                
                if (htmlInput) htmlInput.value = data.html || '';
                if (cssInput) cssInput.value = data.css || '';
                if (widthInput) widthInput.value = data.width || '800';
                if (heightInput) heightInput.value = data.height || '600';
                
                // Mettre à jour la prévisualisation si du contenu existe
                if (data.html || data.css) {
                    setTimeout(() => {
                        this.events.emit('preview:update');
                    }, 500);
                }
                
                this.events.emit('autosave:loaded', data);
            }
        } catch (error) {
            console.warn('Échec du chargement des données sauvegardées:', error);
        }
    }

    /**
     * Nettoie l'intervalle de sauvegarde automatique
     */
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // ==================== ONBOARDING SYSTEM ====================
    
    /**
     * Initialise le système d'onboarding
     */
    initializeOnboarding() {
        const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
        
        if (!hasCompletedOnboarding) {
            // Attendre que le DOM soit prêt
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.showOnboarding();
                });
            } else {
                this.showOnboarding();
            }
        }
    }

    /**
     * Affiche l'onboarding
     */
    showOnboarding() {
        const overlay = document.getElementById('onboardingOverlay');
        if (!overlay) return;

        overlay.style.display = 'flex';
        
        const steps = [
            {
                icon: '🎨',
                title: 'Bienvenue dans HTML to PNG',
                description: 'Convertissez facilement votre code HTML/CSS en images de haute qualité'
            },
            {
                icon: '⚡',
                title: 'Aperçu en temps réel',
                description: 'Voyez vos modifications instantanément avec notre système de prévisualisation'
            },
            {
                icon: '📱',
                title: 'Formats optimisés',
                description: 'Choisissez parmi des presets pour réseaux sociaux, mobiles et plus encore'
            }
        ];

        let currentStep = 0;
        this.renderOnboardingStep(steps[currentStep], currentStep, steps.length);

        // Gérer la navigation
        const nextBtn = document.getElementById('onboardingNext');
        const skipBtn = document.getElementById('onboardingSkip');
        const prevBtn = document.getElementById('onboardingPrev');

        const showStep = (stepIndex) => {
            if (stepIndex >= steps.length) {
                this.completeOnboarding();
                return;
            }
            currentStep = stepIndex;
            this.renderOnboardingStep(steps[currentStep], currentStep, steps.length);
        };

        if (nextBtn) nextBtn.onclick = () => showStep(currentStep + 1);
        if (skipBtn) skipBtn.onclick = () => this.completeOnboarding();
        if (prevBtn) {
            prevBtn.onclick = () => {
                if (currentStep > 0) showStep(currentStep - 1);
            };
        }
    }

    /**
     * Affiche une étape spécifique de l'onboarding
     */
    renderOnboardingStep(step, index, total) {
        const stepContent = document.querySelector('.onboarding-step');
        const indicators = document.querySelector('.step-indicators');
        const prevBtn = document.getElementById('onboardingPrev');
        const nextBtn = document.getElementById('onboardingNext');

        if (!stepContent || !indicators) return;

        // Mettre à jour le contenu de l'étape
        stepContent.innerHTML = `
            <div class="step-icon">${step.icon}</div>
            <h3>${step.title}</h3>
            <p>${step.description}</p>
        `;

        // Mettre à jour les indicateurs
        indicators.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('div');
            dot.className = `step-dot ${i === index ? 'active' : ''}`;
            indicators.appendChild(dot);
        }

        // Mettre à jour l'état des boutons
        if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
        if (nextBtn) nextBtn.textContent = index === total - 1 ? 'Commencer' : 'Suivant';
    }

    /**
     * Termine l'onboarding
     */
    completeOnboarding() {
        const overlay = document.getElementById('onboardingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        localStorage.setItem('onboarding_completed', 'true');
        this.events.emit('onboarding:completed');
    }

    /**
     * Réinitialise l'onboarding (pour les tests)
     */
    resetOnboarding() {
        localStorage.removeItem('onboarding_completed');
        this.events.emit('onboarding:reset');
    }

    // ==================== UTILITY METHODS ====================
    
    /**
     * Met à jour la référence de la dernière image générée
     * @param {string|Blob} image - L'image générée
     */
    setLastGeneratedImage(image) {
        this.lastGeneratedImage = image;
    }

    /**
     * Affiche une notification toast
     * @param {string} message - Le message à afficher
     * @param {string} type - Le type de notification ('success', 'error', 'info')
     */
    showToast(message, type = 'info') {
        this.events.emit('notification:show', { message, type });
    }

    /**
     * Affiche/masque un indicateur de chargement
     * @param {boolean} show - Afficher ou masquer
     * @param {string} message - Message optionnel
     */
    showLoading(show, message = '') {
        this.events.emit('loading:toggle', { show, message });
    }
}

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIService;
}