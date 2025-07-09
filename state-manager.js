/**
 * Gestionnaire d'état centralisé
 * Implémente un pattern Observer pour la gestion d'état réactive
 */

class StateManager {
    constructor() {
        this.state = {};
        this.subscribers = new Map();
        this.middleware = [];
        this.history = [];
        this.maxHistorySize = 50;
        this.debugMode = Config.get('DEV.enableDebugMode', false);
        
        this.initializeDefaultState();
    }

    /**
     * Initialiser l'état par défaut
     */
    initializeDefaultState() {
        this.state = {
            // État de l'application
            app: {
                isLoading: false,
                error: null,
                theme: Utils.getFromStorage('theme', 'light'),
                language: Utils.getFromStorage('language', 'fr')
            },
            
            // État de la conversion
            conversion: {
                html: '',
                css: '',
                width: Config.get('CONVERSION.defaultWidth', 800),
                height: Config.get('CONVERSION.defaultHeight', 600),
                format: Config.get('CONVERSION.defaultFormat', 'png'),
                quality: Config.get('CONVERSION.defaultQuality', 1),
                preset: 'custom',
                isConverting: false,
                lastResult: null
            },
            
            // État de l'interface
            ui: {
                sidebarOpen: true,
                previewMode: 'live',
                historyPanelOpen: false,
                settingsPanelOpen: false,
                fullscreenMode: false,
                activeTab: 'html'
            },
            
            // État des performances
            performance: {
                lastConversionTime: 0,
                averageConversionTime: 0,
                totalConversions: 0,
                cacheHitRate: 0,
                memoryUsage: 0
            },
            
            // État des analytics
            analytics: {
                sessionStartTime: Date.now(),
                pageViews: 0,
                interactions: 0,
                conversions: 0,
                errors: 0
            }
        };
    }

    /**
     * Obtenir une valeur de l'état
     */
    get(path, defaultValue = undefined) {
        const keys = path.split('.');
        let current = this.state;
        
        for (const key of keys) {
            if (current === null || current === undefined || !(key in current)) {
                return defaultValue;
            }
            current = current[key];
        }
        
        return current;
    }

    /**
     * Définir une valeur dans l'état
     */
    set(path, value, options = {}) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        // Naviguer jusqu'au parent
        let current = this.state;
        for (const key of keys) {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        // Sauvegarder l'ancienne valeur
        const oldValue = current[lastKey];
        
        // Appliquer les middleware
        const processedValue = this.applyMiddleware(path, value, oldValue);
        
        // Définir la nouvelle valeur
        current[lastKey] = processedValue;
        
        // Ajouter à l'historique
        if (!options.skipHistory) {
            this.addToHistory(path, oldValue, processedValue);
        }
        
        // Notifier les abonnés
        this.notifySubscribers(path, processedValue, oldValue);
        
        // Sauvegarder dans localStorage si configuré
        if (options.persist) {
            this.persistState(path, processedValue);
        }
        
        if (this.debugMode) {
            console.log(`🔄 State: ${path} =`, processedValue, '(was:', oldValue, ')');
        }
        
        return processedValue;
    }

    /**
     * Mettre à jour plusieurs valeurs en une fois
     */
    update(updates, options = {}) {
        const batch = [];
        
        for (const [path, value] of Object.entries(updates)) {
            const oldValue = this.get(path);
            batch.push({ path, value, oldValue });
            
            // Appliquer la mise à jour sans notifier encore
            this.set(path, value, { ...options, skipNotification: true });
        }
        
        // Notifier tous les changements en une fois
        if (!options.skipNotification) {
            for (const { path, value, oldValue } of batch) {
                this.notifySubscribers(path, value, oldValue);
            }
        }
        
        if (this.debugMode) {
            console.log('🔄 State batch update:', updates);
        }
    }

