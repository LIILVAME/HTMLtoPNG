// Lazy Loader pour optimiser le chargement des ressources
// Amélioration Performance - Phase 1

class LazyLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
        this.observers = new Map();
        this.loadQueue = [];
        this.isProcessing = false;
        
        // Configuration
        this.config = {
            intersectionThreshold: 0.1,
            rootMargin: '50px',
            batchSize: 3,
            delay: 100
        };
        
        this.initializeIntersectionObserver();
    }

    // Initialiser l'Intersection Observer pour le lazy loading visuel
    initializeIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    threshold: this.config.intersectionThreshold,
                    rootMargin: this.config.rootMargin
                }
            );
        }
    }

    // Gérer les intersections pour le lazy loading visuel
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const loadAction = element.dataset.lazyLoad;
                
                if (loadAction) {
                    this.executeLoadAction(loadAction, element);
                    this.intersectionObserver.unobserve(element);
                }
            }
        });
    }

    // Exécuter une action de chargement
    async executeLoadAction(action, element) {
        try {
            switch (action) {
                case 'templates':
                    await this.loadTemplates(element);
                    break;
                case 'presets':
                    await this.loadPresets(element);
                    break;
                case 'advanced-features':
                    await this.loadAdvancedFeatures(element);
                    break;
                default:
                    console.warn(`Unknown lazy load action: ${action}`);
            }
        } catch (error) {
            console.error(`Lazy load error for ${action}:`, error);
        }
    }

    // Charger les templates de manière lazy
    async loadTemplates(container) {
        if (this.loadedModules.has('templates')) {
            return;
        }

        console.log('🔄 Lazy loading templates...');
        
        try {
            // Simuler le chargement des templates depuis une source externe
            const templates = await this.fetchTemplates();
            
            // Créer les éléments de template
            templates.forEach(template => {
                const templateElement = this.createTemplateElement(template);
                container.appendChild(templateElement);
            });
            
            this.loadedModules.add('templates');
            console.log('✅ Templates loaded successfully');
            
            // Déclencher un événement personnalisé
            this.dispatchLoadEvent('templatesLoaded', { count: templates.length });
            
        } catch (error) {
            console.error('❌ Failed to load templates:', error);
            this.showLoadError(container, 'templates');
        }
    }

    // Charger les presets de manière lazy
    async loadPresets(container) {
        if (this.loadedModules.has('presets')) {
            return;
        }

        console.log('🔄 Lazy loading presets...');
        
        try {
            const presets = await this.fetchPresets();
            
            // Créer les éléments de preset
            presets.forEach(preset => {
                const presetElement = this.createPresetElement(preset);
                container.appendChild(presetElement);
            });
            
            this.loadedModules.add('presets');
            console.log('✅ Presets loaded successfully');
            
            this.dispatchLoadEvent('presetsLoaded', { count: presets.length });
            
        } catch (error) {
            console.error('❌ Failed to load presets:', error);
            this.showLoadError(container, 'presets');
        }
    }

    // Charger les fonctionnalités avancées
    async loadAdvancedFeatures(container) {
        if (this.loadedModules.has('advanced-features')) {
            return;
        }

        console.log('🔄 Lazy loading advanced features...');
        
        try {
            // Charger les modules avancés
            await Promise.all([
                this.loadModule('color-picker'),
                this.loadModule('gradient-generator'),
                this.loadModule('animation-controls')
            ]);
            
            this.loadedModules.add('advanced-features');
            console.log('✅ Advanced features loaded successfully');
            
            this.dispatchLoadEvent('advancedFeaturesLoaded');
            
        } catch (error) {
            console.error('❌ Failed to load advanced features:', error);
            this.showLoadError(container, 'advanced-features');
        }
    }

    // Récupérer les templates (simulation)
    async fetchTemplates() {
        // Simuler un délai de réseau
        await this.delay(500);
        
        return [
            {
                id: 'blog-post',
                name: 'Article de Blog',
                category: 'content',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJsb2cgUG9zdDwvdGV4dD48L3N2Zz4=',
                html: '<article><h1>Mon Article</h1><p>Contenu de l\'article...</p></article>',
                css: 'article { padding: 20px; font-family: Arial; }'
            },
            {
                id: 'product-card',
                name: 'Carte Produit',
                category: 'ecommerce',
                preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTNmMmZkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2R1Y3Q8L3RleHQ+PC9zdmc+',
                html: '<div class="product"><h2>Produit</h2><p class="price">29.99€</p></div>',
                css: '.product { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }'
            }
        ];
    }

    // Récupérer les presets (simulation)
    async fetchPresets() {
        await this.delay(300);
        
        return [
            {
                id: 'instagram-story',
                name: 'Instagram Story',
                width: 1080,
                height: 1920,
                category: 'social'
            },
            {
                id: 'twitter-card',
                name: 'Twitter Card',
                width: 1200,
                height: 630,
                category: 'social'
            },
            {
                id: 'linkedin-post',
                name: 'LinkedIn Post',
                width: 1200,
                height: 1200,
                category: 'social'
            }
        ];
    }

    // Créer un élément de template
    createTemplateElement(template) {
        const element = document.createElement('div');
        element.className = 'template-item lazy-loaded';
        element.dataset.templateId = template.id;
        
        element.innerHTML = `
            <div class="template-preview">
                <img src="${template.preview}" alt="${template.name}" loading="lazy">
            </div>
            <div class="template-info">
                <h4>${template.name}</h4>
                <span class="template-category">${template.category}</span>
            </div>
            <button class="template-apply-btn" onclick="applyTemplate('${template.id}')">
                <i class="fas fa-plus"></i> Utiliser
            </button>
        `;
        
        // Animation d'apparition
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
        
        return element;
    }

    // Créer un élément de preset
    createPresetElement(preset) {
        const element = document.createElement('button');
        element.className = 'preset-btn lazy-loaded';
        element.dataset.preset = preset.id;
        
        element.innerHTML = `
            <div class="preset-info">
                <span class="preset-name">${preset.name}</span>
                <span class="preset-dimensions">${preset.width}×${preset.height}</span>
            </div>
            <i class="fas fa-mobile-alt"></i>
        `;
        
        // Animation d'apparition
        element.style.opacity = '0';
        element.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.2s ease';
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }, 150);
        
        return element;
    }

    // Charger un module spécifique
    async loadModule(moduleName) {
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }
        
        const promise = this.doLoadModule(moduleName);
        this.loadingPromises.set(moduleName, promise);
        
        try {
            const result = await promise;
            this.loadedModules.add(moduleName);
            return result;
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            throw error;
        }
    }

    // Effectuer le chargement d'un module
    async doLoadModule(moduleName) {
        console.log(`📦 Loading module: ${moduleName}`);
        
        // Simuler le chargement d'un module
        await this.delay(200);
        
        switch (moduleName) {
            case 'color-picker':
                return this.initializeColorPicker();
            case 'gradient-generator':
                return this.initializeGradientGenerator();
            case 'animation-controls':
                return this.initializeAnimationControls();
            default:
                throw new Error(`Unknown module: ${moduleName}`);
        }
    }

    // Initialiser le sélecteur de couleur
    initializeColorPicker() {
        console.log('🎨 Color picker initialized');
        return { module: 'color-picker', status: 'loaded' };
    }

    // Initialiser le générateur de dégradé
    initializeGradientGenerator() {
        console.log('🌈 Gradient generator initialized');
        return { module: 'gradient-generator', status: 'loaded' };
    }

    // Initialiser les contrôles d'animation
    initializeAnimationControls() {
        console.log('🎬 Animation controls initialized');
        return { module: 'animation-controls', status: 'loaded' };
    }

    // Observer un élément pour le lazy loading
    observe(element) {
        if (this.intersectionObserver && element) {
            this.intersectionObserver.observe(element);
        }
    }

    // Arrêter d'observer un élément
    unobserve(element) {
        if (this.intersectionObserver && element) {
            this.intersectionObserver.unobserve(element);
        }
    }

    // Précharger des ressources critiques
    async preloadCritical(resources) {
        console.log(`🚀 Preloading ${resources.length} critical resources`);
        
        const promises = resources.map(resource => 
            this.loadModule(resource).catch(error => {
                console.warn(`Failed to preload ${resource}:`, error);
                return null;
            })
        );
        
        const results = await Promise.allSettled(promises);
        const loaded = results.filter(r => r.status === 'fulfilled').length;
        
        console.log(`✅ Preloaded ${loaded}/${resources.length} critical resources`);
        return results;
    }

    // Afficher une erreur de chargement
    showLoadError(container, type) {
        const errorElement = document.createElement('div');
        errorElement.className = 'lazy-load-error';
        errorElement.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erreur de chargement des ${type}</p>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-redo"></i> Réessayer
                </button>
            </div>
        `;
        
        container.appendChild(errorElement);
    }

    // Déclencher un événement de chargement
    dispatchLoadEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: {
                timestamp: Date.now(),
                loader: this,
                ...detail
            }
        });
        
        document.dispatchEvent(event);
    }

    // Utilitaire pour créer un délai
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Obtenir les statistiques de chargement
    getStats() {
        return {
            loadedModules: Array.from(this.loadedModules),
            loadingPromises: Array.from(this.loadingPromises.keys()),
            observedElements: this.intersectionObserver ? 
                this.intersectionObserver.takeRecords().length : 0
        };
    }

    // Nettoyer les ressources
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        this.loadedModules.clear();
        this.loadingPromises.clear();
        this.observers.clear();
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
} else if (typeof window !== 'undefined') {
    window.LazyLoader = LazyLoader;
}