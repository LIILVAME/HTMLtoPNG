/**
 * Configuration centralisée pour HTMLtoPNG
 * Regroupe toutes les constantes et paramètres de configuration
 */

class Config {
    // Configuration générale de l'application
    static APP = {
        name: 'HTMLtoPNG Converter',
        version: '2.0.0',
        author: 'VAM',
        description: 'Convertisseur HTML vers PNG avancé'
    };

    // Configuration du cache
    static CACHE = {
        maxSize: 50,
        defaultTTL: 5 * 60 * 1000, // 5 minutes
        cleanupInterval: 60 * 1000, // 1 minute
        storageKey: 'htmltopng_cache'
    };

    // Configuration de l'historique
    static HISTORY = {
        maxItems: 50,
        storageKey: 'htmltopng_history',
        autoSave: true
    };

    // Configuration des analytics
    static ANALYTICS = {
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        maxDataPoints: 1000,
        sampleRate: 0.1, // 10%
        enableHeatmap: true,
        enableScrollTracking: true,
        enableFormTracking: true
    };

    // Configuration de la conversion
    static CONVERSION = {
        defaultWidth: 800,
        defaultHeight: 600,
        defaultFormat: 'png',
        defaultQuality: 1,
        maxFileSize: 50 * 1024 * 1024, // 50MB
        supportedFormats: ['png', 'jpeg', 'webp', 'pdf', 'svg'],
        timeout: 30000 // 30 secondes
    };

    // Configuration de l'interface utilisateur
    static UI = {
        toastDuration: 3000,
        animationDuration: 300,
        debounceDelay: 300,
        throttleDelay: 100,
        autoSaveDelay: 2000
    };

    // Configuration des préréglages
    static PRESETS = {
        mobile: { width: 375, height: 667, name: 'Mobile' },
        tablet: { width: 768, height: 1024, name: 'Tablette' },
        desktop: { width: 1920, height: 1080, name: 'Desktop' },
        instagram: { width: 1080, height: 1080, name: 'Instagram Post' },
        facebook: { width: 1200, height: 630, name: 'Facebook Cover' },
        twitter: { width: 1024, height: 512, name: 'Twitter Header' }
    };

    // Configuration des thèmes
    static THEMES = {
        light: {
            name: 'Clair',
            primary: '#3b82f6',
            secondary: '#64748b',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#1e293b'
        },
        dark: {
            name: 'Sombre',
            primary: '#60a5fa',
            secondary: '#94a3b8',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f1f5f9'
        }
    };

    // Configuration des raccourcis clavier
    static SHORTCUTS = {
        convert: 'Ctrl+Enter',
        save: 'Ctrl+S',
        copy: 'Ctrl+C',
        paste: 'Ctrl+V',
        undo: 'Ctrl+Z',
        redo: 'Ctrl+Y',
        togglePreview: 'Ctrl+P',
        toggleHistory: 'Ctrl+H',
        toggleTheme: 'Ctrl+T'
    };

    // Configuration des API externes
    static API = {
        timeout: 10000,
        retries: 3,
        retryDelay: 1000,
        rateLimit: {
            requests: 100,
            window: 60 * 1000 // 1 minute
        }
    };

    // Configuration de la sécurité
    static SECURITY = {
        maxInputLength: 1000000, // 1MB
        allowedTags: [
            'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'img', 'a', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
            'form', 'input', 'button', 'select', 'option', 'textarea'
        ],
        sanitizeHTML: true,
        validateCSS: true
    };

    // Configuration des performances
    static PERFORMANCE = {
        enableLazyLoading: true,
        enableWebWorkers: true,
        enableServiceWorker: true,
        maxConcurrentOperations: 3,
        memoryThreshold: 100 * 1024 * 1024, // 100MB
        enableProfiling: false
    };

    // Configuration du stockage
    static STORAGE = {
        prefix: 'htmltopng_',
        enableCompression: true,
        enableEncryption: false,
        quotaWarningThreshold: 0.8, // 80%
        cleanupOldData: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
    };