    /**
     * S'abonner aux changements d'état
     */
    subscribe(path, callback, options = {}) {
        const subscriptionId = Utils.generateId('subscription');
        
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Map());
        }
        
        this.subscribers.get(path).set(subscriptionId, {
            callback,
            options,
            createdAt: Date.now()
        });
        
        // Appeler immédiatement avec la valeur actuelle si demandé
        if (options.immediate) {
            const currentValue = this.get(path);
            callback(currentValue, undefined, path);
        }
        
        if (this.debugMode) {
            console.log(`📡 State: Abonnement à ${path}`);
        }
        
        return subscriptionId;
    }

    /**
     * Se désabonner des changements d'état
     */
    unsubscribe(subscriptionId) {
        for (const [path, pathSubscribers] of this.subscribers) {
            if (pathSubscribers.has(subscriptionId)) {
                pathSubscribers.delete(subscriptionId);
                
                if (pathSubscribers.size === 0) {
                    this.subscribers.delete(path);
                }
                
                if (this.debugMode) {
                    console.log(`📡 State: Désabonnement de ${path}`);
                }
                
                return true;
            }
        }
        
        return false;
    }

    /**
     * Notifier les abonnés d'un changement
     */
    notifySubscribers(path, newValue, oldValue) {
        // Notifier les abonnés exacts
        const exactSubscribers = this.subscribers.get(path);
        if (exactSubscribers) {
            for (const [id, subscription] of exactSubscribers) {
                try {
                    subscription.callback(newValue, oldValue, path);
                } catch (error) {
                    console.error(`Erreur dans l'abonné ${id}:`, error);
                }
            }
        }
        
        // Notifier les abonnés aux chemins parents
        const pathParts = path.split('.');
        for (let i = pathParts.length - 1; i > 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            const parentSubscribers = this.subscribers.get(parentPath);
            
            if (parentSubscribers) {
                const parentValue = this.get(parentPath);
                
                for (const [id, subscription] of parentSubscribers) {
                    if (subscription.options.deep !== false) {
                        try {
                            subscription.callback(parentValue, undefined, parentPath);
                        } catch (error) {
                            console.error(`Erreur dans l'abonné parent ${id}:`, error);
                        }
                    }
                }
            }
        }
    }

    /**
     * Ajouter un middleware
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);
        
        if (this.debugMode) {
            console.log('🔧 State: Middleware ajouté');
        }
    }

    /**
     * Appliquer les middleware
     */
    applyMiddleware(path, value, oldValue) {
        let processedValue = value;
        
        for (const middleware of this.middleware) {
            try {
                processedValue = middleware(path, processedValue, oldValue, this.state);
            } catch (error) {
                console.error('Erreur dans le middleware:', error);
            }
        }
        
        return processedValue;
    }

    /**
     * Ajouter à l'historique
     */
    addToHistory(path, oldValue, newValue) {
        // Fonction helper pour cloner en toute sécurité
        const safeClone = (value) => {
            if (value === undefined || value === null) {
                return value;
            }
            try {
                // Vérifier que JSON.stringify ne retourne pas undefined
                const stringified = JSON.stringify(value);
                if (stringified === undefined) {
                    return value;
                }
                return JSON.parse(stringified);
            } catch (error) {
                console.warn('Impossible de cloner la valeur:', value, error);
                return value;
            }
        };
        
        this.history.push({
            timestamp: Date.now(),
            path,
            oldValue: safeClone(oldValue),
            newValue: safeClone(newValue)
        });
        
        // Limiter la taille de l'historique
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * Annuler le dernier changement
     */
    undo() {
        if (this.history.length === 0) return false;
        
        const lastChange = this.history.pop();
        this.set(lastChange.path, lastChange.oldValue, { skipHistory: true });
        
        if (this.debugMode) {
            console.log('↶ State: Undo', lastChange);
        }
        
        return true;
    }

    /**
     * Persister l'état dans localStorage
     */
    persistState(path, value) {
        const storageKey = `${Config.get('STORAGE.prefix', 'htmltopng_')}state_${path.replace(/\./g, '_')}`;
        Utils.setToStorage(storageKey, value);
    }

    /**
     * Restaurer l'état depuis localStorage
     */
    restoreState(path) {
        const storageKey = `${Config.get('STORAGE.prefix', 'htmltopng_')}state_${path.replace(/\./g, '_')}`;
        const value = Utils.getFromStorage(storageKey);
        
        if (value !== null) {
            this.set(path, value, { skipHistory: true });
            return true;
        }
        
        return false;
    }

    /**
     * Réinitialiser l'état
     */
    reset(path = null) {
        if (path) {
            // Réinitialiser un chemin spécifique
            const defaultState = {};
            this.initializeDefaultState();
            const defaultValue = this.get(path);
            this.state = this.previousState; // Restaurer l'état précédent
            this.set(path, defaultValue);
        } else {
            // Réinitialiser tout l'état
            this.state = {};
            this.initializeDefaultState();
            this.history = [];
            
            // Notifier tous les abonnés
            for (const [path] of this.subscribers) {
                const value = this.get(path);
                this.notifySubscribers(path, value, undefined);
            }
        }
        
        if (this.debugMode) {
            console.log('🔄 State: Reset', path || 'all');
        }
    }

    /**
     * Obtenir des statistiques sur l'état
     */
    getStats() {
        return {
            stateSize: JSON.stringify(this.state).length,
            subscribersCount: Array.from(this.subscribers.values())
                .reduce((total, pathSubs) => total + pathSubs.size, 0),
            historySize: this.history.length,
            middlewareCount: this.middleware.length
        };
    }

    /**
     * Exporter l'état
     */
    export() {
        return {
            state: JSON.parse(JSON.stringify(this.state)),
            timestamp: Date.now(),
            version: Config.get('APP.version', '1.0.0')
        };
    }

    /**
     * Importer l'état
     */
    import(exportedState) {
        try {
            if (exportedState.state) {
                this.state = exportedState.state;
                
                // Notifier tous les abonnés
                for (const [path] of this.subscribers) {
                    const value = this.get(path);
                    this.notifySubscribers(path, value, undefined);
                }
                
                if (this.debugMode) {
                    console.log('📥 State: Import réussi');
                }
                
                return true;
            }
        } catch (error) {
            console.error('Erreur lors de l\'import de l\'état:', error);
        }
        
        return false;
    }

    /**
     * Méthodes de convenance
     */
    
    // État de l'application
    setLoading(isLoading) {
        this.set('app.isLoading', isLoading);
    }
    
    setError(error) {
        this.set('app.error', error);
        if (error) {
            this.set('analytics.errors', this.get('analytics.errors', 0) + 1);
        }
    }
    
    setTheme(theme) {
        this.set('app.theme', theme, { persist: true });
    }
    
    // État de la conversion
    setConversionData(data) {
        this.update({
            'conversion.html': data.html || '',
            'conversion.css': data.css || '',
            'conversion.width': data.width || Config.get('CONVERSION.defaultWidth'),
            'conversion.height': data.height || Config.get('CONVERSION.defaultHeight'),
            'conversion.format': data.format || Config.get('CONVERSION.defaultFormat'),
            'conversion.quality': data.quality || Config.get('CONVERSION.defaultQuality'),
            'conversion.preset': data.preset || 'custom'
        });
    }
    
    setConverting(isConverting) {
        this.set('conversion.isConverting', isConverting);
    }
    
    // État de l'interface
    toggleSidebar() {
        this.set('ui.sidebarOpen', !this.get('ui.sidebarOpen'));
    }
    
    setActiveTab(tab) {
        this.set('ui.activeTab', tab);
    }
    
    // Analytics
    incrementInteractions() {
        this.set('analytics.interactions', this.get('analytics.interactions', 0) + 1);
    }
    
    incrementConversions() {
        this.set('analytics.conversions', this.get('analytics.conversions', 0) + 1);
    }
}

// Instance globale
const stateManager = new StateManager();

// Middleware par défaut pour la validation
stateManager.addMiddleware((path, value, oldValue, state) => {
    // Validation des dimensions
    if (path === 'conversion.width' || path === 'conversion.height') {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue <= 0) {
            console.warn(`Valeur invalide pour ${path}:`, value);
            return oldValue; // Garder l'ancienne valeur
        }
        return Math.min(numValue, 4000); // Limiter à 4000px
    }
    
    // Validation du format
    if (path === 'conversion.format') {
        const supportedFormats = Config.get('CONVERSION.supportedFormats', ['png']);
        if (!supportedFormats.includes(value)) {
            console.warn(`Format non supporté: ${value}`);
            return oldValue;
        }
    }
    
    return value;
});

// Restaurer l'état persisté au démarrage
stateManager.restoreState('app.theme');
stateManager.restoreState('app.language');

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StateManager, stateManager };
}

// Disponible globalement
window.StateManager = StateManager;
window.stateManager = stateManager;