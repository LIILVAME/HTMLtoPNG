/**
 * Gestionnaire de services centralisé
 * Implémente un pattern Service Locator avec injection de dépendances
 */

class ServiceManager {
    constructor() {
        this.services = new Map();
        this.singletons = new Map();
        this.factories = new Map();
        this.dependencies = new Map();
        this.initializationOrder = [];
        this.initialized = new Set();
        this.debugMode = Config.get('DEV.enableDebugMode', false);
        
        this.registerCoreServices();
    }

    /**
     * Enregistrer les services principaux
     */
    registerCoreServices() {
        // Services de base
        this.register('config', () => Config, { singleton: true });
        this.register('utils', () => Utils, { singleton: true });
        this.register('eventManager', () => new EventManager(), { singleton: true });
        this.register('stateManager', () => stateManager, { singleton: true });
        
        // Services de cache
        this.register('cacheManager', () => new CacheManager(), { 
            singleton: true,
            dependencies: ['config', 'utils']
        });
        
        this.register('apiCache', () => new APICache(), { 
            singleton: true,
            dependencies: ['config', 'utils']
        });
        
        // Services API
        this.register('apiManager', () => new APIManager(), { 
            singleton: true,
            dependencies: ['config', 'apiCache', 'eventManager']
        });
        
        // Services d'analytics
        this.register('userAnalytics', () => new UserAnalytics(), { 
            singleton: true,
            dependencies: ['config', 'utils', 'stateManager']
        });
        
        // Services d'historique
        this.register('historyManager', () => new HistoryManager(), { 
            singleton: true,
            dependencies: ['config', 'utils', 'stateManager']
        });
        
        // Services d'amélioration de la barre d'outils
        this.register('toolbarEnhancement', () => new ToolbarEnhancementManager(), { 
            singleton: true,
            dependencies: ['config', 'userAnalytics', 'stateManager']
        });
        
        // Service Worker
        this.register('serviceWorker', () => this.createServiceWorkerManager(), { 
            singleton: true,
            dependencies: ['config']
        });
        
        // Services de conversion
        this.register('conversionService', () => this.createConversionService(), { 
            singleton: true,
            dependencies: ['apiManager', 'cacheManager', 'stateManager']
        });
        
        // Services d'interface utilisateur
        this.register('uiService', () => new UIService(this.get('eventManager'), this.get('stateManager')), { 
            singleton: true,
            dependencies: ['eventManager', 'stateManager']
        });
        
        // Services de clavier
        this.register('keyboardService', () => new KeyboardService(this.get('eventManager')), { 
            singleton: true,
            dependencies: ['eventManager']
        });
        
        // Services de persistance
        this.register('persistenceService', () => new PersistenceService(this.get('eventManager'), this.get('stateManager')), { 
            singleton: true,
            dependencies: ['eventManager', 'stateManager']
        });
        
        // Services de notification
        this.register('notificationService', () => this.createNotificationService(), { 
            singleton: true,
            dependencies: ['config', 'stateManager']
        });
        
        // Services de performance
        this.register('performanceService', () => this.createPerformanceService(), { 
            singleton: true,
            dependencies: ['config', 'stateManager', 'userAnalytics']
        });
    }

    /**
     * Enregistrer un service
     */
    register(name, factory, options = {}) {
        const serviceConfig = {
            factory,
            singleton: options.singleton || false,
            dependencies: options.dependencies || [],
            lazy: options.lazy !== false, // Par défaut lazy
            initialized: false,
            instance: null
        };
        
        this.services.set(name, serviceConfig);
        
        if (options.dependencies) {
            this.dependencies.set(name, options.dependencies);
        }
        
        if (this.debugMode) {
            console.log(`🔧 Service: Enregistré ${name}`);
        }
        
        return this;
    }

    /**
     * Obtenir un service
     */
    get(name) {
        const serviceConfig = this.services.get(name);
        
        if (!serviceConfig) {
            throw new Error(`Service '${name}' non trouvé`);
        }
        
        // Si c'est un singleton et qu'il existe déjà
        if (serviceConfig.singleton && serviceConfig.instance) {
            return serviceConfig.instance;
        }
        
        // Résoudre les dépendances
        const dependencies = this.resolveDependencies(name);
        
        // Créer l'instance
        let instance;
        try {
            if (typeof serviceConfig.factory === 'function') {
                instance = serviceConfig.factory(...dependencies);
            } else {
                instance = serviceConfig.factory;
            }
        } catch (error) {
            console.error(`Erreur lors de la création du service '${name}':`, error);
            throw error;
        }
        
        // Sauvegarder l'instance si c'est un singleton
        if (serviceConfig.singleton) {
            serviceConfig.instance = instance;
        }
        
        serviceConfig.initialized = true;
        this.initialized.add(name);
        
        if (this.debugMode) {
            console.log(`✅ Service: ${name} initialisé`);
        }
        
        return instance;
    }