    // Configuration des notifications
    static NOTIFICATIONS = {
        enableBrowserNotifications: false,
        enableSoundNotifications: false,
        enableToastNotifications: true,
        position: 'top-right',
        maxVisible: 5
    };

    // Configuration de l'accessibilité
    static ACCESSIBILITY = {
        enableHighContrast: false,
        enableReducedMotion: false,
        enableScreenReader: true,
        fontSize: 'medium',
        keyboardNavigation: true
    };

    // Configuration de l'internationalisation
    static I18N = {
        defaultLanguage: 'fr',
        supportedLanguages: ['fr', 'en', 'es', 'de'],
        fallbackLanguage: 'en',
        enableRTL: false
    };

    // Configuration du développement
    static DEV = {
        enableDebugMode: false,
        enableVerboseLogging: false,
        enablePerformanceMonitoring: true,
        enableErrorReporting: true,
        mockAPI: false
    };

    /**
     * Obtenir la configuration pour un environnement spécifique
     */
    static getEnvironmentConfig() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return {
                ...this.DEV,
                enableDebugMode: true,
                enableVerboseLogging: true,
                mockAPI: true
            };
        }
        
        if (hostname.includes('staging') || hostname.includes('test')) {
            return {
                ...this.DEV,
                enableDebugMode: true,
                enableErrorReporting: true
            };
        }
        
        // Production
        return {
            ...this.DEV,
            enableDebugMode: false,
            enableVerboseLogging: false,
            enableErrorReporting: true,
            mockAPI: false
        };
    }

    /**
     * Fusionner la configuration avec des options personnalisées
     */
    static merge(customConfig = {}) {
        return {
            APP: { ...this.APP, ...customConfig.APP },
            CACHE: { ...this.CACHE, ...customConfig.CACHE },
            HISTORY: { ...this.HISTORY, ...customConfig.HISTORY },
            ANALYTICS: { ...this.ANALYTICS, ...customConfig.ANALYTICS },
            CONVERSION: { ...this.CONVERSION, ...customConfig.CONVERSION },
            UI: { ...this.UI, ...customConfig.UI },
            PRESETS: { ...this.PRESETS, ...customConfig.PRESETS },
            THEMES: { ...this.THEMES, ...customConfig.THEMES },
            SHORTCUTS: { ...this.SHORTCUTS, ...customConfig.SHORTCUTS },
            API: { ...this.API, ...customConfig.API },
            SECURITY: { ...this.SECURITY, ...customConfig.SECURITY },
            PERFORMANCE: { ...this.PERFORMANCE, ...customConfig.PERFORMANCE },
            STORAGE: { ...this.STORAGE, ...customConfig.STORAGE },
            NOTIFICATIONS: { ...this.NOTIFICATIONS, ...customConfig.NOTIFICATIONS },
            ACCESSIBILITY: { ...this.ACCESSIBILITY, ...customConfig.ACCESSIBILITY },
            I18N: { ...this.I18N, ...customConfig.I18N },
            DEV: { ...this.getEnvironmentConfig(), ...customConfig.DEV }
        };
    }

    /**
     * Valider la configuration
     */
    static validate(config = this) {
        const errors = [];
        
        // Validation des valeurs numériques
        if (config.CACHE.maxSize <= 0) {
            errors.push('CACHE.maxSize doit être supérieur à 0');
        }
        
        if (config.HISTORY.maxItems <= 0) {
            errors.push('HISTORY.maxItems doit être supérieur à 0');
        }
        
        if (config.CONVERSION.defaultWidth <= 0 || config.CONVERSION.defaultHeight <= 0) {
            errors.push('Les dimensions par défaut doivent être supérieures à 0');
        }
        
        // Validation des formats supportés
        if (!Array.isArray(config.CONVERSION.supportedFormats) || config.CONVERSION.supportedFormats.length === 0) {
            errors.push('Au moins un format de conversion doit être supporté');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Obtenir une valeur de configuration par chemin
     */
    static get(path, defaultValue = null) {
        const keys = path.split('.');
        let current = this;
        
        for (const key of keys) {
            if (current[key] === undefined) {
                return defaultValue;
            }
            current = current[key];
        }
        
        return current;
    }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}

// Disponible globalement
window.Config = Config;