    /**
     * Résoudre les dépendances d'un service
     */
    resolveDependencies(serviceName) {
        const dependencies = this.dependencies.get(serviceName) || [];
        const resolved = [];
        
        for (const depName of dependencies) {
            if (!this.services.has(depName)) {
                throw new Error(`Dépendance '${depName}' non trouvée pour le service '${serviceName}'`);
            }
            
            resolved.push(this.get(depName));
        }
        
        return resolved;
    }

    /**
     * Initialiser tous les services non-lazy
     */
    async initializeAll() {
        if (this.debugMode) {
            console.log('🚀 Initialisation de tous les services...');
        }

        const servicesToInitialize = Array.from(this.services.entries())
            .filter(([name, config]) => !config.lazy)
            .map(([name]) => name);

        for (const name of servicesToInitialize) {
            try {
                await this.get(name); // 'get' gère l'initialisation
            } catch (error) {
                console.error(`Erreur lors de l'initialisation du service '${name}':`, error);
                // Gérer l'erreur, peut-être arrêter le processus
            }
        }

        if (this.debugMode) {
            console.log('✅ Tous les services non-lazy ont été initialisés.');
        }

        // Signaler que les services sont prêts
        const event = new CustomEvent('servicesReady');
        document.dispatchEvent(event);

        if (this.debugMode) {
            console.log('📢 Événement servicesReady émis.');
        }
    }
        const nonLazyServices = Array.from(this.services.entries())
            .filter(([name, config]) => !config.lazy)
            .map(([name]) => name);
        
        for (const serviceName of nonLazyServices) {
            try {
                this.get(serviceName);
            } catch (error) {
                console.error(`Erreur lors de l'initialisation du service '${serviceName}':`, error);
            }
        }
        
        if (this.debugMode) {
            console.log('🚀 Services: Initialisation terminée');
        }
    }

    /**
     * Vérifier si un service est initialisé
     */
    isInitialized(name) {
        return this.initialized.has(name);
    }

    /**
     * Obtenir la liste des services
     */
    getServiceNames() {
        return Array.from(this.services.keys());
    }

    /**
     * Obtenir les statistiques des services
     */
    getStats() {
        const total = this.services.size;
        const initialized = this.initialized.size;
        const singletons = Array.from(this.services.values())
            .filter(config => config.singleton).length;
        
        return {
            total,
            initialized,
            singletons,
            pending: total - initialized
        };
    }

    /**
     * Réinitialiser un service
     */
    reset(name) {
        const serviceConfig = this.services.get(name);
        
        if (serviceConfig && serviceConfig.singleton) {
            serviceConfig.instance = null;
            serviceConfig.initialized = false;
            this.initialized.delete(name);
            
            if (this.debugMode) {
                console.log(`🔄 Service: ${name} réinitialisé`);
            }
        }
    }

    /**
     * Réinitialiser tous les services
     */
    resetAll() {
        for (const [name, serviceConfig] of this.services) {
            if (serviceConfig.singleton) {
                serviceConfig.instance = null;
                serviceConfig.initialized = false;
            }
        }
        
        this.initialized.clear();
        
        if (this.debugMode) {
            console.log('🔄 Services: Tous réinitialisés');
        }
    }

    /**
     * Créer le gestionnaire de Service Worker
     */
    createServiceWorkerManager() {
        return {
            register: async () => {
                if ('serviceWorker' in navigator) {
                    try {
                        const registration = await navigator.serviceWorker.register('/sw.js');
                        console.log('Service Worker enregistré:', registration);
                        return registration;
                    } catch (error) {
                        console.error('Erreur Service Worker:', error);
                    }
                }
            },
            
            unregister: async () => {
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                        await registration.unregister();
                    }
                }
            }
        };
    }

    /**
     * Créer le service de conversion
     */
    createConversionService() {
        return {
            convert: async (html, css, options = {}) => {
                const apiManager = this.get('apiManager');
                const cacheManager = this.get('cacheManager');
                const stateManager = this.get('stateManager');
                
                stateManager.setConverting(true);
                
                try {
                    const cacheKey = Utils.generateHash(html + css + JSON.stringify(options));
                    
                    // Vérifier le cache
                    const cached = cacheManager.get(cacheKey);
                    if (cached) {
                        stateManager.incrementConversions();
                        return cached;
                    }
                    
                    // Effectuer la conversion
                    const result = await apiManager.convert(html, css, options);
                    
                    // Mettre en cache
                    cacheManager.set(cacheKey, result);
                    
                    stateManager.incrementConversions();
                    stateManager.set('conversion.lastResult', result);
                    
                    return result;
                } finally {
                    stateManager.setConverting(false);
                }
            },
            
            getPresets: () => {
                return Config.get('PRESETS', {});
            },
            
            applyPreset: (presetName) => {
                const presets = this.getPresets();
                const preset = presets[presetName];
                
                if (preset) {
                    const stateManager = this.get('stateManager');
                    stateManager.setConversionData(preset);
                    return true;
                }
                
                return false;
            }
        };
    }

    /**
     * Créer le service d'interface utilisateur
     */
    createUIService() {
        return {
            showLoading: (message = 'Chargement...') => {
                const stateManager = this.get('stateManager');
                stateManager.setLoading(true);
                // Logique d'affichage du loading
            },
            
            hideLoading: () => {
                const stateManager = this.get('stateManager');
                stateManager.setLoading(false);
            },
            
            showError: (error) => {
                const stateManager = this.get('stateManager');
                stateManager.setError(error);
                Utils.showToast(error, 'error');
            },
            
            showSuccess: (message) => {
                Utils.showToast(message, 'success');
            },
            
            toggleTheme: () => {
                const stateManager = this.get('stateManager');
                const currentTheme = stateManager.get('app.theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                stateManager.setTheme(newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
            },
            
            updatePreview: Utils.debounce((html, css) => {
                const previewFrame = document.getElementById('preview-frame');
                if (previewFrame) {
                    const doc = previewFrame.contentDocument;
                    doc.open();
                    doc.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>${css}</style>
                        </head>
                        <body>${html}</body>
                        </html>
                    `);
                    doc.close();
                }
            }, 300)
        };
    }

    /**
     * Créer le service de notification
     */
    createNotificationService() {
        return {
            show: (message, type = 'info', duration = 3000) => {
                Utils.showToast(message, type, duration);
            },
            
            showPersistent: (message, type = 'info') => {
                Utils.showToast(message, type, 0); // 0 = persistant
            },
            
            requestPermission: async () => {
                if ('Notification' in window) {
                    const permission = await Notification.requestPermission();
                    return permission === 'granted';
                }
                return false;
            },
            
            sendNotification: (title, options = {}) => {
                if ('Notification' in window && Notification.permission === 'granted') {
                    return new Notification(title, {
                        icon: '/icon-192.png',
                        badge: '/icon-192.png',
                        ...options
                    });
                }
            }
        };
    }

    /**
     * Créer le service de performance
     */
    createPerformanceService() {
        return {
            startMeasure: (name) => {
                performance.mark(`${name}-start`);
            },
            
            endMeasure: (name) => {
                performance.mark(`${name}-end`);
                performance.measure(name, `${name}-start`, `${name}-end`);
                
                const measure = performance.getEntriesByName(name)[0];
                return measure ? measure.duration : 0;
            },
            
            getMetrics: () => {
                return {
                    navigation: performance.getEntriesByType('navigation')[0],
                    paint: performance.getEntriesByType('paint'),
                    measures: performance.getEntriesByType('measure'),
                    memory: performance.memory ? {
                        used: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize,
                        limit: performance.memory.jsHeapSizeLimit
                    } : null
                };
            },
            
            clearMetrics: () => {
                performance.clearMarks();
                performance.clearMeasures();
            },
            
            monitorFPS: (callback) => {
                let lastTime = performance.now();
                let frames = 0;
                
                function measureFPS() {
                    frames++;
                    const currentTime = performance.now();
                    
                    if (currentTime >= lastTime + 1000) {
                        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                        callback(fps);
                        
                        frames = 0;
                        lastTime = currentTime;
                    }
                    
                    requestAnimationFrame(measureFPS);
                }
                
                requestAnimationFrame(measureFPS);
            }
        };
    }

    /**
     * Créer un proxy pour l'injection de dépendances
     */
    createProxy(serviceName) {
        return new Proxy({}, {
            get: (target, prop) => {
                const service = this.get(serviceName);
                return service[prop];
            }
        });
    }
}

// Instance globale
const serviceManager = new ServiceManager();

// Initialiser les services au chargement de la page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        serviceManager.initializeAll();
    });
} else {
    serviceManager.initializeAll();
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ServiceManager, serviceManager };
}

// Disponible globalement
window.ServiceManager = ServiceManager;
window.serviceManager = serviceManager;

// Raccourcis globaux pour les services les plus utilisés
window.$ = {
    config: () => serviceManager.get('config'),
    utils: () => serviceManager.get('utils'),
    state: () => serviceManager.get('stateManager'),
    events: () => serviceManager.get('eventManager'),
    api: () => serviceManager.get('apiManager'),
    cache: () => serviceManager.get('cacheManager'),
    ui: () => serviceManager.get('uiService'),
    convert: () => serviceManager.get('conversionService'),
    notify: () => serviceManager.get('notificationService'),
    perf: () => serviceManager.get('performanceService')
};